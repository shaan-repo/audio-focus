import React, { useState, useRef, useEffect } from 'react';
import { Music, ChevronDown } from 'lucide-react';

export type AudioType = 'binaural' | 'white' | 'pink' | 'rain';

interface AudioTypeOption {
  label: string;
  value: AudioType;
  description: string;
}

interface AudioTypeDropdownProps {
  audioEnabled: boolean;
  currentType: AudioType;
  onTypeChange: (type: AudioType) => void;
  onToggle: () => void;
}

const AUDIO_TYPES: AudioTypeOption[] = [
  { 
    label: 'Binaural Beats',
    value: 'binaural',
    description: '40Hz for focus, 10Hz for relaxation'
  },
  { 
    label: 'White Noise',
    value: 'white',
    description: 'Consistent background noise'
  },
  { 
    label: 'Pink Noise',
    value: 'pink',
    description: 'Softer, more natural sound'
  },
  { 
    label: 'Rain Sounds',
    value: 'rain',
    description: 'Gentle rainfall ambience'
  }
];

export const AudioTypeDropdown: React.FC<AudioTypeDropdownProps> = ({
  audioEnabled,
  currentType,
  onTypeChange,
  //onToggle, COME BACK TO THIS AS WELL <- NEED onToggle FOR LATER
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const buttonRef = useRef<HTMLButtonElement>(null);

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setDropdownPosition(spaceBelow < 200 && spaceAbove > spaceBelow ? 'top' : 'bottom');
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      return () => window.removeEventListener('resize', updateDropdownPosition);
    }
  }, [isOpen]);

  const handleTypeSelect = (type: AudioType) => {
    onTypeChange(type);
    setIsOpen(false);
  };

  const currentOption = AUDIO_TYPES.find(option => option.value === currentType);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 rounded-full text-xs sm:text-sm font-medium border ${
          audioEnabled
            ? 'text-purple-300 border-purple-400 border-opacity-30'
            : 'text-gray-400 border-gray-500 border-opacity-30'
        }`}
        style={{
          background: audioEnabled
            ? 'rgba(147, 51, 234, 0.15)'
            : 'rgba(107, 114, 128, 0.15)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        <Music className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
        {currentOption?.label || 'Select Audio'}
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 w-full ${
            dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
          } bg-white/10 backdrop-blur-lg rounded-lg shadow-lg overflow-hidden`}
        >
          <div className="max-h-[200px] overflow-y-auto">
            {AUDIO_TYPES.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTypeSelect(option.value)}
                className={`w-full px-4 py-2 text-left text-xs sm:text-sm font-medium transition-colors ${
                  option.value === currentType
                    ? 'text-purple-300 bg-purple-500/10'
                    : 'text-purple-200 hover:bg-purple-500/5'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-xs text-purple-300/70">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 