import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LogOut, AlertTriangle, Activity, MapPin, BrainCircuit, CheckCircle2, Clock, Trash2 } from 'lucide-react';
import SignalWaveform from './SignalWaveform';

interface Complaint {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  department: string;
  priority: string;
  status: string;
  evidenceScore: number;
  aiSummary: string;
  address: string;
  createdAt: string;
}

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDept, setFilterDept] = useState('ALL');
  
  const navigate = useNavigate();
  const userString = localStorage.getItem('smartCityUser');
  const user = userString ? JSON.parse(userString) : null;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('smartCityToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/complaints/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setComplaints(response.data.complaints);
    } catch (err: any) {
      setError('Failed to load telemetry data. Please ensure your access token is valid.');
    } finally {
      setLoading(false);
    }
  };

  // --- NEW: Handle Status Updates ---
  const handleStatusUpdate = async (complaintId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('smartCityToken');
      
      // Tell the Node.js backend to update the database
      await axios.put(`http://localhost:5000/api/complaints/${complaintId}/status`, 
        { status: newStatus, remark: `Status updated to ${newStatus} via Live Command Center.` },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Instantly update the UI locally without refreshing the page
      setComplaints(prevComplaints => 
        prevComplaints.map(complaint => 
          complaint.id === complaintId ? { ...complaint, status: newStatus } : complaint
        )
      );

    } catch (err) {
      console.error("Failed to update status", err);
      alert("System Error: Could not update incident status.");
    }
  };

  // --- NEW: Handle Deletion (Admin Only) ---
  const handleDeleteComplaint = async (complaintId: string) => {
    if (!window.confirm("Are you sure you want to decommission this signal? This will permanently purge the record from the database.")) {
      return;
    }
    
    try {
      const token = localStorage.getItem('smartCityToken');
      
      // Call the DELETE API
      await axios.delete(`http://localhost:5000/api/complaints/${complaintId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Instantly remove the complaint from local state list
      setComplaints(prevComplaints => 
        prevComplaints.filter(complaint => complaint.id !== complaintId)
      );

    } catch (err) {
      console.error("Failed to delete complaint", err);
      alert("System Error: Could not decommission incident signal.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('smartCityToken');
    localStorage.removeItem('smartCityUser');
    navigate('/login');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'MEDIUM': return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'LOW': return 'text-green-400 bg-green-400/10 border-green-400/30';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    }
  };
  const displayedComplaints = filterDept === 'ALL'
    ? complaints
    : complaints.filter(c => c.department === filterDept);

  const totalIncidents = displayedComplaints.length;
  const resolvedIncidents = displayedComplaints.filter(c => c.status === 'RESOLVED').length;
  const activeIncidents = totalIncidents - resolvedIncidents;

  return (
    <div className="w-full max-w-6xl w-full">
      <div className="flex justify-between items-center mb-8 p-6 bg-slate-900/60 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="text-neonCyan w-6 h-6" />
            Live Command Center
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Logged in as: <span className="text-neonCyan font-semibold">{user?.name}</span> ({user?.department || 'ALL'} Department)
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Disconnect
        </button>
      </div>
      {/* --- LIVE TELEMETRY BANNER --- */}
      {!loading && !error && (
        <div className="relative w-full overflow-hidden bg-slate-900/60 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl mb-8 p-6">
          
          {/* Background Oscilloscope Animation */}
          <SignalWaveform />
          
          {/* Foreground Stats */}
          <div className="relative z-10 grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center">
              <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">Total Signals</span>
              <span className="text-4xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{totalIncidents}</span>
            </div>
            
            <div className="flex flex-col items-center justify-center border-x border-slate-700/50">
              <span className="text-amber-400/80 text-sm font-semibold uppercase tracking-wider mb-1">Active / Pending</span>
              <span className="text-4xl font-black text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]">{activeIncidents}</span>
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-green-400/80 text-sm font-semibold uppercase tracking-wider mb-1">Successfully Resolved</span>
              <span className="text-4xl font-black text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.3)]">{resolvedIncidents}</span>
            </div>
          </div>
        </div>
      )}

      {/* --- NEW: ADMIN MASTER FILTER --- */}
      {user?.role === 'ADMIN' && (
        <div className="mb-6 flex items-center gap-4 p-4 bg-slate-900/40 backdrop-blur-md border border-slate-700 rounded-xl">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Master Override Filter:</span>
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="bg-slate-950 border border-slate-700 text-neonCyan text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-neonCyan transition-all"
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            <option value="ROAD">STREET & ROAD (ROAD)</option>
            <option value="SANITATION">WASTE & SANITATION (SANITATION)</option>
            <option value="WATER_SUPPLY">WATER & PLUMBING (WATER_SUPPLY)</option>
            <option value="ELECTRICAL">POWER & LIGHTING (ELECTRICAL)</option>
          </select>
        </div>
      )}
      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse">Synchronizing with mainframe...</div>
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-center">{error}</div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/40 border border-slate-700 rounded-2xl text-slate-400">
          No active incidents detected in your jurisdiction.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedComplaints.map((complaint) => (
            <div key={complaint.id} className="p-6 bg-slate-900/40 backdrop-blur-md border border-slate-700 hover:border-neonCyan/50 rounded-2xl transition-all shadow-xl flex flex-col justify-between">
              
              <div>
                {complaint.imageUrl && (
                  <div className="w-full h-48 mb-4 rounded-xl overflow-hidden border border-slate-700">
                    <img 
                      src={complaint.imageUrl} 
                      alt="Evidence" 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">{complaint.title}</h3>
                  <span className={`text-xs font-bold px-3 py-1 border rounded-full flex items-center gap-1 ${getPriorityColor(complaint.priority)}`}>
                    {complaint.priority === 'HIGH' && <AlertTriangle className="w-3 h-3" />}
                    {complaint.priority}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{complaint.description}</p>
                
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {complaint.address || 'GPS Coordinates Provided'}
                </div>
              </div>

              <div>
                <div className="mt-4 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-4 h-4 text-neonCyan" />
                    <span className="text-xs font-semibold text-neonCyan uppercase tracking-wider">AI Diagnostics</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">"{complaint.aiSummary}"</p>
                  <div className="mt-3 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Confidence: <span className="text-white font-mono">{complaint.evidenceScore}%</span></span>
                    <span className="text-slate-400">Status: <span className="text-white font-bold">{complaint.status}</span></span>
                  </div>
                </div>

                 {/* --- NEW: Action Control Panel --- */}
                <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col gap-3">
                  <div className="flex gap-3">
                    {complaint.status === 'ROUTED' && (
                      <button 
                        onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}
                        className="flex-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <Clock className="w-4 h-4" />
                        Dispatch Team
                      </button>
                    )}
                    
                    {(complaint.status === 'ROUTED' || complaint.status === 'IN_PROGRESS') && (
                      <button 
                        onClick={() => handleStatusUpdate(complaint.id, 'RESOLVED')}
                        className="flex-1 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Resolved
                      </button>
                    )}

                    {complaint.status === 'RESOLVED' && (
                      <div className="flex-1 py-2.5 bg-slate-800/50 text-slate-500 border border-slate-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 cursor-not-allowed">
                        <CheckCircle2 className="w-4 h-4" />
                        Incident Closed
                      </div>
                    )}
                  </div>
                  
                  {user?.role === 'ADMIN' && (
                    <button 
                      onClick={() => handleDeleteComplaint(complaint.id)}
                      className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Decommission Signal (Purge DB)
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}