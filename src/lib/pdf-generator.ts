// PDF генератор для PRO отчётов EDEM

import jsPDF from 'jspdf';
import { Archetype, getArchetypeById } from './archetypes';
import { generateTodayStep, TodayStep } from './today-steps';
import { getPracticeForToday, Practice } from './practices';

// Define a type for practice details
interface PracticeDetails {
    name: string;
    how: string;
    effect: string;
    durationMin: number;
}

// Function to get practice details by practice key
function getPracticeDetails(practiceKey: string): PracticeDetails {
    // This is a simplified mapping - in a real implementation, this would load from the YAML files
    const practiceMap: Record<string, PracticeDetails> = {
        'body/ground_30s': {
            name: 'Заземление 30 сек',
            how: 'Встань. Чувствуй стопы на полу, вес тела. Сделай 4 спокойных выдоха длиннее вдоха. Назови 3 факта из текущего момента.',
            effect: 'Мгновенное снижение тревоги и возвращение в тело',
            durationMin: 1
        },
        'cognitive/reframe': {
            name: 'Переоценка ситуации',
            how: 'Опиши ситуацию в 1 предложении. Назови 3 факта о ситуации. Назови 3 альтернативных объяснения. Выбери самое щадящее объяснение.',
            effect: 'Снижение когнитивных искажений и стресса',
            durationMin: 2
        },
        'body/breath_478': {
            name: 'Дыхание 4-7-8',
            how: 'Вдох 4 секунды, задержка 7 секунд, выдох 8 секунд. Повторить 4 раза.',
            effect: 'Активация парасимпатической нервной системы',
            durationMin: 2
        },
        'breath/box': {
            name: 'Квадратное дыхание',
            how: 'Вдох 4 секунды, задержка 4 секунды, выдох 4 секунды, задержка 4 секунды. Повторить 5 циклов.',
            effect: 'Баланс нервной системы и улучшение концентрации',
            durationMin: 3
        }
    };

    return practiceMap[practiceKey] || {
        name: 'Практика осознанности',
        how: 'Потратьте 5 минут на осознанное наблюдение за своим дыханием или телом.',
        effect: 'Общее снижение стресса и повышение осознанности',
        durationMin: 5
    };
}

export interface PDFReportData {
    sessionId: string;
    date: Date;
    voice: 'soft' | 'hard' | 'therapist';
    problem: string;
    polarity: string;
    body: string;
    oneWord: string;
    truthCut: string;
    archetype: Archetype;
    todayStep: TodayStep;
    practice: Practice; // Keep the original Practice object
    practiceDetails?: PracticeDetails; // Add practice details
    userName?: string;
}

