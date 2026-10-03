import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle2, AlertCircle, LogOut, Star } from 'lucide-react';

interface FeedbackData {
  id: string;
  rating: number;
  comments?: string | null;
  createdAt: string;
}

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  feedback?: FeedbackData | null;
}

export default function CitizenHistory() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Feedback form state
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');
  const [successFeedbackId, setSuccessFeedbackId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyHistory();
  }, []);

  const fetchMyHistory = async () => {
    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/complaints/my-history', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints || []);
    } catch (err) {
      setError('Failed to load your history.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartCityToken');
    localStorage.removeItem('smartCityUser');
    navigate('/login');
  };

  const openFeedbackForm = (complaintId: string) => {
    setActiveFeedbackId(complaintId);
    setRating(0);
    setHoverRating(0);
    setComment('');
    setFeedbackError('');
    setSuccessFeedbackId(null);
  };

  const closeFeedbackForm = () => {
    setActiveFeedbackId(null);
    setRating(0);
    setHoverRating(0);
    setComment('');
    setFeedbackError('');
  };

  const handleSubmitFeedback = async (complaintId: string) => {
    // 1. Validation: Rating required and must be 1 to 5
    if (!rating || rating < 1 || rating > 5) {
      setFeedbackError('Please select a rating between 1 and 5 stars before submitting.');
      return;
    }

    setSubmittingFeedback(true);
    setFeedbackError('');

    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/complaints/${complaintId}/feedback`,
        {
          rating,
          comment: comment.trim() || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const savedFeedback = response.data.feedback;

      // Update local complaint with new feedback
      setComplaints((prev) =>
        prev.map((c) =>
          c.id === complaintId
            ? { ...c, feedback: savedFeedback }
            : c
        )
      );

      setSuccessFeedbackId(complaintId);
      setActiveFeedbackId(null);
    } catch (err: any) {
      if (err.response?.status === 409) {
        setFeedbackError('Feedback has already been submitted for this complaint.');
      } else if (err.response?.data?.error) {
        setFeedbackError(err.response.data.error);
      } else {
        setFeedbackError('Failed to submit feedback. Please try again.');
      }
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'RESOLVED': 
        return { color: 'text-green-500 dark:text-green-400 bg-green-500/10 border-green-500/30', icon: <CheckCircle2 className="w-4 h-4" />, text: 'Resolved' };
      case 'IN_PROGRESS': 
        return { color: 'text-amber-500 dark:text-amber-400 bg-amber-500/10 border-amber-500/30', icon: <Clock className="w-4 h-4" />, text: 'In Progress' };
      default: 
        return { color: 'text-slate-500 dark:text-slate-400 bg-slate-500/10 border-slate-500/30', icon: <AlertCircle className="w-4 h-4" />, text: 'Routed to AI' };
    }
  };

  return (
    <div className="w-full max-w-4xl p-4 sm:p-6 transition-colors">
      
      {/* Navigation Bar */}
      <div className="flex justify-between items-center mb-6 sm:mb-8 bg-white dark:bg-slate-900/60 backdrop-blur-lg border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-sm dark:shadow-xl">
        <Link to="/citizen/report" className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-neonCyan transition-colors">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          Report Another Issue
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          Log Out
        </button>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">My Report History</h2>

      {loading ? (
        <div className="text-slate-500 dark:text-slate-400 animate-pulse text-sm">Loading your history...</div>
      ) : error ? (
        <div className="text-red-500 dark:text-red-400 text-sm p-4 bg-red-500/10 border border-red-500/30 rounded-xl">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 dark:text-slate-400 text-sm">
          You haven't submitted any reports yet.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((complaint) => {
            const statusStyle = getStatusDisplay(complaint.status);
            const isResolved = complaint.status === 'RESOLVED';
            const hasFeedback = Boolean(complaint.feedback);
            const isFormOpen = activeFeedbackId === complaint.id;
            const isJustSubmitted = successFeedbackId === complaint.id;

            return (
              <div 
                key={complaint.id} 
                className="p-4 sm:p-5 bg-white dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-xl hover:border-slate-300 dark:hover:border-slate-500 shadow-sm dark:shadow-md transition-all"
              >
                {/* Header Row: Title & Status */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                  <div className="flex-1">
                    <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block mb-1">
                      Complaint #{complaint.id.slice(0, 8).toUpperCase()}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">{complaint.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{complaint.description}</p>
                    <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 mt-2 block">
                      Submitted on: {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className={`px-3 sm:px-4 py-1.5 sm:py-2 border rounded-lg flex items-center gap-2 font-bold text-xs sm:text-sm whitespace-nowrap self-start ${statusStyle.color}`}>
                    {statusStyle.icon}
                    {statusStyle.text}
                  </div>
                </div>

                {/* Just Submitted Success Banner */}
                {isJustSubmitted && (
                  <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3 text-left animate-in fade-in duration-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ✓ Feedback submitted
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                        Thank you for helping us improve our civic services.
                      </p>
                    </div>
                  </div>
                )}

                {/* RESOLVED CASE 1: Feedback already submitted (Read-Only) */}
                {isResolved && hasFeedback && (
                  <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-xl flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Feedback</span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Feedback submitted
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= (complaint.feedback?.rating || 0)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-amber-500 ml-1.5">
                        {complaint.feedback?.rating} / 5
                      </span>
                    </div>

                    {complaint.feedback?.comments && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        "{complaint.feedback.comments}"
                      </p>
                    )}
                  </div>
                )}

                {/* RESOLVED CASE 2: Resolved, no feedback submitted yet */}
                {isResolved && !hasFeedback && !isFormOpen && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                    <button
                      onClick={() => openFeedbackForm(complaint.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Give Feedback
                    </button>
                  </div>
                )}

                {/* RESOLVED CASE 3: Active Feedback Form */}
                {isResolved && !hasFeedback && isFormOpen && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl space-y-3.5">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        Was your issue resolved?
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Select a star rating to help us gauge service quality.
                      </p>
                    </div>

                    {/* Interactive Star Rating Selector */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => {
                              setRating(star);
                              setFeedbackError('');
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-transform active:scale-95"
                            aria-label={`${star} star${star > 1 ? 's' : ''}`}
                          >
                            <Star
                              className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                                star <= (hoverRating || rating)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600 hover:text-amber-300'
                              }`}
                            />
                          </button>
                        ))}
                        {rating > 0 && (
                          <span className="text-xs font-bold text-amber-500 ml-2">
                            {rating} {rating === 1 ? 'star' : 'stars'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Optional Comment Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Your feedback <span className="text-slate-400 dark:text-slate-500 font-normal">(optional)</span>
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your experience..."
                        className="w-full text-xs sm:text-sm p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 resize-none transition-colors"
                      />
                    </div>

                    {/* Error Banner */}
                    {feedbackError && (
                      <div className="p-2.5 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{feedbackError}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        disabled={submittingFeedback}
                        onClick={() => handleSubmitFeedback(complaint.id)}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98]"
                      >
                        {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                      </button>
                      <button
                        type="button"
                        disabled={submittingFeedback}
                        onClick={closeFeedbackForm}
                        className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}