import React from 'react';
import { Play, Pause, Square } from 'lucide-react';

interface TimerControlsProps {
  isRunning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  isRunning,
  startTimer,
  pauseTimer,
  resetTimer,
}) => {
  return (
    <div className="flex justify-center gap-3 sm:gap-4 mb-6 sm:mb-8">
      {!isRunning ? (
        <button
          onClick={startTimer}
          className="group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-white text-sm sm:text-base"
        >
          <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          Start Focus
        </button>
      ) : (
        <button
          onClick={pauseTimer}
          className="group flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 text-white text-sm sm:text-base"
        >
          <Pause className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
          Pause
        </button>
      )}
      
      <button
        onClick={resetTimer}
        className="group flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-medium transition-all duration-200 border border-white border-opacity-20 hover:scale-105 text-white text-sm sm:text-base"
        style={{
          background: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
        }}
      >
        <Square className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
        Reset
      </button>
    </div>
  );
};

export default TimerControls; 