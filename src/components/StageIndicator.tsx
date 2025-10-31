'use client';

import { motion } from 'framer-motion';

interface StageIndicatorProps {
    stage: 'shadow' | 'truth' | 'integration';
    className?: string;
}

export default function StageIndicator({ stage, className = '' }: StageIndicatorProps) {
    const stageInfo = {
        shadow: {
            title: 'Тень',
            description: 'Отзеркаливание паттерна',
            color: 'bg-purple-500',
            textColor: 'text-purple-700',
            bgColor: 'bg-purple-50'
        },
        truth: {
            title: 'Правда',
            description: 'Корневая потребность',
            color: 'bg-blue-500',
            textColor: 'text-blue-700',
            bgColor: 'bg-blue-50'
        },
        integration: {
            title: 'Интеграция',
            description: 'Микро-практика',
            color: 'bg-green-500',
            textColor: 'text-green-700',
            bgColor: 'bg-green-50'
        }
    };

    const currentStage = stageInfo[stage];

    return (
        <motion.div
            className={`flex items-center p-3 rounded-lg ${currentStage.bgColor} ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className={`w-3 h-3 rounded-full ${currentStage.color} mr-3`} />
            <div>
                <h3 className={`font-medium ${currentStage.textColor}`}>{currentStage.title}</h3>
                <p className="text-xs text-gray-600">{currentStage.description}</p>
            </div>
        </motion.div>
    );
}