import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Plus, Check, X, Timer, Volume2, VolumeX } from 'lucide-react';
import * as Tone from 'tone';

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

  // Refs
  const intervalRef = useRef<number | null>(null);

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
      setTimeLeft(5 * 60); // 5 minute break
    } else {
      setIsBreak(false);
      setTimeLeft(25 * 60); // Back to 25 minute work session
    }
  };

  const startTimer = async () => {
    setIsRunning(true);
    
    // Start audio if enabled and not in break mode
    if (binauralBeats && audioEnabled && !isBreak) {
      try {
        // Ensure Tone.js audio context is started
        if (Tone.context.state !== 'running') {
          await Tone.start();
        }
        
        // Stop first if already running, then start fresh
        if (binauralBeats.left.state === 'started') {
          binauralBeats.left.stop();
        }
        if (binauralBeats.right.state === 'started') {
          binauralBeats.right.stop();
        }
        
        // Small delay then start
        setTimeout(() => {
          binauralBeats.left.start();
          binauralBeats.right.start();
        }, 100);
        
        console.log('Binaural beats started successfully');
      } catch (error) {
        console.log('Audio start failed:', error);
      }
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
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
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
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

  const completedTodos = todos.filter(todo => todo.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-800 p-3 sm:p-4 pb-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12">
          <h1 className="text-3xl sm:text-5xl font-light text-white mb-2 sm:mb-3 tracking-wide">Focus Flow</h1>
          <p className="text-purple-200 text-sm sm:text-lg font-light">Pomodoro • Binaural Beats • Deep Work</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Timer Section - Now takes center stage */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Main Timer Display */}
            <div 
              className="rounded-2xl p-4 sm:p-8 border border-white border-opacity-10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
            >
              <div className="text-center">
                <div className="mb-4 sm:mb-6">
                  <div 
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
                    {isBreak ? 'Break Time' : 'Focus Session'}
                  </div>
                </div>

                <div className="relative mb-6 sm:mb-8">
                  <div className="text-6xl sm:text-9xl font-extralight text-white mb-2 sm:mb-4 tracking-wider" style={{fontFamily: 'system-ui, -apple-system, sans-serif'}}>
                    {formatTime(timeLeft)}
                  </div>
                  {/* Subtle progress ring - hidden on mobile for space */}
                  <div className="absolute inset-0 hidden sm:flex items-center justify-center pointer-events-none">
                    <div 
                      className="w-80 h-80 rounded-full"
                      style={{
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Controls */}
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
              </div>
            </div>

            {/* Audio & Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Audio Controls */}
              <div 
                className="rounded-2xl p-4 sm:p-6 border border-white border-opacity-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }}
              >
                <h3 className="text-white font-medium mb-3 sm:mb-4 text-center text-sm sm:text-base">Audio Control</h3>
                <div className="flex justify-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 text-xs sm:text-sm ${
                      audioEnabled 
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'text-purple-200'
                    }`}
                    style={!audioEnabled ? {
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    } : {}}
                    onMouseEnter={(e) => {
                      if (!audioEnabled) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!audioEnabled) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                      }
                    }}
                  >
                    {audioEnabled ? <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" />}
                    Binaural
                  </button>
                  
                  <button
                    onClick={async () => {
                      if (binauralBeats) {
                        try {
                          await Tone.start();
                          if (binauralBeats.left.state === 'started') {
                            binauralBeats.left.stop();
                            binauralBeats.right.stop();
                          }
                          setTimeout(() => {
                            binauralBeats.left.start();
                            binauralBeats.right.start();
                            setTimeout(() => {
                              binauralBeats.left.stop();
                              binauralBeats.right.stop();
                            }, 3000);
                          }, 100);
                        } catch (error) {
                          console.log('Test audio failed:', error);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-full font-medium transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm shadow-lg hover:scale-105"
                  >
                    Test 3s
                  </button>
                </div>
              </div>

              {/* Session Stats */}
              <div 
                className="rounded-2xl p-4 sm:p-6 border border-white border-opacity-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                }}
              >
                <h3 className="text-white font-medium mb-3 sm:mb-4 text-center text-sm sm:text-base">Progress</h3>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-light text-white mb-1">{sessions}</div>
                  <div className="text-purple-200 text-xs sm:text-sm">Sessions Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* Todo List Section - Now sidebar style */}
          <div className="space-y-4 sm:space-y-6">
            <div 
              className="rounded-2xl p-4 sm:p-6 border border-white border-opacity-10"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
              }}
            >
              <h2 className="text-xl sm:text-2xl font-light text-white mb-4 sm:mb-6 text-center">Today's Focus</h2>
              
              {/* Add Todo */}
              <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                  placeholder="Add a new task..."
                  className="flex-1 rounded-xl px-3 sm:px-4 py-2 sm:py-3 placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 border border-white border-opacity-10 text-white text-sm sm:text-base"
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)'
                  }}
                />
                <button
                  onClick={addTodo}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 p-2 sm:p-3 rounded-xl transition-all duration-200 shadow-lg hover:scale-105"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </button>
              </div>

              {/* Progress */}
              {todos.length > 0 && (
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between text-xs sm:text-sm text-purple-200 mb-2 sm:mb-3">
                    <span className="font-medium">Progress</span>
                    <span className="font-mono">{completedTodos}/{todos.length}</span>
                  </div>
                  <div 
                    className="rounded-full h-2 sm:h-3 overflow-hidden"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    }}
                  >
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 sm:h-3 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${todos.length ? (completedTodos / todos.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Todo List */}
              <div className="space-y-2 sm:space-y-3 max-h-64 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
                {todos.map(todo => (
                  <div
                    key={todo.id}
                    className={`group flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border border-white border-opacity-10 transition-all duration-200 ${
                      todo.completed ? 'opacity-60' : ''
                    }`}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                    }}
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        todo.completed 
                          ? 'bg-emerald-500 border-emerald-500 scale-110' 
                          : 'border-purple-300 hover:border-purple-400 hover:scale-110'
                      }`}
                    >
                      {todo.completed && <Check className="w-3 h-3 sm:w-4 sm:h-4 text-white" />}
                    </button>
                    
                    <span className={`flex-1 transition-all duration-200 text-xs sm:text-sm ${
                      todo.completed ? 'line-through text-purple-300' : 'text-white'
                    }`}>
                      {todo.text}
                    </span>
                    
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110"
                    >
                      <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                ))}
                
                {todos.length === 0 && (
                  <div className="text-center text-purple-200 py-8 sm:py-12">
                    <div 
                      className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full flex items-center justify-center"
                      style={{
                        background: 'rgba(255, 255, 255, 0.08)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)'
                      }}
                    >
                      <Plus className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300" />
                    </div>
                    <p className="font-light text-sm sm:text-base">No tasks yet</p>
                    <p className="text-xs sm:text-sm text-purple-300">Add one above to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-12 text-purple-200 text-xs sm:text-sm font-light">
          <p>25 minutes focus • 5 minutes rest • Repeat for deep work</p>
        </div>
      </div>
    </div>
  );
};

export default PomodoroTodoApp;