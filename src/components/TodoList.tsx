import React from 'react';
import { Plus, Check, X } from 'lucide-react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface TodoListProps {
  todos: Todo[];
  newTodo: string;
  setNewTodo: (text: string) => void;
  addTodo: () => void;
  toggleTodo: (id: number) => void;
  deleteTodo: (id: number) => void;
  completedTodos: number;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  newTodo,
  setNewTodo,
  addTodo,
  toggleTodo,
  deleteTodo,
  completedTodos,
}) => {
  return (
    <div 
      className="relative z-10 rounded-2xl p-4 sm:p-6 border border-white border-opacity-10"
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
  );
};

export default TodoList; 