"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface BreathingVisualizationProps {
    breathingPattern?: {
        inhaleDuration: number;
        holdDuration: number;
        exhaleDuration: number;
        pauseDuration: number;
    };
    isActive?: boolean;
}

export default function BreathingVisualization({
    breathingPattern = {
        inhaleDuration: 2000,
        holdDuration: 1000,
        exhaleDuration: 4000,
        pauseDuration: 1000
    },
    isActive = false
}: BreathingVisualizationProps) {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (!isActive) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;

            // Determine current phase and progress
            const totalCycle = breathingPattern.inhaleDuration + breathingPattern.holdDuration +
                breathingPattern.exhaleDuration + breathingPattern.pauseDuration;

            const cyclePosition = elapsed % totalCycle;

            if (cyclePosition < breathingPattern.inhaleDuration) {
                setPhase('inhale');
                setProgress(cyclePosition / breathingPattern.inhaleDuration);
            } else if (cyclePosition < breathingPattern.inhaleDuration + breathingPattern.holdDuration) {
                setPhase('hold');
                setProgress((cyclePosition - breathingPattern.inhaleDuration) / breathingPattern.holdDuration);
            } else if (cyclePosition < breathingPattern.inhaleDuration + breathingPattern.holdDuration + breathingPattern.exhaleDuration) {
                setPhase('exhale');
                setProgress((cyclePosition - breathingPattern.inhaleDuration - breathingPattern.holdDuration) / breathingPattern.exhaleDuration);
            } else {
                setPhase('pause');
                setProgress((cyclePosition - breathingPattern.inhaleDuration - breathingPattern.holdDuration - breathingPattern.exhaleDuration) / breathingPattern.pauseDuration);
            }

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(animationFrame);
        };
    }, [breathingPattern, isActive]);

    // Get phase colors
    const getPhaseColor = () => {
        switch (phase) {
            case 'inhale': return 'from-blue-400 to-cyan-300';
            case 'hold': return 'from-purple-400 to-fuchsia-300';
            case 'exhale': return 'from-orange-400 to-red-300';
            case 'pause': return 'from-gray-400 to-gray-300';
            default: return 'from-blue-400 to-cyan-300';
        }
    };

    // Get phase label
    const getPhaseLabel = () => {
        switch (phase) {
            case 'inhale': return 'Вдох';
            case 'hold': return 'Удержание';
            case 'exhale': return 'Выдох';
            case 'pause': return 'Пауза';
            default: return 'Дыхание';
        }
    };

    // Calculate size based on phase and progress
    const getSize = () => {
        switch (phase) {
            case 'inhale':
                return 80 + (progress * 40); // Grow from 80 to 120
            case 'hold':
                return 120; // Stay at 120
            case 'exhale':
                return 120 - (progress * 40); // Shrink from 120 to 80
            case 'pause':
                return 80; // Stay at 80
            default:
                return 80;
        }
    };

    if (!isActive) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="text-sm text-gray-400 mb-2">Дыхательная визуализация</div>
                    <div className="text-xs text-gray-500">Активируется во время диалога</div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Breathing circle */}
                <motion.div
                    className={`absolute w-full h-full rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-20`}
                    animate={{
                        scale: getSize() / 80,
                    }}
                    transition={{ duration: 0.1 }}
                />

                {/* Inner circle */}
                <motion.div
                    className={`absolute w-20 h-20 rounded-full bg-gradient-to-br ${getPhaseColor()} opacity-30`}
                    animate={{
                        scale: getSize() / 80 * 0.5,
                    }}
                    transition={{ duration: 0.1 }}
                />

                {/* Center dot */}
                <div className={`absolute w-4 h-4 rounded-full bg-gradient-to-br ${getPhaseColor()}`} />
            </div>

            {/* Phase indicator */}
            <div className="mt-4 text-center">
                <div className="text-lg font-medium text-white">
                    {getPhaseLabel()}
                </div>
                <div className="text-sm text-gray-400">
                    {Math.round(progress * 100)}%
                </div>
            </div>

            {/* Breathing pattern info */}
            <div className="mt-4 text-xs text-gray-500 grid grid-cols-4 gap-2">
                <div className="text-center">
                    <div className="text-blue-400">Вдох</div>
                    <div>{breathingPattern.inhaleDuration / 1000}s</div>
                </div>
                <div className="text-center">
                    <div className="text-purple-400">Удерж.</div>
                    <div>{breathingPattern.holdDuration / 1000}s</div>
                </div>
                <div className="text-center">
                    <div className="text-orange-400">Выдох</div>
                    <div>{breathingPattern.exhaleDuration / 1000}s</div>
                </div>
                <div className="text-center">
                    <div className="text-gray-400">Пауза</div>
                    <div>{breathingPattern.pauseDuration / 1000}s</div>
                </div>
            </div>
        </div>
    );
}