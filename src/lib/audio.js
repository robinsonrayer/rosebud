import { Howl } from 'howler';

// Sound Asset Map
// Updated to use MP3 files strictly
// Sound Asset Map
// Updated to use MP3 files strictly
const SOUNDS = {
    // Typing: A clean mechanical switch or soft tap
    chisel: new Howl({ src: ['/audio/soft_click.mp3'], volume: 0.5 }),

    // Dragging: A smooth servo slide OR low hum
    grind: new Howl({ src: ['/audio/slide_hum.mp3'], loop: true, volume: 0.3 }),

    // Snap Back/Fail: A soft error 'thud' or digital deny
    clunk: new Howl({ src: ['/audio/soft_deny.mp3'], volume: 0.5 }),

    // Success (Gold): Resonant chord or bell
    choir: new Howl({ src: ['/audio/success_chord.mp3'], volume: 0.7 }),

    // Misplaced (Magma): Now uses soft_deny as requested
    magma: new Howl({ src: ['/audio/soft_deny.mp3'], volume: 0.5 }),


    // Easter Egg (Robi): Mystical shimmer
    harp: new Howl({ src: ['/audio/sparkle.mp3'], volume: 0.6 }),
};

export const playSound = (type) => {
    if (SOUNDS[type]) {
        SOUNDS[type].play();
    }
};

export const startLoop = (type) => {
    if (SOUNDS[type] && !SOUNDS[type].playing()) {
        SOUNDS[type].play();
    }
};

export const stopLoop = (type) => {
    if (SOUNDS[type]) {
        SOUNDS[type].stop();
    }
};
