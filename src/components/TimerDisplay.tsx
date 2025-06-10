import React from 'react';
import { Timer } from 'lucide-react';
import { TimerDropdown } from './TimerDropdown';

interface TimerDisplayProps {
  timeLeft: number;
  isBreak: boolean;
  sessions: number;
  formatTime: (seconds: number) => string;
  currentPreset: { label: string; focus: number; break: number };
  onPresetChange: (preset: { label: string; focus: number; break: number }) => void;
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timeLeft,
  isBreak,
  sessions,
  formatTime,
  currentPreset,
  onPresetChange,
}) => {
  return (
    <div 
      className="rounded-2xl p-5 sm:p-10 border border-white border-opacity-10"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="text-center">
        <div className="mb-5 sm:mb-7">
          <TimerDropdown
            isBreak={isBreak}
            currentPreset={currentPreset}
            onPresetChange={onPresetChange}
          />
        </div>

        <div className="relative mb-6 sm:mb-8">
          <div className="text-6xl sm:text-8xl font-extralight text-white mb-2 sm:mb-3 tracking-wider" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
            {formatTime(timeLeft)}
          </div>
          {/* Subtle progress ring - hidden on mobile for space */}
          <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
            <div 
              className="w-84 h-84 rounded-full"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            ></div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="text-center">
          <div className="text-2xl sm:text-3xl font-light text-white mb-1">{sessions}</div>
          <div className="text-purple-200 text-xs sm:text-sm">Sessions Completed</div>
        </div>
      </div>
    </div>
  );
}; 