"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Heart,
    Music2,
    Loader2,
    Languages,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientSupabase } from "@/lib/supabase-client";

// Define the ResultPayload type
type ResultPayload = { lang: Lang; answers: Record<string, string>; reflection: string };

/**
 * EDM Mirror Onboarding — Gen Z style
 * -------------------------------------------------------------
 * - Single-file React component (TailwindCSS + Framer Motion)
 * - 5-Mirror onboarding (Light, Shadow, Body, World, Spirit)
 * - RU/EN toggle, background audio, glitchy glass UI
 * - Stores answers in localStorage, builds a short "reflection"
 * - CTA: Get first mirror track (mocked API call)
 *
 * Drop into Next.js / React: <EdemMirrorOnboarding />
 * Optional props: trackUrl (Suno mp3), onComplete(result)
 */

export default function EdemMirrorOnboarding({
    trackUrl = "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Komiku/First_Steps/Komiku_-_03_-_Breathe_underwater.mp3",
    onComplete,
}: any) {
    const router = useRouter();
    const [lang, setLang] = useState<Lang>("ru");
    const T = useMemo(() => strings[lang], [lang]);

    const [step, setStep] = useState<number>(0);
    const [muted, setMuted] = useState<boolean>(false);
    const [playing, setPlaying] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [answers, setAnswers] = useState<Record<string, string>>(() => {
        if (typeof window === "undefined") return {};
        try {
            const raw = localStorage.getItem("edem.onb.answers");
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        localStorage.setItem("edem.onb.answers", JSON.stringify(answers));
    }, [answers]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Load audio settings from localStorage
        const savedMuted = localStorage.getItem("edem.onb.muted");
        const savedPlaying = localStorage.getItem("edem.onb.playing");

        if (savedMuted !== null) {
            setMuted(savedMuted === "true");
        }

        if (savedPlaying !== null) {
            setPlaying(savedPlaying === "true");
        }
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Save audio settings to localStorage
        localStorage.setItem("edem.onb.muted", muted.toString());
        localStorage.setItem("edem.onb.playing", playing.toString());
    }, [muted, playing]);

    useEffect(() => {
        const a = audioRef.current;
        if (!a) return;

        // Handle playing state
        if (playing && !muted) {
            const playPromise = a.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Auto-play prevented:", error);
                    // If autoplay is blocked, show a button to manually play
                    setPlaying(false);
                });
            }
        } else {
            a.pause();
        }
    }, [playing, muted]);

    const steps: Step[] = useMemo(
        () => [
            {
                key: "welcome",
                kind: "welcome",
                title: T.welcome.title,
                subtitle: T.welcome.subtitle,
            },
            {
                key: "light",
                kind: "question",
                icon: <Sparkles className="w-5 h-5" />,
                title: T.q1.title,
                prompt: T.q1.prompt,
                placeholder: T.q1.placeholder,
                field: "light",
            },
            {
                key: "shadow",
                kind: "question",
                icon: <Heart className="w-5 h-5 rotate-180" />,
                title: T.q2.title,
                prompt: T.q2.prompt,
                placeholder: T.q2.placeholder,
                field: "shadow",
            },
            {
                key: "body",
                kind: "question",
                icon: <Heart className="w-5 h-5" />,
                title: T.q3.title,
                prompt: T.q3.prompt,
                placeholder: T.q3.placeholder,
                field: "body",
            },
            {
                key: "world",
                kind: "question",
                icon: <Music2 className="w-5 h-5" />,
                title: T.q4.title,
                prompt: T.q4.prompt,
                placeholder: T.q4.placeholder,
                field: "world",
            },
            {
                key: "summary",
                kind: "summary",
                title: T.summary.title,
                prompt: T.summary.prompt,
            },
        ],
        [T]
    );

    const current = steps[step];

    const canNext = useMemo(() => {
        if (!current) return false;
        if (current.kind === "question") {
            const v = (answers[current.field!] || "").trim();
            return v.length > 0;
        }
        return true;
    }, [answers, current]);

    function next() {
        if (step < steps.length - 1) setStep((s) => s + 1);
    }
    function back() {
        if (step > 0) setStep((s) => s - 1);
    }

    function setAnswer(field: string, value: string) {
        setAnswers((a) => ({ ...a, [field]: value }));
    }

    async function handleFinish() {
        setLoading(true);

        const result = buildResult(answers, lang);

        // Save answers to database via API
        try {
            const response = await fetch('/api/onboarding/complete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    answers,
                    reflection: result.reflection,
                    lang
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save onboarding data');
            }
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            // We'll still redirect even if saving fails
        }

        await sleep(900);
        setLoading(false);

        // Redirect to dashboard after completion
        router.push('/app');
    }

    return (
        <div className="relative min-h-[100dvh] w-full overflow-hidden bg-black text-white">
            {/* Aura bg */}
            <div className="pointer-events-none absolute inset-0 ">
                <div className="absolute -top-40 -left-40 h-[60vh] w-[60vh] rounded-full bg-fuchsia-500/20 blur-[100px]" />
                <div className="absolute -bottom-40 -right-40 h-[60vh] w-[60vh] rounded-full bg-cyan-500/20 blur-[100px]" />
            </div>

            {/* Audio */}
            <audio ref={audioRef} src={trackUrl} loop muted={muted} />

            {/* Top bar */}
            <div className="relative z-10 flex items-center justify-between px-4 py-3 md:px-8">
                <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-md bg-white/10 backdrop-blur-sm grid place-items-center">
                        <Sparkles className="w-4 h-4 text-fuchsia-300" />
                    </div>
                    <span className="text-sm tracking-wide text-white/80">EDM Mirror</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setLang((l) => (l === "ru" ? "en" : "ru"))}
                        className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-white/10"
                    >
                        <Languages className="h-4 w-4 opacity-70 group-hover:opacity-100" />
                        <span>{lang.toUpperCase()}</span>
                    </button>
                    <button
                        onClick={() => setPlaying((p) => !p)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-white/10"
                        aria-label="play-pause"
                    >
                        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} {T.ui.play}
                    </button>
                    <button
                        onClick={() => setMuted((m) => !m)}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 backdrop-blur hover:bg-white/10"
                        aria-label="mute"
                    >
                        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 mx-auto grid min-h-[calc(100dvh-64px)] max-w-4xl place-items-center px-4 py-6 md:px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={current.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                        className="w-full"
                    >
                        {current.kind === "welcome" && (
                            <WelcomeCard T={T} onStart={() => setStep(1)} />
                        )}

                        {current.kind === "question" && (
                            <QuestionCard
                                stepIndex={step}
                                total={steps.length}
                                icon={current.icon}
                                title={current.title}
                                prompt={current.prompt}
                                placeholder={current.placeholder!}
                                value={answers[current.field!] || ""}
                                onChange={(v) => setAnswer(current.field!, v)}
                                onNext={next}
                                onBack={back}
                                canNext={canNext}
                                T={T}
                            />
                        )}

                        {current.kind === "summary" && (
                            <SummaryCard
                                T={T}
                                answers={answers}
                                lang={lang}
                                onBack={back}
                                onFinish={handleFinish}
                                loading={loading}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Heartbeat aura */}
            <div className="pointer-events-none fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04),transparent_60%)] animate-pulse" />
            </div>
        </div>
    );
}

