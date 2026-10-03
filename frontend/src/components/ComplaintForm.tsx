import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Send, Loader2, Image as ImageIcon, LogOut, Mic, MicOff } from 'lucide-react';
import LocationSelector from './LocationSelector';

export default function ComplaintForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<any>(null);
  
  // --- NEW: Image Upload States ---
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cloudImageUrl, setCloudImageUrl] = useState<string | null>(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const handleLogout = () => {
  localStorage.removeItem('smartCityToken');
  localStorage.removeItem('smartCityUser');
  navigate('/login');
};
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleLocationFound = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
  };
  // --- NEW: Voice-to-Text Integration ---
  const handleVoiceRecord = () => {
    const SpeechRecognitionCtor = (
      window as Window & typeof globalThis & {
        SpeechRecognition?: { new (): any };
        webkitSpeechRecognition?: { new (): any };
      }
    ).SpeechRecognition ||
      (window as Window & typeof globalThis & {
        SpeechRecognition?: { new (): any };
        webkitSpeechRecognition?: { new (): any };
      }).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setMessage('⚠️ Voice recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // --- NEW: Background Cloudinary Upload ---
  const handleImageSelect = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // Show Preview
  setPreviewUrl(URL.createObjectURL(file));
  setIsUploadingImg(true);
  setMessage("");

  // Cloudinary Details
  const CLOUD_NAME = "z8agz77l";
  const UPLOAD_PRESET = "smart_city_upload";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setCloudImageUrl(response.data.secure_url);
    setMessage("✅ Image uploaded successfully!");

    console.log("Cloudinary URL:", response.data.secure_url);
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);

    if (error.response) {
      console.log(error.response.data);

      setMessage(
        `❌ ${
          error.response.data.error?.message ||
          "Image upload failed."
        }`
      );
    } else {
      setMessage("❌ Unable to connect to Cloudinary.");
    }

    setPreviewUrl(null);
    setCloudImageUrl(null);
  } finally {
    setIsUploadingImg(false);
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!navigator.onLine) {
      setMessage("❌ You're offline. Internet connection is required to submit complaints.");
      return;
    }

    if (!location) {
      setMessage('⚠️ Please provide your GPS location first.');
      return;
    }
    
    if (isUploadingImg) {
      setMessage('⚠️ Please wait for the image to finish uploading.');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const secureToken = localStorage.getItem('smartCityToken');
      
      if (!secureToken) {
        setMessage('⚠️ Authentication error. Please log in again.');
        setIsSubmitting(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5000/api/complaints/submit',
        {
          title: title,
          description: description,
          // Use the real cloud image, or fallback to placeholder if they didn't upload one
          imageUrl: cloudImageUrl || "https://example.com/placeholder-pothole.jpg", 
          latitude: location.lat,
          longitude: location.lng,
          address: location.address
        },
        { headers: { Authorization: `Bearer ${secureToken}` } }
      );

      setMessage(`✅ ${response.data.message}`);
      setTitle('');
      setDescription('');
      setPreviewUrl(null);
      setCloudImageUrl(null);
      
    } catch (error: any) {
      if (!navigator.onLine || error.code === 'ERR_NETWORK') {
        setMessage("❌ Network unavailable. Please check your internet connection and try again.");
      } else {
        setMessage('❌ Failed to submit. Check if backend/AI is running.');
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg p-6 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl shadow-xl dark:shadow-2xl transition-colors">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Report an Issue</h2>

      <div className="mb-6 flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800">
        <Link to="/history" className="text-sm font-semibold text-cyan-600 dark:text-neonCyan hover:underline transition-colors">
          View My Previous Reports →
        </Link>
        <button 
          type="button"
          onClick={handleLogout} 
          className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Issue Title</label>
          <input 
            type="text" 
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors"
            placeholder="e.g., Massive pothole on Main St."
          />
        </div>

        {/* --- UPGRADED: Description Input with Voice --- */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-400">Description</label>
            <button
              type="button"
              onClick={handleVoiceRecord}
              className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md transition-all ${isListening ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-neonCyan hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700'}`}
            >
              {isListening ? <><MicOff className="w-3 h-3" /> Listening...</> : <><Mic className="w-3 h-3" /> Voice Input</>}
            </button>
          </div>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-neonCyan transition-colors resize-none"
            placeholder="Provide details or tap 'Voice Input' to speak..."
          />
        </div>

        {/* --- NEW: Hidden Input & Image Preview UI --- */}
        <div>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden" 
          />
          
          {previewUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 group">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
              {isUploadingImg && (
                <div className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center backdrop-blur-sm">
                  <Loader2 className="w-8 h-8 text-cyan-400 dark:text-neonCyan animate-spin mb-2" />
                  <span className="text-sm font-bold text-white">Uploading Photo...</span>
                </div>
              )}
              {!isUploadingImg && (
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 right-3 bg-slate-900/80 text-white text-xs px-3 py-1.5 rounded-md border border-slate-600 hover:border-cyan-400 transition-all backdrop-blur-md"
                >
                  Change Image
                </button>
              )}
            </div>
          ) : (
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-neonCyan hover:border-cyan-500 dark:hover:border-neonCyan hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950"
            >
              <ImageIcon className="w-6 h-6" />
              <span className="text-sm">Take a Photo or Upload Image</span>
            </button>
          )}
        </div>

        <LocationSelector onLocationFound={handleLocationFound} />

        <button 
          type="submit" 
          disabled={isSubmitting || isUploadingImg}
          className="w-full mt-4 py-3 bg-cyan-600 dark:bg-neonCyan hover:bg-cyan-500 dark:hover:bg-cyan-400 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white dark:text-slate-900 font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI is Analyzing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit to Smart City AI
            </>
          )}
        </button>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${message.includes('✅') ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
            {message}
          </div>
        )}

      </form>
    </div>
  );
}