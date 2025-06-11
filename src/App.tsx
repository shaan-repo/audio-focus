import { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { TimerDisplay } from './components/TimerDisplay';
import TimerControls from './components/TimerControls';
import { AudioControls } from './components/AudioControls';
import TodoList from './components/TodoList';
import type { AudioType } from './components/AudioTypeDropdown';

// Define types for todos and binaural beats
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface BinauralBeats {
  left: Tone.Oscillator;
  right: Tone.Oscillator;
  pannerL: Tone.Panner;
  pannerR: Tone.Panner;
}

// Define timer preset type
interface TimerPreset {
  label: string;
  focus: number;
  break: number;
}

// Initial preset
const INITIAL_PRESET: TimerPreset = {
  label: 'Classic (25/5)',
  focus: 25,
  break: 5
};

type AudioPlayerType = Exclude<AudioType, 'binaural'>;

function isAudioPlayerType(type: AudioType): type is AudioPlayerType {
  return type !== 'binaural';
}

const PomodoroTodoApp = () => {
  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);

  // Todo states
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');

  // Audio states
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [binauralBeats, setBinauralBeats] = useState<BinauralBeats | null>(null);
  const [currentAudioType, setCurrentAudioType] = useState<AudioType>('binaural');
  // Come back to this line below with the underscores
  const [_noiseNode, _setNoiseNode] = useState<Tone.Noise | null>(null);
  const [audioPlayers, setAudioPlayers] = useState<Record<AudioPlayerType, Tone.Player | undefined>>({
    white: undefined,
    pink: undefined,
    rain: undefined
  });

  // Refs
  const intervalRef = useRef<number | null>(null);

  // Timer preset states
  const [currentPreset, setCurrentPreset] = useState<TimerPreset>(INITIAL_PRESET);

  // Initialize binaural beats
  useEffect(() => {
    const initAudio = () => {
      try {
        // Create stereo panner for proper left/right separation
        const pannerL = new Tone.Panner(-1).toDestination(); // Full left
        const pannerR = new Tone.Panner(1).toDestination();  // Full right
        
        // Create binaural beats (40Hz base frequency with 6Hz beat frequency for focus)
        const leftOsc = new Tone.Oscillator(40, "sine");
        const rightOsc = new Tone.Oscillator(46, "sine");
        
        // Connect oscillators to panners
        leftOsc.connect(pannerL);
        rightOsc.connect(pannerR);
        
        // Set volume much higher for better audibility
        leftOsc.volume.value = -3;
        rightOsc.volume.value = -3;
        
        setBinauralBeats({ left: leftOsc, right: rightOsc, pannerL, pannerR });
      } catch (error) {
        console.log('Audio initialization failed:', error);
      }
    };

    initAudio();

    return () => {
      if (binauralBeats) {
        binauralBeats.left?.dispose();
        binauralBeats.right?.dispose();
        binauralBeats.pannerL?.dispose();
        binauralBeats.pannerR?.dispose();
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Audio control effect - handles break transitions
  useEffect(() => {
    if (binauralBeats && isRunning) {
      if (audioEnabled && !isBreak) {
        // Start audio during focus sessions
        if (binauralBeats.left.state === 'stopped') {
          Tone.start().then(() => {
            binauralBeats.left.start();
            binauralBeats.right.start();
          });
        }
      } else {
        // Stop audio during breaks or when disabled
        if (binauralBeats.left.state === 'started') {
          binauralBeats.left.stop();
          binauralBeats.right.stop();
        }
      }
    }
  }, [isRunning, isBreak, audioEnabled, binauralBeats]);

  // Initialize audio nodes
  useEffect(() => {
    if (audioEnabled) {
      if (currentAudioType === 'binaural') {
        // Create stereo panner for proper left/right separation
        const pannerL = new Tone.Panner(-1).toDestination(); // Full left
        const pannerR = new Tone.Panner(1).toDestination();  // Full right
        
        // Create binaural beats (40Hz base frequency with 6Hz beat frequency for focus)
        const leftOsc = new Tone.Oscillator(40, "sine");
        const rightOsc = new Tone.Oscillator(46, "sine");
        
        // Connect oscillators to panners
        leftOsc.connect(pannerL);
        rightOsc.connect(pannerR);
        
        // Set volume much higher for better audibility
        leftOsc.volume.value = -3;
        rightOsc.volume.value = -3;
        
        setBinauralBeats({ left: leftOsc, right: rightOsc, pannerL, pannerR });
      } else {
        // Clean up any existing binaural beats
        if (binauralBeats) {
          binauralBeats.left?.dispose();
          binauralBeats.right?.dispose();
          binauralBeats.pannerL?.dispose();
          binauralBeats.pannerR?.dispose();
          setBinauralBeats(null);
        }

        // Clean up existing audio players
        Object.values(audioPlayers).forEach(player => player?.dispose());

        // Create new audio player based on type
        const player = new Tone.Player({
          url: `./sounds/${currentAudioType}.mp3`,
          loop: true,
          volume: -10,
          onload: () => {
            console.log(`${currentAudioType} audio loaded successfully`);
          },
          onerror: (error) => {
            console.error(`Error loading ${currentAudioType} audio:`, error);
          }
        }).toDestination();

        setAudioPlayers(prev => ({
          ...prev,
          [currentAudioType]: player
        }));
      }
    }

    return () => {
      if (binauralBeats) {
        binauralBeats.left?.dispose();
        binauralBeats.right?.dispose();
        binauralBeats.pannerL?.dispose();
        binauralBeats.pannerR?.dispose();
      }
      Object.values(audioPlayers).forEach(player => player?.dispose());
    };
  }, [audioEnabled, currentAudioType]);

  // Update audio when session type changes
  useEffect(() => {
    if (audioEnabled) {
      if (currentAudioType === 'binaural' && binauralBeats) {
        if (isBreak) {
          // Break frequencies
          binauralBeats.left.frequency.value = 40;
          binauralBeats.right.frequency.value = 46;
        } else {
          // Focus frequencies
          binauralBeats.left.frequency.value = 40;
          binauralBeats.right.frequency.value = 46;
        }
      }
    }
  }, [isBreak, audioEnabled, binauralBeats, currentAudioType]);

  // Update timer durations when preset changes
  const handlePresetChange = (newPreset: TimerPreset) => {
    setCurrentPreset(newPreset);
    // Reset timer with new duration
    setTimeLeft(isBreak ? newPreset.break * 60 : newPreset.focus * 60);
    // Reset timer state
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Stop audio
    if (binauralBeats) {
      try {
        if (binauralBeats.left.state === 'started') {
          binauralBeats.left.stop();
        }
        if (binauralBeats.right.state === 'started') {
          binauralBeats.right.stop();
        }
      } catch (error) {
        console.log('Audio stop failed:', error);
      }
    }
    
    if (!isBreak) {
      setSessions(prev => prev + 1);
      setIsBreak(true);
      setTimeLeft(currentPreset.break * 60);
    } else {
      setIsBreak(false);
      setTimeLeft(currentPreset.focus * 60);
    }
  };

  const startTimer = async () => {
    setIsRunning(true);
    
    // Start audio if enabled
    if (audioEnabled) {
      try {
        await Tone.start();
        if (currentAudioType === 'binaural' && binauralBeats) {
          // Stop first if already running
          if (binauralBeats.left.state === 'started') {
            binauralBeats.left.stop();
            binauralBeats.right.stop();
          }
          
          // Small delay then start
          setTimeout(() => {
            binauralBeats.left.start();
            binauralBeats.right.start();
          }, 100);
        } else if (isAudioPlayerType(currentAudioType) && audioPlayers[currentAudioType]) {
          const player = audioPlayers[currentAudioType] as Tone.Player;
          if (player?.loaded) {
            // Set initial volume to -Infinity for fade in
            if (currentAudioType === 'white' || currentAudioType === 'pink') {
              player.volume.value = -Infinity;
            }
            player.start();
            // Add fade in for white and pink noise only
            if (currentAudioType === 'white' || currentAudioType === 'pink') {
              player.volume.rampTo(-10, 0.5); // Shortened to 0.5 seconds
            }
          }
        }
      } catch (error) {
        console.log('Audio start failed:', error);
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (audioEnabled) {
      if (currentAudioType === 'binaural' && binauralBeats) {
        if (binauralBeats.left.state === 'started') {
          binauralBeats.left.stop();
          binauralBeats.right.stop();
        }
      } else if (isAudioPlayerType(currentAudioType) && audioPlayers[currentAudioType]) {
        const player = audioPlayers[currentAudioType] as Tone.Player;
        // Add fade out for white and pink noise only
        if (currentAudioType === 'white' || currentAudioType === 'pink') {
          player.volume.rampTo(-Infinity, 0.5); // Shortened to 0.5 seconds
          setTimeout(() => player.stop(), 500);
        } else {
          player.stop();
        }
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? currentPreset.break * 60 : currentPreset.focus * 60);
    if (audioEnabled) {
      if (currentAudioType === 'binaural' && binauralBeats) {
        if (binauralBeats.left.state === 'started') {
          binauralBeats.left.stop();
          binauralBeats.right.stop();
        }
      } else if (isAudioPlayerType(currentAudioType) && audioPlayers[currentAudioType]) {
        const player = audioPlayers[currentAudioType] as Tone.Player;
        if (currentAudioType === 'white' || currentAudioType === 'pink') {
          player.volume.rampTo(-Infinity, 0.5);
          setTimeout(() => player.stop(), 500);
        } else {
          player.stop();
        }
      }
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: newTodo.trim(),
        completed: false
      }]);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const testAudio = async () => {
    if (!audioEnabled) return;

    try {
      await Tone.start();
      console.log('Testing audio type:', currentAudioType);
      
      if (currentAudioType === 'binaural' && binauralBeats) {
        // Stop first if already running
        if (binauralBeats.left.state === 'started') {
          binauralBeats.left.stop();
          binauralBeats.right.stop();
        }
        
        // Small delay then start
        setTimeout(() => {
          binauralBeats.left.start();
          binauralBeats.right.start();
        }, 100);
        
        setTimeout(() => {
          if (binauralBeats.left.state === 'started') {
            binauralBeats.left.stop();
            binauralBeats.right.stop();
          }
        }, 3000);
      } else if (isAudioPlayerType(currentAudioType) && audioPlayers[currentAudioType]) {
        const player = audioPlayers[currentAudioType] as Tone.Player;
        console.log('Audio player state:', {
          loaded: player?.loaded,
          state: player?.state
        });
        
        if (player?.loaded) {
          // Stop any existing playback first
          if (player.state === 'started') {
            if (currentAudioType === 'white' || currentAudioType === 'pink') {
              player.volume.rampTo(-Infinity, 0.5);
              setTimeout(() => player.stop(), 500);
            } else {
              player.stop();
            }
            // Wait a small amount of time before starting again
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Set initial volume to -Infinity for fade in
          if (currentAudioType === 'white' || currentAudioType === 'pink') {
            player.volume.value = -Infinity;
          }
          player.start();
          console.log('Started audio playback');
          
          // Add fade in for white and pink noise only
          if (currentAudioType === 'white' || currentAudioType === 'pink') {
            player.volume.rampTo(-10, 0.5); // Shortened to 0.5 seconds
          }
          
          // Stop after 3 seconds
          setTimeout(() => {
            if (player.state === 'started') {
              if (currentAudioType === 'white' || currentAudioType === 'pink') {
                player.volume.rampTo(-Infinity, 0.5);
                setTimeout(() => player.stop(), 500);
              } else {
                player.stop();
              }
              console.log('Stopped audio playback');
            }
          }, 3000);
        } else {
          console.log('Audio player not loaded yet');
        }
      } else {
        console.log('No audio player found for type:', currentAudioType);
      }
    } catch (error) {
      console.error('Audio test failed:', error);
    }
  };

  const completedTodos = todos.filter(todo => todo.completed).length;

  return (
    <div className="min-h-dvh overflow-auto lg:overflow-hidden bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-2 tracking-wide">Focus Flow</h1>
          <p className="text-purple-200 text-sm sm:text-lg font-light">Pomodoro • Binaural Beats • Deep Work</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 flex-1">
          {/* Timer Section */}
          <div className="lg:col-span-2 space-y-4">
            <TimerDisplay
              timeLeft={timeLeft}
              isBreak={isBreak}
              sessions={sessions}
              formatTime={formatTime}
              currentPreset={currentPreset}
              onPresetChange={handlePresetChange}
            />
            <TimerControls
              isRunning={isRunning}
              startTimer={startTimer}
              pauseTimer={pauseTimer}
              resetTimer={resetTimer}
            />
            <AudioControls
              audioEnabled={audioEnabled}
              setAudioEnabled={setAudioEnabled}
              currentAudioType={currentAudioType}
              onAudioTypeChange={setCurrentAudioType}
              testAudio={testAudio}
            />
          </div>

          {/* Todo List Section */}
          <div className="lg:col-span-1">
            <TodoList
              todos={todos}
              newTodo={newTodo}
              setNewTodo={setNewTodo}
              addTodo={addTodo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
              completedTodos={completedTodos}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTodoApp;