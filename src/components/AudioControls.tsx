import React from 'react';
import { AudioTypeDropdown } from './AudioTypeDropdown';
import type { AudioType } from './AudioTypeDropdown';

interface AudioControlsProps {
  audioEnabled: boolean;
  setAudioEnabled: (enabled: boolean) => void;
  currentAudioType: AudioType;
  onAudioTypeChange: (type: AudioType) => void;
  testAudio: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  audioEnabled,
  setAudioEnabled,
  currentAudioType,
  onAudioTypeChange,
  testAudio,
}) => {
  return (
    <div 
      className="rounded-2xl p-4 sm:p-6 border border-white border-opacity-10"
      style={{
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
      }}
    >
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-light text-white mb-1 sm:mb-2">Audio Control</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <AudioTypeDropdown
          audioEnabled={audioEnabled}
          currentType={currentAudioType}
          onTypeChange={onAudioTypeChange}
          onToggle={() => setAudioEnabled(!audioEnabled)}
        />

        <button
          onClick={testAudio}
          className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
        >
          Test 3s
        </button>
      </div>
    </div>
  );
}; 