import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  compact?: boolean;
}

export default function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useTheme();

  if (compact) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        id="theme-toggle-compact-btn"
        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all shadow-xs flex items-center justify-center cursor-pointer shrink-0"
        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-cyan-600" />
        )}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-300 dark:border-slate-700 shadow-inner transition-colors">
      <button
        type="button"
        onClick={() => setTheme('light')}
        id="theme-toggle-light-btn"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          theme === 'light'
            ? 'bg-white text-amber-600 shadow-sm border border-slate-200'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Switch to Light Mode"
        aria-label="Light mode"
      >
        <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400'}`} />
        <span>Light</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme('dark')}
        id="theme-toggle-dark-btn"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          theme === 'dark'
            ? 'bg-slate-950 text-cyan-400 shadow-sm border border-slate-700'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
        title="Switch to Dark Mode"
        aria-label="Dark mode"
      >
        <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-cyan-400' : 'text-slate-400'}`} />
        <span>Dark</span>
      </button>

      <button
        type="button"
        onClick={toggleTheme}
        className="sr-only"
        aria-label="Toggle Theme"
      >
        Toggle
      </button>
    </div>
  );
}
