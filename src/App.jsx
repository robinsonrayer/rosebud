import { useState, useEffect } from 'react';
import PuzzleRow from './components/PuzzleRow';
import HintButton from './components/HintButton';
import { logPuzzleAttempt } from './firebase';
import { cn } from './lib/utils';

const ROWS_DATA = [
  { id: 1, targetWord: "YMJ" },
  { id: 2, targetWord: "BNSSJW" },
  { id: 3, targetWord: "LJYX" },
  { id: 4, targetWord: "F" },
  { id: 5, targetWord: "BNXM" },
  { id: 6, targetWord: "LWFSYJI" },
  { id: 7, targetWord: "YT" },
  { id: 8, targetWord: "YMJR" },
];

// Audio Assets (Placeholder URLs or local paths - need to be added to public/assets ideally)
import { startLoop, stopLoop } from './lib/audio';

import { saveGameState, loadGameState } from './firebase';
import WelcomeBubble from './components/WelcomeBubble';

export default function App() {
  const [unlockedIndex, setUnlockedIndex] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [solvedRows, setSolvedRows] = useState([]); // Track which IDs are solved

  useEffect(() => {
    const initSession = async () => {
      // User requested "shared" state (like a group project).
      // We use a hardcoded ID so everyone sees the same progress.
      const sid = "GLOBAL_JESSICA_STATE";

      setSessionId(sid);

      // Load state
      const saved = await loadGameState(sid);
      if (saved) {
        setUnlockedIndex(saved.unlockedIndex || 0);
        setSolvedRows(saved.solvedRows || []);
      }
    };
    initSession();

    // Play BGM (Low warm buzz) - User removed this in previous step? 
    // Checking previous context: User REMOVED BGM logic. Leaving audio alone.
    // startLoop('bgm');
    // return () => stopLoop('bgm');
  }, []);

  const handleRowSolve = (index) => {
    // Optimistic update
    const newSolved = [...solvedRows, index];
    setSolvedRows(newSolved);

    if (index === unlockedIndex) {
      setTimeout(() => {
        const nextIndex = Math.min(index + 1, ROWS_DATA.length);
        setUnlockedIndex(nextIndex);

        // Save
        saveGameState(sessionId, {
          unlockedIndex: nextIndex,
          solvedRows: newSolved
        });
      }, 1000);
    } else {
      // Just save the solved state if it was somehow solved out of order (unlikely with current logic but safe)
      saveGameState(sessionId, {
        unlockedIndex,
        solvedRows: newSolved
      });
    }
  };

  const handleRobiTrigger = () => {
    // Trigger specific effects if needed
  };

  return (
    <div className="min-h-screen bg-background text-stone-200 flex flex-col items-center py-20 overflow-y-auto selection:bg-gold selection:text-black">

      <header className="mb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-serif tracking-widest text-gold opacity-80">ROSEBUD</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-stone-500 to-transparent mx-auto" />
      </header>

      <div className="w-full max-w-2xl flex flex-col items-center gap-0 pb-20">
        {ROWS_DATA.map((row, index) => (
          <div key={row.id} className="w-full flex flex-col items-center relative">
            {/* Connector Vine */}
            {index < ROWS_DATA.length && (
              <div className={cn(
                "w-0.5 h-8 bg-gold/30 my-2 transition-all duration-1000",
                unlockedIndex > index ? "h-8 opacity-100 shadow-[0_0_10px_rgba(212,175,55,0.5)]" : "h-0 opacity-0"
              )} />
            )}

            <PuzzleRow
              {...row}
              index={index}
              isUnlocked={index <= unlockedIndex}
              isSolved={solvedRows.includes(index)}
              onSolve={handleRowSolve}
              onRobiTrigger={handleRobiTrigger}
              sessionId={sessionId}
              logAttempt={logPuzzleAttempt}
            />
          </div>
        ))}
      </div>

      <HintButton />
      <WelcomeBubble />

      {/* Footer / Credits */}
      <footer className="w-full py-8 text-center text-stone-600 font-serif text-sm">
        <p>For Jessica</p>
        <p className="text-[10px] mt-2 opacity-50">Private Personal Project. No data collection.</p>
      </footer>
    </div>
  );
}
