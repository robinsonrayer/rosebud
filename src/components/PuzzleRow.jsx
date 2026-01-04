import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StoneTile from "./StoneTile";
import DragSlider from "./DragSlider";
import { cn } from "../lib/utils";
import { playSound } from "../lib/audio";

/**
 * PuzzleRow
 * 
 * @param {string} targetWord - The solution for this row (e.g. "YMJ" or "THE WINNER")
 * @param {number} index - Row index (0-7)
 * @param {boolean} isUnlocked - Is this row active?
 * @param {function} onSolve - Callback when row is fully solved
 * @param {function} onRobiTrigger - Callback when easter egg is found
 * @param {function} logAttempt - Callback to log to Firebase
 * @param {string} sessionId - For logging
 */
export default function PuzzleRow({
    targetWord,
    index,
    isUnlocked,
    isSolved = false, // Default to false if not passed
    onSolve,
    onRobiTrigger,
    logAttempt,
    sessionId
}) {
    // If passed already solved, use that.
    const [inputVal, setInputVal] = useState(isSolved ? targetWord : "");
    const [cursorIndex, setCursorIndex] = useState(0);
    // If solved, everything is locked (correct)
    const [lockedMask, setLockedMask] = useState(
        isSolved ? Array(targetWord.length).fill(true) : Array(targetWord.length).fill(false)
    );
    const [misplacedMask, setMisplacedMask] = useState(Array(targetWord.length).fill(false));
    const [isFullSolved, setIsFullSolved] = useState(isSolved);
    const [robiActive, setRobiActive] = useState(false);

    // Sync if prop changes (e.g. on hard reload or late hydration? usually mount is enough)
    useEffect(() => {
        if (isSolved && !isFullSolved) {
            setIsFullSolved(true);
            setInputVal(targetWord);
            setLockedMask(Array(targetWord.length).fill(true));
        }
    }, [isSolved]);

    // Track recent keystrokes - KEPT for compatibility but primary check is now via 'value'
    const keystrokeBuffer = useRef("");
    const inputRef = useRef(null);

    const MAGIC_BASE = "ROBINSON";
    const magicTarget = MAGIC_BASE.slice(0, targetWord.length);

    // Focus input when unlocked
    useEffect(() => {
        if (isUnlocked && !isFullSolved && inputRef.current) {
            // Check for mobile match
            const isMobile = window.matchMedia("(max-width: 768px)").matches;
            if (!isMobile) {
                // Only auto-focus on desktop to prevent erratic keyboard popping on mobile scroll
                inputRef.current.focus();
            }
        }
    }, [isUnlocked, isFullSolved]);

    const handleRowClick = () => {
        if (isUnlocked && !isFullSolved && inputRef.current) {
            inputRef.current.focus();
        }
    };

    // Explicit tile click sets cursor
    const handleTileClick = (idx, e) => {
        e.stopPropagation(); // prevent parent click
        if (isUnlocked && !isFullSolved) {
            setCursorIndex(idx);
            if (inputRef.current) inputRef.current.focus();
        }
    };

    // Unified character input handler
    const handleCharInput = (char) => {
        // If active index is locked, skip forward or block
        if (lockedMask[cursorIndex]) {
            if (cursorIndex < targetWord.length - 1) {
                setCursorIndex(cursorIndex + 1);
            }
            return;
        }

        playSound('chisel');

        let chars = inputVal.padEnd(targetWord.length, " ").split("");
        chars[cursorIndex] = char.toUpperCase();
        const newVal = chars.join("").trimEnd();
        setInputVal(newVal);

        // Verify Easter Egg
        if (newVal === magicTarget) {
            triggerRobi();
        }

        // Advance cursor
        if (cursorIndex < targetWord.length - 1) {
            setCursorIndex(cursorIndex + 1);
        }
    };

    const handleKeyDown = (e) => {
        if (!isUnlocked || isFullSolved) return;

        // Handle Arrows
        if (e.key === "ArrowLeft") {
            setCursorIndex(prev => Math.max(0, prev - 1));
            return;
        }
        if (e.key === "ArrowRight") {
            setCursorIndex(prev => Math.min(targetWord.length - 1, prev + 1));
            return;
        }

        // Handle Backspace
        if (e.key === "Backspace") {
            // ... (keep existing backspace logic as is, implicit via standard behavior or KeyDown)
            // Wait, I need to preserve the backspace logic block below or copy it.
            // Since I am replacing the block, I must preserve it. 
            // Actually, the previous code block ended at line 122 for backspace, this replacement starts at 83.
            // I need to include the Backspace logic in this replacement content.

            e.preventDefault();
            playSound('chisel');

            let chars = inputVal.padEnd(targetWord.length, " ").split("");

            // If unlocked, clear current
            if (!lockedMask[cursorIndex]) {
                chars[cursorIndex] = " ";
            }

            // Move cursor back
            if (cursorIndex > 0) {
                setCursorIndex(cursorIndex - 1);
            }

            const newVal = chars.join("").trimEnd();
            setInputVal(newVal);
            return;
        }

        // Handle Letters (Desktop)
        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
            e.preventDefault();
            handleCharInput(e.key);
        }
    };

    // Handle Input Change (Mobile Virtual Keyboard)
    const handleChange = (e) => {
        const val = e.target.value;
        if (!val) return;

        // Extract last char (assuming append)
        const char = val.slice(-1);
        if (/[a-zA-Z]/.test(char)) {
            handleCharInput(char);
        }

        // Note: The input value will be reset to "" by React render because 'value' prop is controlled (or fixed to "").
        // However, forcing a reset here might be cleaner if the controlled flow lags.
        // But since we pass value="" in render, it should snap back.
    };

    const triggerRobi = () => {
        // Prevent re-trigger spam if already active
        if (robiActive) return;

        playSound('harp'); // Harp Glissando
        setRobiActive(true);
        onRobiTrigger();

        // Log it
        logAttempt({
            sessionId,
            currentLevelIndex: index,
            targetWord,
            userAttempt: magicTarget + "_TRIGGER",
            isRobiTrigger: true,
            isCorrect: false
        });

        setTimeout(() => {
            setRobiActive(false);
        }, 2000);
    };

    const handleSubmit = () => {
        if (isFullSolved) return;

        const guess = inputVal.padEnd(targetWord.length, " ");
        // ... rest of logic uses inputVal
        const newLocked = [...lockedMask];
        const newMisplaced = [...misplacedMask];
        newMisplaced.fill(false);

        let correctCount = 0;

        // 1. Check Correct (Gold)
        const targetArr = targetWord.split("");
        const guessArr = guess.split("");
        const targetFreq = {};

        guessArr.forEach((char, i) => {
            if (char === targetArr[i]) {
                newLocked[i] = true;
                correctCount++;
            } else {
                const tChar = targetArr[i];
                targetFreq[tChar] = (targetFreq[tChar] || 0) + 1;
            }
        });

        // 2. Check Misplaced
        guessArr.forEach((char, i) => {
            if (char !== targetArr[i] && !newLocked[i]) {
                if (targetFreq[char] > 0) {
                    newMisplaced[i] = true;
                    targetFreq[char]--;
                }
            }
        });

        setLockedMask(newLocked);
        setMisplacedMask(newMisplaced);

        const isSuccess = correctCount === targetWord.length;

        // Log
        logAttempt({
            sessionId,
            currentLevelIndex: index,
            targetWord,
            userAttempt: inputVal,
            isRobiTrigger: false,
            isCorrect: isSuccess
        });

        if (isSuccess) {
            playSound('choir');
            setIsFullSolved(true);
            onSolve(index);
        } else {
            // If any misplaced, play Magma heat sound?
            if (newMisplaced.some(m => m)) {
                playSound('magma');
            } else {
                playSound('clunk'); // Wrong
            }
        }
    };

    if (!isUnlocked) {
        return (
            <div className="flex flex-col items-center justify-center py-6 opacity-60 grayscale scale-95 transition-all duration-500 blur-[1px]">
                <div className="flex gap-2 sm:gap-3">
                    {Array(targetWord.length).fill(0).map((_, i) => (
                        <StoneTile key={i} char="" status="locked" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div
            className="flex flex-col items-center justify-center py-6 relative group w-full"
            onClick={handleRowClick}
        >
            {/* Hidden Input for focus */}
            <input
                ref={inputRef}
                type="text"
                className="absolute opacity-0 w-full h-full cursor-text"
                style={{ fontSize: '16px', transform: 'scale(1)' }}
                // We keep value empty or synced? 
                // To force KeyDown handling, we might want to keep it "managed" but we intercept keys.
                // Actually, for mobile VK, we need the value to be there to delete?
                // Let's keep it simple: We use the input as a focus trap mostly.
                value=""
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={isFullSolved}
                autoComplete="off"
            />

            {/* Tile Row */}
            <div className="flex gap-2 sm:gap-3 flex-wrap justify-center mb-6 pointer-events-none">
                {Array.from({ length: targetWord.length }).map((_, i) => {
                    // Logic to show char: derived from inputVal string and lockedMask
                    // inputVal might be "A B " (sparse).
                    const valChar = inputVal[i] || "";

                    let status = "active";
                    if (robiActive) {
                        status = "robi";
                    } else if (lockedMask[i]) {
                        status = "correct";
                    } else if (misplacedMask[i]) {
                        status = "misplaced";
                    } else if (valChar && !lockedMask[i] && !misplacedMask[i] && isFullSolved) {
                        // Keep active
                    }

                    return (
                        <div key={i} className="pointer-events-auto">
                            <StoneTile
                                char={lockedMask[i] ? targetWord[i] : valChar}
                                status={status}
                                isCursor={!isFullSolved && isUnlocked && i === cursorIndex}
                                onClick={(e) => handleTileClick(i, e)}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Drag Slider - Centered below */}
            {!isFullSolved && (
                <div className="relative z-20 origin-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <DragSlider onSubmit={handleSubmit} disabled={inputVal.length === 0} />
                </div>
            )}
        </div>
    );
}
