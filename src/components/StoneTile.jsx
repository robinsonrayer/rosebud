import { motion } from "framer-motion";
import { cn } from "../lib/utils";

/**
 * StoneTile: A single letter block in the puzzle wall.
 * 
 * Props:
 * - char: string (The letter to display)
 * - status: 'locked' | 'active' | 'correct' | 'misplaced' | 'wrong' | 'robi'
 */
export default function StoneTile({ char, status = "active", isCursor = false, onClick }) {
    // Base style: Sleek, dark, matte finish with subtle depth
    const baseStyles = "w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center text-2xl md:text-5xl font-serif transition-all duration-300 rounded-md select-none relative overflow-hidden ring-1 ring-white/5 cursor-pointer";

    // Gradient overlays for depth
    const gloss = (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent opacity-50 pointer-events-none" />
    );

    const variants = {
        // Locked: Dark, almost blending into background
        locked: "bg-[#111] text-transparent shadow-none border border-[#222] opacity-50 scale-95",

        // Active: Matte dark grey, subtle lift
        active: "bg-[#222] text-stone-300 border border-[#333] shadow-[0_4px_6px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]",

        // Correct (Gold): Rich metallic gold
        correct: "bg-gradient-to-br from-[#FFD700] to-[#B8860B] text-[#3d2b00] font-bold border border-[#FFE135] shadow-[0_0_20px_rgba(255,215,0,0.4)] z-10 scale-105",

        // Misplaced (Magma): Deep metallic orange/copper
        misplaced: "bg-gradient-to-br from-[#d97706] to-[#92400e] text-[#431407] border border-[#f59e0b] shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse",

        // Wrong: Flat grey
        wrong: "bg-[#333] text-stone-500 shadow-inner border border-[#444]",

        // ROBI: Rose Gold / Neon Pink
        robi: "bg-gradient-to-br from-rose-500 to-pink-700 text-white border border-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.6)] z-20 scale-110"
    };

    // Pulse animation for specific states
    const pulseAnim = {
        scale: status === 'robi' ? [1.1, 1.15, 1.1] : status === 'misplaced' ? [1, 1.02, 1] : 1,
        transition: {
            duration: status === 'robi' ? 1 : 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    };

    // Cursor highlighting - just the ring, no animation
    const cursorClass = isCursor ? "ring-2 ring-gold ring-offset-2 ring-offset-[#111] shadow-[0_0_15px_rgba(212,175,55,0.5)] z-30" : "";

    return (
        <motion.div
            className={cn(baseStyles, variants[status], cursorClass)}
            animate={pulseAnim}
            initial={false}
            onClick={onClick}
            whileTap={{ scale: 0.95 }}
        >
            {gloss}
            <span className={cn(
                "relative z-10 font-medium drop-shadow-md",
                status === 'correct' ? 'drop-shadow-none' : ''
            )}>
                {status !== 'locked' && char}
            </span>
            {isCursor && (
                <motion.div
                    className="absolute bottom-1 w-8 h-1 bg-gold rounded-full opacity-80"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
}
