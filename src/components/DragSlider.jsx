import { useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { cn } from "../lib/utils";

export default function DragSlider({ onSubmit, disabled = false }) {
    const constraintsRef = useRef(null);
    const x = useMotionValue(0);
    const backgroundOpacity = useTransform(x, [0, 100], [0.1, 0.5]);
    const [isDragging, setIsDragging] = useState(false);

    const handleDragEnd = () => {
        setIsDragging(false);
        const currentX = x.get();
        // Check actual position (visual confirmation) rather than mouse delta
        // Container roughly 160px, handle 48px, travel ~112px.
        // Threshold 50px is safe ~45% travel.
        if (currentX > 50 && !disabled) {
            onSubmit();
        }
    };

    return (
        <div className={cn("relative h-16 w-40 flex items-center bg-black/40 rounded-full border border-stone-700 p-1 ml-4", disabled && "opacity-50 cursor-not-allowed")}>
            {/* Instruction track text */}
            <motion.div style={{ opacity: backgroundOpacity }} className="absolute inset-0 flex items-center justify-end pr-4 pointer-events-none">
                <span className="text-xs text-gold tracking-widest uppercase font-mono">Engage</span>
            </motion.div>

            {/* Constraints Container */}
            <div ref={constraintsRef} className="absolute inset-1 rounded-full" />

            {/* The Handle */}
            <motion.div
                className={cn(
                    "w-12 h-12 rounded-full bg-stone shadow-lg flex items-center justify-center relative z-10 cursor-grab active:cursor-grabbing border border-stone-500",
                    disabled && "cursor-not-allowed bg-stone-800"
                )}
                drag={disabled ? false : "x"}
                dragConstraints={constraintsRef}
                dragElastic={0.1}
                dragSnapToOrigin
                onDragStart={() => !disabled && setIsDragging(true)}
                onDragEnd={handleDragEnd}
                style={{ x }}
                whileHover={{ scale: disabled ? 1 : 1.05 }}
                whileTap={{ scale: disabled ? 1 : 0.95 }}
            >
                {/* Grip texture */}
                <div className="flex space-x-1">
                    <div className="w-0.5 h-6 bg-stone-400/50" />
                    <div className="w-0.5 h-6 bg-stone-400/50" />
                    <div className="w-0.5 h-6 bg-stone-400/50" />
                </div>
            </motion.div>
        </div>
    );
}
