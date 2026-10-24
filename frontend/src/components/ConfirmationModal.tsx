import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-md p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-3.5">
          <div className={`p-3 rounded-2xl shrink-0 ${
            isDestructive 
              ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
              {message}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 disabled:bg-red-400'
                : 'bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-400'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
