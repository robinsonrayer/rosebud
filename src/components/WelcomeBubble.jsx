import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export default function WelcomeBubble() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Delay slightly for effect
        const timer = setTimeout(() => setVisible(true), 1000);

        // Auto dismiss after 5 seconds
        const dismiss = setTimeout(() => setVisible(false), 6000);

        return () => {
            clearTimeout(timer);
            clearTimeout(dismiss);
        };
    }, []);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, x: "-50%", scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
                    exit={{ opacity: 0, y: 20, x: "-50%", scale: 0.95 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className={cn(
                        "fixed bottom-20 left-1/2 z-50",
                        "px-6 py-3 rounded-full",
                        "bg-stone-900/95 border border-gold/50 backdrop-blur-sm",
                        "shadow-[0_0_20px_rgba(212,175,55,0.15)]",
                        "flex items-center gap-3 cursor-pointer"
                    )}
                    onClick={() => setVisible(false)}
                >
                    <span className="text-2xl">🌹</span>
                    <span className="text-gold font-serif tracking-wide text-sm whitespace-nowrap">
                        Welcome, Jessica.
                    </span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