// Главная функция генерации PDF
export function generatePDFReport(data: PDFReportData): jsPDF {
    const doc = new jsPDF();
    let yPos = 30;

    // === ЗАГОЛОВОК ===
    doc.setFontSize(20);
    doc.setTextColor(109, 40, 217);
    doc.text('EDEM • Персональный отчёт', 20, yPos);

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    doc.text(`${data.date.toLocaleDateString('ru-RU')} • ${getVoiceName(data.voice)}`, 20, yPos + 20);

    if (data.userName) {
        doc.text(`Пользователь: ${data.userName}`, 20, yPos + 30);
        yPos += 50;
    } else {
        yPos += 40;
    }

    // === РАЗДЕЛ 1: АНАЛИЗ КОРНЯ ===
    addSectionHeader(doc, 'АНАЛИЗ КОРНЯ', yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);

    // Проблема
    doc.setFontSize(11);
    doc.text('Описанная проблема:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    const problemLines = doc.splitTextToSize(data.problem, 170);
    doc.text(problemLines, 20, yPos);
    yPos += problemLines.length * 5 + 10;

    // Одно слово
    doc.setFontSize(11);
    doc.text('Ключевое слово из тела:', 20, yPos);
    yPos += 8;
    doc.setFontSize(14);
    doc.setTextColor(109, 40, 217);
    doc.text(`"${data.oneWord}"`, 20, yPos);
    yPos += 15;

    // Truth Cut
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Разрез истины:', 20, yPos);
    yPos += 8;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const truthLines = doc.splitTextToSize(data.truthCut, 170);
    doc.text(truthLines, 20, yPos);
    yPos += truthLines.length * 5 + 20;

    // === РАЗДЕЛ 2: АРХЕТИП (краткий) ===
    addSectionHeader(doc, 'ВАШ АРХЕТИП СЕГОДНЯ', yPos);
    yPos += 15;

    doc.setFontSize(16);
    doc.setTextColor(109, 40, 217);
    doc.text(`${data.archetype.emoji} ${data.archetype.name}`, 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text(data.archetype.shortDescription, 20, yPos);
    yPos += 20;

    // === РАЗДЕЛ 3: ШАГ НА СЕГОДНЯ ===
    addSectionHeader(doc, 'ШАГ НА СЕГОДНЯ', yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const stepLines = doc.splitTextToSize(data.todayStep.action, 170);
    doc.text(stepLines, 20, yPos);
    yPos += stepLines.length * 5 + 10;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Время выполнения: ${data.todayStep.timeMin} мин`, 20, yPos);
    yPos += 6;
    doc.text(`Критерий завершения: ${data.todayStep.check}`, 20, yPos);
    yPos += 20;

    // === РАЗДЕЛ 4: ПРАКТИКА ===
    addSectionHeader(doc, 'ПРАКТИКА НА 5 МИНУТ', yPos);
    yPos += 15;

    doc.setFontSize(14);
    doc.setTextColor(109, 40, 217);
    // Use practiceDetails.name instead of practice.name
    doc.text(data.practiceDetails?.name || 'Практика', 20, yPos);
    yPos += 12;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Как делать:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    // Use practiceDetails.how instead of practice.how
    const practiceLines = doc.splitTextToSize(data.practiceDetails?.how || 'Инструкции не найдены', 170);
    doc.text(practiceLines, 20, yPos);
    yPos += practiceLines.length * 5 + 8;

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    // Use practiceDetails.effect instead of practice.effect
    doc.text(`Эффект: ${data.practiceDetails?.effect || 'Эффект не определен'}`, 20, yPos);
    yPos += 20;

    // Проверка на новую страницу
    if (yPos > 250) {
        doc.addPage();
        yPos = 30;
    }

    // === РАЗДЕЛ 5: АРХЕТИП (развёрнутый) ===
    addSectionHeader(doc, 'ГЛУБОКИЙ АНАЛИЗ АРХЕТИПА', yPos);
    yPos += 15;

    doc.setFontSize(16);
    doc.setTextColor(109, 40, 217);
    doc.text(`${data.archetype.emoji} ${data.archetype.name}`, 20, yPos);
    yPos += 15;

    // Сила
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('• Ваша сила:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const strengthLines = doc.splitTextToSize(data.archetype.strength, 160);
    doc.text(strengthLines, 25, yPos);
    yPos += strengthLines.length * 5 + 8;

    // Искажение
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('• Как искажается:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const distortionLines = doc.splitTextToSize(data.archetype.distortion, 160);
    doc.text(distortionLines, 25, yPos);
    yPos += distortionLines.length * 5 + 8;

    // Проявление
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('• Как это проявляется:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const manifestationLines = doc.splitTextToSize(data.archetype.manifestation, 160);
    doc.text(manifestationLines, 25, yPos);
    yPos += manifestationLines.length * 5 + 8;

    // Как вернуть
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('• Что вернуть:', 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const restoreLines = doc.splitTextToSize(data.archetype.howToRestore, 160);
    doc.text(restoreLines, 25, yPos);
    yPos += restoreLines.length * 5 + 20;

    // === РАЗДЕЛ 6: ЗАКЛЮЧЕНИЕ ===
    addSectionHeader(doc, 'ДАЛЬНЕЙШИЕ ШАГИ', yPos);
    yPos += 15;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    const conclusion = `
Сегодня вы прошли через честное признание проблемы и получили инструменты для работы с ней. 

Выполните предложенный шаг в течение дня и отметьте в дневнике EDEM. Практику можно делать в любое время, когда почувствуете напряжение.

Помните: архетип показывает не кто вы есть, а какая энергия сейчас искажена. Это временное состояние, которое можно трансформировать.

Записывайте свои наблюдения и возвращайтесь к EDEM, когда понадобится новая сессия.`;

    const conclusionLines = doc.splitTextToSize(conclusion, 170);
    doc.text(conclusionLines, 20, yPos);
    yPos += conclusionLines.length * 5 + 20;

    // === ФУТЕР ===
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('EDEM • Честное зеркало психики • edem.app', 20, 280);
    doc.text(`Отчёт создан: ${new Date().toLocaleDateString('ru-RU')} ${new Date().toLocaleTimeString('ru-RU')}`, 20, 287);

    return doc;
}

// Функция для добавления заголовка раздела
function addSectionHeader(doc: jsPDF, title: string, yPos: number): void {
    doc.setFontSize(14);
    doc.setTextColor(109, 40, 217);
    doc.text(title, 20, yPos);

    // Линия под заголовком
    doc.setDrawColor(109, 40, 217);
    doc.setLineWidth(0.5);
    doc.line(20, yPos + 3, 190, yPos + 3);
}

// Функция для получения названия голоса
function getVoiceName(voice: string): string {
    const names: Record<string, string> = {
        soft: '🌑 Мягкий',
        hard: '⚡ Жёсткий',
        therapist: '🧠 Психотерапевт'
    };
    return names[voice] || voice;
}

// Функция для создания полного отчёта из данных сессии
export async function createFullReport(
    sessionData: any,
    userId: string,
    userName?: string
): Promise<PDFReportData> {
    const { inputs, output, voice, started_at } = sessionData;

    // Получаем архетип
    const archetype = getArchetypeById(output.archetype) ||
        require('./archetypes').detectArchetype(inputs.polarity, inputs.oneWord, inputs.problem);

    // Генерируем шаг на день
    const todayStep = generateTodayStep(inputs.polarity, inputs.oneWord, inputs.problem, voice);

    // Получаем практику
    const practice = await getPracticeForToday(userId);

    // Получаем детали практики
    const practiceDetails = practice ? getPracticeDetails(practice.practice_key) : undefined;

    return {
        sessionId: sessionData.id,
        date: new Date(started_at),
        voice,
        problem: inputs.problem,
        polarity: inputs.polarity,
        body: inputs.body,
        oneWord: inputs.oneWord,
        truthCut: output.truthCut,
        archetype,
        todayStep,
        practice: practice || {} as Practice, // Handle null case
        practiceDetails,
        userName
    };
}
