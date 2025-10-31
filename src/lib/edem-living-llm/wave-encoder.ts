// Wave Encoder - analyzes rhythm and emotional tone of user messages
export interface WaveAnalysis {
    rhythm: 'slow' | 'medium' | 'fast';
    intensity: number; // 0-1
    emotionalTone: 'calm' | 'agitated' | 'neutral' | 'reflective';
    pausePattern: number[]; // Array of pause durations in ms
    wordFrequency: Record<string, number>;
    messageLength: number;
    emojiCount: number;
    punctuationPattern: string;
}

/**
 * Analyze the wave pattern of a user message
 */
export function analyzeWavePattern(message: string): WaveAnalysis {
    // Calculate message length
    const messageLength = message.length;

    // Count emojis (simplified approach without unicode ranges)
    const emojiPatterns = [':)', ':(', ':D', ':P', ';)', ':-)', ':-(', ':-D', ':-P', ';-)'];
    let emojiCount = 0;
    emojiPatterns.forEach(pattern => {
        const matches = message.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || [];
        emojiCount += matches.length;
    });

    // Analyze punctuation for emotional intensity
    const exclamationMarks = (message.match(/!/g) || []).length;
    const questionMarks = (message.match(/\?/g) || []).length;
    const periods = (message.match(/\./g) || []).length;

    // Determine emotional tone based on punctuation and content
    let emotionalTone: 'calm' | 'agitated' | 'neutral' | 'reflective' = 'neutral';
    if (exclamationMarks > 2) {
        emotionalTone = 'agitated';
    } else if (questionMarks > 2) {
        emotionalTone = 'reflective';
    } else if (periods > 3) {
        emotionalTone = 'calm';
    }

    // Analyze rhythm based on message length and punctuation
    let rhythm: 'slow' | 'medium' | 'fast' = 'medium';
    if (messageLength < 50) {
        rhythm = 'fast';
    } else if (messageLength > 200) {
        rhythm = 'slow';
    }

    // Calculate intensity (0-1)
    const intensity = Math.min(1, (exclamationMarks * 0.3 + questionMarks * 0.2 + emojiCount * 0.1));

    // Simple pause pattern detection (based on sentence structure)
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const pausePattern = sentences.map(() => Math.floor(Math.random() * 1000) + 500); // Simulated pauses

    // Word frequency analysis (simplified)
    const words = message.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const wordFrequency: Record<string, number> = {};
    words.forEach(word => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
    });

    // Punctuation pattern
    const punctuationPattern = message.replace(/[^.!?]/g, '');

    return {
        rhythm,
        intensity,
        emotionalTone,
        pausePattern,
        wordFrequency,
        messageLength,
        emojiCount,
        punctuationPattern
    };
}

/**
 * Generate a breathing pattern based on wave analysis
 */
export function generateBreathingPattern(analysis: WaveAnalysis): {
    inhaleDuration: number;
    holdDuration: number;
    exhaleDuration: number;
    pauseDuration: number;
} {
    // Base durations in milliseconds
    let baseInhale = 2000;
    let baseHold = 1000;
    let baseExhale = 4000;
    let basePause = 1000;

    // Adjust based on rhythm
    if (analysis.rhythm === 'fast') {
        baseInhale = 1500;
        baseExhale = 3000;
    } else if (analysis.rhythm === 'slow') {
        baseInhale = 3000;
        baseExhale = 6000;
        baseHold = 2000;
    }

    // Adjust based on intensity
    if (analysis.intensity > 0.7) {
        baseHold = 500; // Shorter hold for high intensity
        basePause = 500;
    } else if (analysis.intensity < 0.3) {
        baseHold = 2000; // Longer hold for low intensity
        basePause = 2000;
    }

    return {
        inhaleDuration: baseInhale,
        holdDuration: baseHold,
        exhaleDuration: baseExhale,
        pauseDuration: basePause
    };
}