// ————————————————————————————————————————————————————————
// Components
// ————————————————————————————————————————————————————————

function WelcomeCard({ T, onStart }: { T: Strings; onStart: () => void }) {
    return (
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
            <motion.h1
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 }}
                className="text-2xl md:text-3xl font-semibold tracking-tight"
            >
                {T.welcome.h1}
            </motion.h1>
            <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
                className="mt-3 text-white/70"
            >
                {T.welcome.lead}
            </motion.p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                    onClick={onStart}
                    className="inline-flex items-center gap-2 rounded-2xl bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-400"
                >
                    <Sparkles className="h-4 w-4" /> {T.welcome.cta}
                </button>
                <span className="text-xs text-white/50">{T.welcome.tip}</span>
            </div>
        </div>
    );
}

function QuestionCard({
    stepIndex,
    total,
    icon,
    title,
    prompt,
    placeholder,
    value,
    onChange,
    onNext,
    onBack,
    canNext,
    T,
}: {
    stepIndex: number
    total: number
    icon: React.ReactNode
    title: string
    prompt: string
    placeholder: string
    value: string
    onChange: (v: string) => void
    onNext: () => void
    onBack: () => void
    canNext: boolean
    T: Strings
}) {
    return (
        <div className="mx-auto w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
            <div className="mb-4 flex items-center gap-2 text-xs text-white/60">
                <span className="rounded bg-white/10 px-2 py-0.5">{stepIndex}/{total - 1}</span>
                <span className="inline-flex items-center gap-2">
                    {icon}
                    <span className="uppercase tracking-widest text-[10px] text-white/50">{T.ui.mirror}</span>
                </span>
            </div>
            <h2 className="text-xl md:text-2xl font-semibold">{title}</h2>
            <p className="mt-2 text-white/70">{prompt}</p>

            <div className="mt-4">
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={5}
                    className="w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white placeholder:text-white/30 outline-none ring-2 ring-transparent focus:ring-fuchsia-500/40"
                />
            </div>

            <div className="mt-5 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                    <ChevronLeft className="h-4 w-4" /> {T.ui.back}
                </button>
                <button
                    onClick={onNext}
                    disabled={!canNext}
                    className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {T.ui.next} <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function SummaryCard({
    T,
    answers,
    lang,
    loading,
    onBack,
    onFinish,
}: {
    T: Strings
    answers: Record<string, string>
    lang: Lang
    loading: boolean
    onBack: () => void
    onFinish: () => void
}) {
    const reflection = useMemo(() => buildReflection(answers, lang), [answers, lang]);

    return (
        <div className="mx-auto w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
            <h2 className="text-2xl md:text-3xl font-semibold">{T.summary.h1}</h2>
            <p className="mt-2 text-white/70">{T.summary.lead}</p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
                <CardBlock title={T.labels.light} body={answers.light} tone="light" />
                <CardBlock title={T.labels.shadow} body={answers.shadow} tone="dark" />
                <CardBlock title={T.labels.body} body={answers.body} tone="body" />
                <CardBlock title={T.labels.world} body={answers.world} tone="world" />
            </div>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
                <p className="text-sm whitespace-pre-line leading-relaxed text-white/80">{reflection}</p>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                >
                    <ChevronLeft className="h-4 w-4" /> {T.ui.back}
                </button>
                <button
                    onClick={onFinish}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-fuchsia-500/30 hover:bg-fuchsia-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />} {T.summary.cta}
                </button>
            </div>
        </div>
    );
}

function CardBlock({
    title,
    body,
    tone,
}: {
    title: string
    body?: string
    tone: "light" | "dark" | "body" | "world"
}) {
    const ring =
        tone === "light"
            ? "ring-fuchsia-500/30"
            : tone === "dark"
                ? "ring-emerald-500/30"
                : tone === "body"
                    ? "ring-cyan-500/30"
                    : "ring-violet-500/30";
    return (
        <div className={`rounded-2xl border border-white/10 bg-black/30 p-4 ring-2 ${ring}`}>
            <div className="mb-2 text-xs uppercase tracking-wide text-white/60">{title}</div>
            <div className="text-sm text-white/80 min-h-[3rem] whitespace-pre-line">
                {body?.trim() ? body : "—"}
            </div>
        </div>
    );
}

// ————————————————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————————————————

type Lang = "ru" | "en";

type Step =
    | { key: string; kind: "welcome"; title: string; subtitle: string }
    | {
        key: string
        kind: "question"
        icon: React.ReactNode
        title: string
        prompt: string
        placeholder?: string
        field?: string
    }
    | { key: string; kind: "summary"; title: string; prompt: string };

type Strings = typeof strings.ru | typeof strings.en;

const strings = {
    en: {
        ui: { next: "Next", back: "Back", play: "Play", mirror: "MIRROR" },
        welcome: {
            title: "Welcome to EDMChat",
            subtitle: "A five‑mirror onboarding to feel where you are right now.",
            h1: "See yourself. Feel the vibe.",
            lead:
                "Answer a few intimate prompts — your Mirror will reflect the Light, Shadow, Body, and World you carry today.",
            cta: "Start reflection",
            tip: "Music recommended. Headphones on.",
        },
        q1: {
            title: "Light",
            prompt: "Who praised or supported you this week? How did it feel in the body?",
            placeholder: "Type a few honest lines…",
        },
        q2: {
            title: "Shadow",
            prompt: "Who stayed silent or devalued you? What did it trigger?",
            placeholder: "Anger, shame, fear, envy — name it…",
        },
        q3: {
            title: "Body",
            prompt: "Where did your body speak (pain, sleep, tension, cold/warmth)?",
            placeholder: "Jaw, chest, belly, breath…",
        },
        q4: {
            title: "World",
            prompt: "Any odd event or sign lately? A random meeting, a small synchronicity?",
            placeholder: "Describe the scene…",
        },
        summary: {
            title: "Reflection",
            prompt: "A short mirror based on your answers.",
            h1: "Your Mirror Today",
            lead: "This is not a verdict — it's a snapshot. Breathe and feel.",
            cta: "Get first mirror track",
            toast: "Mirror saved. Your first track will be generated soon.",
        },
        labels: { light: "Your Light", shadow: "Your Shadow", body: "Your Body", world: "Your World" },
    },
    ru: {
        ui: { next: "Далее", back: "Назад", play: "Музыка", mirror: "ЗЕРКАЛО" },
        welcome: {
            title: "Добро пожаловать в EDMChat",
            subtitle: "Онбординг из пяти зеркал — чтобы почувствовать себя сейчас.",
            h1: "Увидь себя. Поймай вайб.",
            lead:
                "Ответь на несколько честных вопросов — и Зеркало отразит твой Свет, Тень, Тело и Мир сегодня.",
            cta: "Начать отражение",
            tip: "Лучше с музыкой. Надень наушники.",
        },
        q1: {
            title: "Свет",
            prompt: "Кто поддержал или похвалил тебя на этой неделе? Где это отозвалось в теле?",
            placeholder: "Пара честных строк…",
        },
        q2: {
            title: "Тень",
            prompt: "Кто промолчал или обесценил? Что это подняло внутри?",
            placeholder: "Злость, стыд, страх, зависть — назови…",
        },
        q3: {
            title: "Тело",
            prompt: "Где тело напомнило о себе (бол, сон, напряжение, холод/жар)?",
            placeholder: "Челюсть, грудь, живот, дыхание…",
        },
        q4: {
            title: "Мир",
            prompt: "Было ли странное событие или знак? Случайная встреча, синхрония?",
            placeholder: "Опиши сцену…",
        },
        summary: {
            title: "Отражение",
            prompt: "Короткое зеркало по твоим ответам.",
            h1: "Твоё зеркало сегодня",
            lead: "Это не приговор — это снимок. Подыши и почувствуй.",
            cta: "Получить первый трек‑зеркало",
            toast: "Зеркало сохранено. Твой трек скоро будет готов.",
        },
        labels: { light: "Твой Свет", shadow: "Твоя Тень", body: "Твоё Тело", world: "Твой Мир" },
    },
} as const;

function buildResult(answers: Record<string, string>, lang: Lang): ResultPayload {
    return { lang, answers, reflection: buildReflection(answers, lang) };
}

function buildReflection(answers: Record<string, string>, lang: Lang): string {
    const S = strings[lang];
    const { light = "", shadow = "", body = "", world = "" } = answers;
    const lightLine = light.trim()
        ? lang === "ru"
            ? `Свет: признай то, что уже получилось. ${pickFeeling(light, lang)}`
            : `Light: honor what already works. ${pickFeeling(light, lang)}`
        : lang === "ru"
            ? "Свет: заметь даже маленькую поддержку."
            : "Light: notice even tiny support.";

    const shadowLine = shadow.trim()
        ? lang === "ru"
            ? `Тень: назови эмоцию — и она станет дверью. ${pickFeeling(shadow, lang)}`
            : `Shadow: name the emotion — it becomes a door. ${pickFeeling(shadow, lang)}`
        : lang === "ru"
            ? "Тень: молчание тоже ответ."
            : "Shadow: silence is also an answer.";

    const bodyLine = body.trim()
        ? lang === "ru"
            ? `Тело: доверься ощущению. ${pickBody(body, lang)}`
            : `Body: trust the sensation. ${pickBody(body, lang)}`
        : lang === "ru"
            ? "Тело: вдох‑выдох — уже путь."
            : "Body: inhale–exhale is a path.";

    const worldLine = world.trim()
        ? lang === "ru"
            ? `Мир: синхрония не случайна. ${pickWorld(world, lang)}`
            : `World: synchronicity isn't random. ${pickWorld(world, lang)}`
        : lang === "ru"
            ? "Мир: смотри мягче — знаки рядом."
            : "World: soften your gaze — signs are near.";

    const close =
        lang === "ru"
            ? "Итог: у тебя уже есть всё для шага. Музыка — помоги ей прозвучать."
            : "Conclusion: you already have enough for a step. Let the music carry it.";

    return [lightLine, shadowLine, bodyLine, worldLine, "", close].join("\n");
}

function pickFeeling(text: string, lang: Lang) {
    const t = text.toLowerCase();
    const has = (w: string) => t.includes(w);
    if (lang === "ru") {
        if (has("рад")) return "Отметь радость телом — хотя бы улыбкой.";
        if (has("горж")) return "Гордость — тоже тепло. Позволь ему быть.";
        if (has("слё")) return "Слёзы = освобождение. Это хорошо.";
        return "Прими тёплую волну без оправданий.";
    } else {
        if (has("proud")) return "Let pride be warmth, not armor.";
        if (has("cry") || has("tears")) return "Tears = release. Good.";
        if (has("happy") || has("joy")) return "Mark joy in the body — a smile is enough.";
        return "Receive the warm wave without explaining it.";
    }
}

function pickBody(text: string, lang: Lang) {
    const t = text.toLowerCase();
    const has = (w: string) => t.includes(w);
    if (lang === "ru") {
        if (has("груд") || has("серд")) return "Погладь грудь ладонью 10 сек — дай телу знак безопасности.";
        if (has("жив")) return "Положи ладонь на живот — дыши медленно, 6 раз.";
        if (has("ше") || has("челюст")) return "Расслабь челюсть: рот приоткрыт, выдох длиннее вдоха.";
        return "Сделай 4 медленных цикла дыхания — и послушай звук музыки внутри.";
    } else {
        if (has("chest") || has("heart")) return "Hand to chest 10s — signal safety.";
        if (has("belly") || has("stomach") || has("gut")) return "Hand to belly — 6 slow breaths.";
        if (has("jaw") || has("neck")) return "Soften the jaw; exhale longer than inhale.";
        return "Take 4 slow breaths and listen to the inner music.";
    }
}

function pickWorld(text: string, lang: Lang) {
    const t = text.toLowerCase();
    const has = (w: string) => t.includes(w);
    if (lang === "ru") {
        if (has("встрет") || has("случайн")) return "Встречи — мосты. Скажи миру 'да' ещё раз.";
        if (has("знак") || has("сон")) return "Запиши символ — позже поймёшь точнее.";
        return "Коснись земли рукой — заземлись здесь и сейчас.";
    } else {
        if (has("met") || has("random")) return "Meetings are bridges. Tell the world 'yes' again.";
        if (has("sign") || has("dream")) return "Write the symbol down — clarity comes later.";
        return "Touch the ground — ground here and now.";
    }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));