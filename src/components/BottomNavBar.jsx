import { Home, Lightbulb, BookOpen, RotateCcw } from 'lucide-react';

const BottomNavBar = ({ onHome, onHint, onWalkthrough, onFlip, isFlipped, showHint, showWalkthrough }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700 z-50 safe-area-bottom">
      <div className="grid grid-cols-4 gap-1 px-2 py-2">
        {/* Home Button */}
        <button
          onClick={onHome}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg active:bg-slate-800 transition-colors"
        >
          <Home className="w-6 h-6 text-slate-300 mb-1" />
          <span className="text-[10px] text-slate-400">Home</span>
        </button>

        {/* Hint Button */}
        <button
          onClick={onHint}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg active:bg-slate-800 transition-colors ${
            showHint ? 'bg-blue-500/20' : ''
          }`}
        >
          <Lightbulb className={`w-6 h-6 mb-1 ${showHint ? 'text-blue-400' : 'text-slate-300'}`} />
          <span className={`text-[10px] ${showHint ? 'text-blue-400' : 'text-slate-400'}`}>Hint</span>
        </button>

        {/* Walkthrough Button */}
        <button
          onClick={onWalkthrough}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg active:bg-slate-800 transition-colors ${
            showWalkthrough ? 'bg-purple-500/20' : ''
          }`}
        >
          <BookOpen className={`w-6 h-6 mb-1 ${showWalkthrough ? 'text-purple-400' : 'text-slate-300'}`} />
          <span className={`text-[10px] ${showWalkthrough ? 'text-purple-400' : 'text-slate-400'}`}>Guide</span>
        </button>

        {/* Flip Card Button */}
        <button
          onClick={onFlip}
          className="flex flex-col items-center justify-center py-2 px-1 rounded-lg active:bg-slate-800 transition-colors bg-green-500/10"
        >
          <RotateCcw className={`w-6 h-6 mb-1 text-green-400 transition-transform ${isFlipped ? 'rotate-180' : ''}`} />
          <span className="text-[10px] text-green-400">
            {isFlipped ? 'Front' : 'Back'}
          </span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavBar;

