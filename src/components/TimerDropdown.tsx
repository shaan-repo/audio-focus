import React from 'react';
import { Timer, ChevronDown } from 'lucide-react';

interface TimerPreset {
  label: string;
  focus: number;
  break: number;
}

interface TimerDropdownProps {
  isBreak: boolean;
  currentPreset: TimerPreset;
  onPresetChange: (preset: TimerPreset) => void;
}

const PRESETS: TimerPreset[] = [
  { label: 'Classic (25/5)', focus: 25, break: 5 },
  { label: 'Deep Work (50/10)', focus: 50, break: 10 },
  { label: 'Flow State (90/20)', focus: 90, break: 20 },
  { label: 'Quick (15/3)', focus: 15, break: 3 },
];

export const TimerDropdown: React.FC<TimerDropdownProps> = ({
  isBreak,
  currentPreset,
  onPresetChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePresetSelect = (preset: TimerPreset) => {
    onPresetChange(preset);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium border ${
          isBreak 
            ? 'text-emerald-300 border-emerald-400 border-opacity-30' 
            : 'text-purple-300 border-purple-400 border-opacity-30'
        }`}
        style={{
          background: isBreak 
            ? 'rgba(16, 185, 129, 0.15)' 
            : 'rgba(147, 51, 234, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        <Timer className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
        {currentPreset.label}
        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
      </button>

      {isOpen && (
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 sm:w-60 max-w-[90vw] rounded-xl overflow-hidden z-50"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handlePresetSelect(preset)}
              className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium transition-colors ${
                preset.label === currentPreset.label
                  ? 'text-purple-100 bg-purple-500/20'
                  : 'text-purple-50 hover:bg-purple-500/10'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 