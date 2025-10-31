'use client';

'use client';

import React, { useMemo, useState } from "react";
import EmotionChart from './EmotionChart';
import NotificationSystem from './NotificationSystem';
import ProgressMicroInsights from './ProgressMicroInsights';

// EDEM — Личный кабинет: Работа с тенью v2.0
// Новые фишки: живой график эмоций, умные уведомления, микро-инсайты
// API готов: GET /api/shadows/summary, GET /api/shadows/emotions, POST /api/shadows/insights

export default function EnhancedShadowDashboard() {
    // ---- State ----
    const [topShadow, setTopShadow] = useState("shame");
    const [activeShadow, setActiveShadow] = useState<string | null>(null);
    const [todayDone, setTodayDone] = useState(false);
    const [journal, setJournal] = useState("");
    const [streak, setStreak] = useState(4);

    // Сводка по теням недели
    const shadows = useMemo(() => [
        {
            id: "shame",
            name: "Стыд",
            color: "#8b5cf6",
            ratio: 36,
            samplePhrases: ["Со мной что-то не так", "Если покажу желание — отвергнут"],
        },
        {
            id: "rejection",
            name: "Отвержение",
            color: "#ef4444",
            ratio: 28,
            samplePhrases: ["Меня не примут", "Лучше уйду раньше, чем меня бросят"],
        },
        {
            id: "control",
            name: "Контроль",
            color: "#10b981",
            ratio: 18,
            samplePhrases: ["Если отпущу — всё рухнет", "Доверять страшно"],
        },
        {
            id: "loss",
            name: "Потеря",
            color: "#f59e0b",
            ratio: 9,
            samplePhrases: ["Нельзя отпускать", "Сохранить любой ценой"],
        },
        {
            id: "guilt",
            name: "Вина",
            color: "#3b82f6",
            ratio: 9,
            samplePhrases: ["Я должен", "Надо искупить"],
        },
    ], []);

    // Данные для графика эмоций (мок)
    const emotionData = useMemo(() => {
        const days = ['2025-03-24', '2025-03-25', '2025-03-26', '2025-03-27', '2025-03-28', '2025-03-29', '2025-03-30'];
        return days.map(date => ({
            date,
            shadows: {
                shame: Math.floor(Math.random() * 40) + 10,
                rejection: Math.floor(Math.random() * 30) + 5,
                control: Math.floor(Math.random() * 25) + 5,
                loss: Math.floor(Math.random() * 20) + 2,
                guilt: Math.floor(Math.random() * 15) + 2,
            },
            totalIntensity: Math.floor(Math.random() * 60) + 40
        }));
    }, []);

    // Микро-инсайты (мок)
    const microInsights = useMemo(() => [
        {
            id: '1',
            text: 'В разговорах стало меньше слов-извинений. Голос увереннее на 15%',
            shadowType: 'shame',
            confidence: 0.87,
            date: '2025-03-29',
            validated: true
        },
        {
            id: '2',
            text: 'Дыхание при отказах стало ровнее. Паузы перед ответом удлинились',
            shadowType: 'rejection',
            confidence: 0.92,
            date: '2025-03-28'
        },
        {
            id: '3',
            text: 'Делегируешь чаще. Проверяешь результат реже — доверие растет',
            shadowType: 'control',
            confidence: 0.78,
            date: '2025-03-27',
            validated: false
        }
    ], []);

    const practices: Record<string, any> = {
        shame: {
            title: "Стыд → Подлинность",
            truthCut: "Стыд делает желание грязным. Желание — жизнь. Отказ = про совместимость, не про твою ценность.",
            body: "Дыхание 4–7–8: 10 циклов. Заметь напряжение в горле/груди и мягко расширь выдох.",
            action: "1 микро-сигнал желания: взгляд/пауза/тёплая фраза. Без объяснений и оправданий.",
            reflect: "Что стало легче после правды?",
            minutes: 5,
        },
        rejection: {
            title: "Отвержение → Ценность",
            truthCut: "Отказ — это 'не сейчас/не мне'. Он не оценивает тебя, он описывает совпадение.",
            body: "Скан тела 2 мин: лицо→грудь→живот. Замечай, где сжимается.",
            action: "1 честное 'нет' там, где обычно угождал.",
            reflect: "Где я выбрал себя вместо угождения?",
            minutes: 5,
        },
        control: {
            title: "Контроль → Доверие",
            truthCut: "Хватка даёт иллюзию опоры. Настоящая опора — в оси, не в напряжении.",
            body: "Ощущения в ладонях 1 мин + длинный выдох 2 мин.",
            action: "Делегируй 1 микрозадачу и 24 часа не проверяй.",
            reflect: "Что выдержало без моего контроля?",
            minutes: 5,
        },
        loss: {
            title: "Потеря → Отпускание",
            truthCut: "Отпуская малое, освобождаешь место большему.",
            body: "Ритм выдоха длиннее вдоха 2 мин.",
            action: "Отпусти 1 мелочь с низкой отдачей.",
            reflect: "Что пришло вместо старого?",
            minutes: 5,
        },
        guilt: {
            title: "Вина → Ответственность",
            truthCut: "Вина останавливает движение. Ответственность возвращает силу.",
            body: "Мягкая растяжка плеч 1 мин + 4 глубоких вдоха.",
            action: "Верни 1 чужую ношу. Сформулируй свою зону X.",
            reflect: "Какую энергию вернул себе?",
            minutes: 5,
        },
    };

    const calendar = useMemo(() => buildCalendarMock(), []);

    const handleValidateInsight = (id: string, isValid: boolean) => {
        console.log(`POST /api/shadows/insights/${id}/validate`, { isValid });
        // Здесь будет API вызов
    };

    const handleTriggerPractice = (shadowType: string) => {
        setActiveShadow(shadowType);
    };

    return (
        <div className="min-h-screen bg-white text-[#0b0b0c]">
            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Header с умными уведомлениями */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500" />
                        <h1 className="text-xl font-extrabold tracking-tight">EDEM · Shadow Dashboard v2.0</h1>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                        <span className="px-3 py-1 rounded-full border border-gray-200">PRO</span>
                        <NotificationSystem
                            currentShadow={topShadow}
                            practicesDone={todayDone}
                            onTriggerPractice={handleTriggerPractice}
                        />
                    </div>
                </header>

                {/* Top summary */}
                <section className="mt-6 grid md:grid-cols-3 gap-4">
                    <div className="border rounded-2xl p-4 shadow-sm">
                        <div className="text-sm text-gray-500">Тень недели</div>
                        <div className="mt-1 flex items-center justify-between">
                            <div className="text-2xl font-bold">{shadows.find(s => s.id === topShadow)?.name}</div>
                            <select
                                className="border rounded-lg px-2 py-1 text-sm"
                                value={topShadow}
                                onChange={(e) => setTopShadow(e.target.value)}
                            >
                                {shadows.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">AI-анализ чатов и практик.</p>
                        <button
                            className="mt-3 w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-2 rounded-xl transition-colors"
                            onClick={() => setActiveShadow(topShadow)}
                        >
                            Практика на сегодня ⚡
                        </button>
                    </div>

                    <div className="border rounded-2xl p-4 shadow-sm md:col-span-2">
                        <div className="text-sm text-gray-500">Карта теней (UpShadow)</div>
                        <div className="mt-3 grid grid-cols-2 md:grid-cols-5 gap-2">
                            {shadows.map((s) => (
                                <ShadowPill key={s.id} s={s} onOpen={() => setActiveShadow(s.id)} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* Живой график эмоций */}
                <section className="mt-6">
                    <EmotionChart data={emotionData} shadows={shadows} />
                </section>

                {/* Прогресс и микро-инсайты */}
                <section className="mt-6">
                    <ProgressMicroInsights
                        insights={microInsights}
                        currentStreak={streak}
                        weeklyTarget={7}
                        onValidateInsight={handleValidateInsight}
                    />
                </section>

                {/* Calendar + Insights */}
                <section className="mt-6 grid md:grid-cols-3 gap-4">
                    <div className="border rounded-2xl p-4 shadow-sm md:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Календарь</div>
                                <div className="text-lg font-semibold">История практик</div>
                            </div>
                            <div className="text-sm text-gray-500">{calendar.monthLabel}</div>
                        </div>
                        <CalendarGrid days={calendar.days} legend={calendar.legend} />
                    </div>
                    <div className="border rounded-2xl p-4 shadow-sm">
                        <div className="text-sm text-gray-500">AI-обратная связь</div>
                        <div className="mt-2 text-sm leading-relaxed text-gray-800">
                            Ты {streak} дней подряд работаешь с тенями.
                            <b>«{shadows.find(s => s.id === topShadow)?.name}»</b> отступает!
                            <div className="mt-3 p-3 bg-violet-50 border border-violet-200 rounded-xl">
                                <div className="text-xs text-violet-600 font-semibold">💡 Паттерн недели</div>
                                <div className="text-xs mt-1">Утром стыд сильнее. К вечеру — легче. Попробуй практику до 11:00</div>
                            </div>
                        </div>
                        <button className="mt-3 w-full border rounded-xl py-2 hover:bg-gray-50 transition-colors" onClick={() => setActiveShadow(topShadow)}>
                            Новая практика
                        </button>
                    </div>
                </section>

                {/* Today card */}
                <section className="mt-6 grid md:grid-cols-3 gap-4">
                    <div className="border rounded-2xl p-4 shadow-sm md:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-sm text-gray-500">Дневник</div>
                                <div className="text-lg font-semibold">Одна строка в день</div>
                            </div>
                            <label className="text-sm flex items-center gap-2">
                                <input type="checkbox" className="w-4 h-4" checked={todayDone} onChange={() => setTodayDone(!todayDone)} />
                                готово
                            </label>
                        </div>
                        <div className="mt-3 grid md:grid-cols-2 gap-3">
                            <textarea
                                placeholder="Что изменилось сегодня? Одна честная строка..."
                                value={journal}
                                onChange={(e) => setJournal(e.target.value)}
                                className="border rounded-xl p-3 min-h-[104px] focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors"
                            />
                            <div className="rounded-xl border p-3 text-sm text-gray-700 bg-gray-50">
                                <div className="font-semibold">Умные триггеры</div>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                                    <li>08:00: «День {streak + 1}. Готов к шагу?»</li>
                                    <li>15:00: «5 минут практики = свобода»</li>
                                    <li>21:00: «Что изменилось? Одна строка»</li>
                                    <li>Детекция тени в чате → автопрактика</li>
                                </ul>
                                <button className="mt-3 w-full border rounded-lg py-2 hover:bg-white transition-colors text-xs">
                                    Настроить время
                                </button>
                            </div>
                        </div>
                        <div className="mt-3 flex gap-2">
                            <button
                                className="px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                                onClick={() => {
                                    setStreak(streak + 1);
                                    alert("POST /api/journal {text: '" + journal + "', completed: true}");
                                }}
                            >
                                Сохранить + засчитать день
                            </button>
                            <button
                                className="px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors"
                                onClick={() => { setJournal(""); setTodayDone(false); }}
                            >
                                Сброс
                            </button>
                        </div>
                    </div>

                    <div className="border rounded-2xl p-4 shadow-sm">
                        <div className="text-sm text-gray-500">Интеграция с EDEM</div>
                        <p className="mt-2 text-sm text-gray-800 leading-relaxed">
                            Когда в чате звучат маркеры тени, AI предложит мини-практику.
                            Согласие = карточка откроется автоматически.
                        </p>
                        <div className="mt-3 space-y-2">
                            <button
                                className="w-full bg-gray-900 text-white rounded-xl py-2 hover:bg-gray-800 transition-colors text-sm"
                                onClick={() => setActiveShadow("shame")}
                            >
                                🧪 Симуляция из чата
                            </button>
                            <div className="text-xs text-gray-500 text-center">
                                Последний триггер: 14:32 · «стыд»
                            </div>
                        </div>
                    </div>
                </section>

                {/* Modal Practice */}
                {activeShadow && (
                    <PracticeModal
                        onClose={() => setActiveShadow(null)}
                        practice={practices[activeShadow]}
                        accent={shadows.find(s => s.id === activeShadow)?.color || "#6b7280"}
                    />
                )}
            </div>
        </div>
    );
}

function ShadowPill({ s, onOpen }: { s: any; onOpen: () => void }) {
    return (
        <button
            onClick={onOpen}
            className="group relative border rounded-xl p-3 text-left hover:shadow-md hover:scale-105 transition-all duration-200"
        >
            <div className="flex items-center justify-between">
                <div className="font-semibold">{s.name}</div>
                <div className="text-xs text-gray-500">{s.ratio}%</div>
            </div>
            <div className="mt-2 flex gap-1">
                <span className="inline-block w-2 h-2 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-gray-500">активна</span>
            </div>
            <div className="mt-2 text-xs text-gray-600 line-clamp-2">
                {s.samplePhrases.join(" · ")}
            </div>
            <div
                className="absolute inset-x-0 -bottom-0.5 h-1 rounded-b-xl group-hover:h-2 transition-all"
                style={{ background: `${s.color}33` }}
            />
        </button>
    );
}

function PracticeModal({ practice, onClose, accent }: { practice: any; onClose: () => void; accent: string }) {
    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-2 md:p-6 z-50">
            <div className="w-full max-w-2xl bg-white rounded-2xl border shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "#eef2f7" }}>
                    <div className="font-bold">Практика · {practice.title}</div>
                    <button className="text-gray-500 hover:text-gray-800 transition-colors" onClick={onClose}>✕</button>
                </div>
                <div className="p-4 grid md:grid-cols-2 gap-3">
                    <InfoBlock title="Правда" text={practice.truthCut} accent={accent} />
                    <InfoBlock title="Тело · 5 мин" text={practice.body} accent={accent} />
                    <InfoBlock title="Действие" text={practice.action} accent={accent} />
                    <InfoBlock title="Рефлексия" text={practice.reflect} accent={accent} />
                </div>
                <div className="p-4 flex items-center justify-between border-t bg-gray-50">
                    <div className="text-sm text-gray-600">Время практики ≈ {practice.minutes} мин</div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 border rounded-xl hover:bg-white transition-colors" onClick={onClose}>
                            Позже
                        </button>
                        <button
                            className="px-4 py-2 rounded-xl text-white hover:opacity-90 transition-colors"
                            style={{ background: accent }}
                            onClick={() => {
                                alert("POST /api/shadows/complete {shadowType: '" + practice.title.split(' → ')[0] + "', completed: true}");
                                onClose();
                            }}
                        >
                            ✅ Сделано
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InfoBlock({ title, text, accent }: { title: string; text: string; accent: string }) {
    return (
        <div className="border rounded-xl p-3 hover:border-gray-300 transition-colors">
            <div className="text-xs uppercase tracking-wide font-semibold" style={{ color: accent }}>{title}</div>
            <div className="mt-1 text-sm text-gray-800 leading-relaxed">{text}</div>
        </div>
    );
}

function CalendarGrid({ days, legend }: { days: any[]; legend: any[] }) {
    return (
        <div>
            <div className="grid grid-cols-7 gap-1 mt-3">
                {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(d => (
                    <div key={d} className="text-xs text-gray-500 text-center py-1">{d}</div>
                ))}
                {days.map((d, i) => (
                    <div
                        key={i}
                        className="aspect-square border rounded-lg flex items-center justify-center text-xs hover:scale-105 transition-transform cursor-pointer"
                        style={{ borderColor: "#eef2f7", background: d.bg }}
                    >
                        {d.label}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3 text-xs">
                {legend.map((l, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="inline-block w-3 h-3 rounded-sm" style={{ background: l.bg }} />
                        <span className="text-gray-600">{l.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function buildCalendarMock() {
    // Простая сетка на 5 недель, условные цвета по типу тени
    const map: any = {
        shame: "#ede9fe",
        rejection: "#fee2e2",
        control: "#dcfce7",
        loss: "#fef3c7",
        guilt: "#dbeafe",
        none: "#ffffff",
    };
    const seq = ["shame", "rejection", "control", "shame", "guilt", "loss", "none"];
    const days = Array.from({ length: 35 }, (_, i) => {
        const type = seq[i % seq.length] as keyof typeof map;
        return { label: i + 1 <= 30 ? String(i + 1) : "", bg: i + 1 <= 30 ? map[type] : "transparent" };
    });
    const legend = [
        { bg: map.shame, label: "Стыд" },
        { bg: map.rejection, label: "Отвержение" },
        { bg: map.control, label: "Контроль" },
        { bg: map.loss, label: "Потеря" },
        { bg: map.guilt, label: "Вина" },
    ];
    return { monthLabel: "Март 2025", days, legend };
}