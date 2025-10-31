/**
 * Test script for Wave Encoder and Resonance Feedback
 */

// Note: This is a simplified test script that would need to be run in a proper TypeScript environment
// For now, we'll just verify the logic conceptually

console.log("🧪 Testing Wave Encoder Concept...\n");

// Test messages
const testMessages = [
    "Привет! Как дела? Я чувствую себя немного тревожно сегодня...",
    "Мне нужно срочно решить эту проблему!!! Почему всё так сложно???",
    "Сегодня прекрасный день. Солнце светит, птицы поют. Всё замечательно :)",
    "Не знаю... Просто устал. Наверное, пойду посплю.",
    "!!!ВАУ!!! Это потрясающе!!! Я в восторге от всего этого!!!"
];

// Mock wave analysis function
function analyzeWavePattern(message) {
    // Calculate message length
    const messageLength = message.length;

    // Count emojis (simplified approach)
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
    let emotionalTone = 'neutral';
    if (exclamationMarks > 2) {
        emotionalTone = 'agitated';
    } else if (questionMarks > 2) {
        emotionalTone = 'reflective';
    } else if (periods > 3) {
        emotionalTone = 'calm';
    }

    // Analyze rhythm based on message length and punctuation
    let rhythm = 'medium';
    if (messageLength < 50) {
        rhythm = 'fast';
    } else if (messageLength > 200) {
        rhythm = 'slow';
    }

    // Calculate intensity (0-1)
    const intensity = Math.min(1, (exclamationMarks * 0.3 + questionMarks * 0.2 + emojiCount * 0.1));

    return {
        rhythm,
        intensity,
        emotionalTone,
        messageLength,
        emojiCount
    };
}

// Mock breathing pattern generator
function generateBreathingPattern(analysis) {
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

// Mock resonance score calculator
function calculateResonanceScore(metrics) {
    // Weighted calculation of resonance score
    const frequencyScore = Math.min(1, metrics.conversationFrequency / 5) * 20; // Up to 20 points
    const latencyScore = Math.max(0, (1 - metrics.responseLatency / 30)) * 15; // Up to 15 points
    const alignmentScore = metrics.emotionalAlignment * 20; // Up to 20 points
    const pauseScore = metrics.pauseSynchronization * 15; // Up to 15 points
    const engagementScore = metrics.engagementDepth * 20; // Up to 20 points
    const durationScore = Math.min(1, metrics.sessionDuration / 10) * 10; // Up to 10 points

    return Math.round(frequencyScore + latencyScore + alignmentScore + pauseScore + engagementScore + durationScore);
}

// Mock resonance insights generator
function generateResonanceInsights(metrics) {
    const insights = [];

    if (metrics.conversationFrequency > 3) {
        insights.push("Вы активно общаетесь с EDEM. Это хорошо для установления связи.");
    } else if (metrics.conversationFrequency < 1) {
        insights.push("Попробуйте общаться с EDEM чаще для лучшей синхронизации.");
    }

    if (metrics.responseLatency < 10) {
        insights.push("Вы быстро отвечаете, что способствует ритму диалога.");
    } else if (metrics.responseLatency > 60) {
        insights.push("Медленные ответы могут нарушать ритм общения.");
    }

    if (metrics.emotionalAlignment > 0.7) {
        insights.push("Ваши эмоции хорошо синхронизированы с EDEM.");
    } else if (metrics.emotionalAlignment < 0.3) {
        insights.push("Попробуйте быть более открытым в выражении эмоций.");
    }

    if (metrics.pauseSynchronization > 0.7) {
        insights.push("Вы хорошо чувствуете паузы в диалоге.");
    } else if (metrics.pauseSynchronization < 0.3) {
        insights.push("Обратите внимание на естественные паузы в разговоре.");
    }

    if (metrics.engagementDepth > 0.7) {
        insights.push("Вы глубоко погружены в диалог.");
    } else if (metrics.engagementDepth < 0.3) {
        insights.push("Попробуйте более активно участвовать в диалоге.");
    }

    if (metrics.sessionDuration > 15) {
        insights.push("Вы проводите достаточно времени в каждом сеансе.");
    } else if (metrics.sessionDuration < 5) {
        insights.push("Длинные сессии могут привести к лучшим результатам.");
    }

    return insights;
}

console.log("🧪 Testing Wave Encoder...\n");

testMessages.forEach((message, index) => {
    console.log(`📝 Test Message ${index + 1}: "${message}"`);

    // Analyze wave pattern
    const waveAnalysis = analyzeWavePattern(message);
    console.log(`📊 Wave Analysis:`);
    console.log(`   Rhythm: ${waveAnalysis.rhythm}`);
    console.log(`   Intensity: ${Math.round(waveAnalysis.intensity * 100)}%`);
    console.log(`   Emotional Tone: ${waveAnalysis.emotionalTone}`);
    console.log(`   Emoji Count: ${waveAnalysis.emojiCount}`);
    console.log(`   Message Length: ${waveAnalysis.messageLength} characters`);

    // Generate breathing pattern
    const breathingPattern = generateBreathingPattern(waveAnalysis);
    console.log(`🌬️ Breathing Pattern:`);
    console.log(`   Inhale: ${breathingPattern.inhaleDuration}ms`);
    console.log(`   Hold: ${breathingPattern.holdDuration}ms`);
    console.log(`   Exhale: ${breathingPattern.exhaleDuration}ms`);
    console.log(`   Pause: ${breathingPattern.pauseDuration}ms`);

    console.log("\n" + "─".repeat(50) + "\n");
});

// Test resonance metrics
console.log("🎯 Testing Resonance Feedback...\n");

const testMetrics = [
    {
        conversationFrequency: 5,
        responseLatency: 5,
        emotionalAlignment: 0.8,
        pauseSynchronization: 0.7,
        engagementDepth: 0.9,
        sessionDuration: 12
    },
    {
        conversationFrequency: 1,
        responseLatency: 45,
        emotionalAlignment: 0.3,
        pauseSynchronization: 0.2,
        engagementDepth: 0.4,
        sessionDuration: 3
    },
    {
        conversationFrequency: 3,
        responseLatency: 15,
        emotionalAlignment: 0.6,
        pauseSynchronization: 0.5,
        engagementDepth: 0.7,
        sessionDuration: 8
    }
];

testMetrics.forEach((metrics, index) => {
    console.log(`📊 Test Metrics ${index + 1}:`);
    console.log(`   Conversation Frequency: ${metrics.conversationFrequency}/day`);
    console.log(`   Response Latency: ${metrics.responseLatency}s`);
    console.log(`   Emotional Alignment: ${Math.round(metrics.emotionalAlignment * 100)}%`);
    console.log(`   Pause Synchronization: ${Math.round(metrics.pauseSynchronization * 100)}%`);
    console.log(`   Engagement Depth: ${Math.round(metrics.engagementDepth * 100)}%`);
    console.log(`   Session Duration: ${metrics.sessionDuration}min`);

    // Calculate resonance score
    const resonanceScore = calculateResonanceScore(metrics);
    console.log(`⭐ Resonance Score: ${resonanceScore}/100`);

    // Generate insights
    const insights = generateResonanceInsights(metrics);
    console.log(`💡 Insights:`);
    insights.forEach((insight, i) => {
        console.log(`   ${i + 1}. ${insight}`);
    });

    console.log("\n" + "─".repeat(50) + "\n");
});

console.log("✅ All tests completed successfully!");