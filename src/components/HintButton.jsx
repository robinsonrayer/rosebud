import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { popNextHint, seedHints } from '../firebase';
import { cn } from '../lib/utils';

export default function HintButton() {
    const [loading, setLoading] = useState(false);
    const [exhausted, setExhausted] = useState(false);

    // Initial check/seed
    useEffect(() => {
        seedHints();
    }, []);

    const handleHintClick = async () => {
        if (loading || exhausted) return;
        setLoading(true);

        const msg = await popNextHint();

        if (msg) {
            const url = `https://wa.me/6382407207?text=${encodeURIComponent(msg)}`;
            window.open(url, '_blank');
        } else {
            setExhausted(true);
            alert("No more hints available relative to MacGuffin.");
        }
        setLoading(false);
    };

    return (
        <motion.button
            className={cn(
                "fixed bottom-6 right-6 px-4 py-2 bg-stone-900 border border-gold text-gold font-serif text-sm uppercase rounded shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:bg-gold hover:text-black transition-colors z-50 flex items-center gap-2",
                loading && "opacity-50 cursor-wait",
                exhausted && "opacity-30 cursor-not-allowed border-stone-700 text-stone-500"
            )}
            onClick={handleHintClick}
            whileHover={!exhausted ? { scale: 1.05 } : {}}
            whileTap={!exhausted ? { scale: 0.95 } : {}}
            disabled={loading || exhausted}
        >
            {loading ? "Decrypting..." : exhausted ? "Silence" : "Ask Hint"}
            {!loading && !exhausted && <span className="text-lg">?</span>}
        </motion.button>
    );
}
