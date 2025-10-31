"use client";
import { useEffect, useRef } from "react";

type Props = { botUsername: string };

export default function TelegramLoginButton({ botUsername }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Подключаем скрипт Telegram Login Widget
        const s = document.createElement("script");
        s.src = "https://telegram.org/js/telegram-widget.js?22";
        s.async = true;
        s.setAttribute("data-telegram-login", botUsername); // @your_bot без @
        s.setAttribute("data-size", "large");
        s.setAttribute("data-request-access", "write");
        // При успешной авторизации Telegram вызовет window.tgAuth(user)
        // Мы перехватим это и отправим на наш API
        (window as any).tgAuth = async (user: any) => {
            const res = await fetch("/api/auth/telegram/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(user),
            });
            const data = await res.json();
            if (data.ok && data.action_link) {
                // Редиректим на magic-link Supabase, чтобы создать сессию
                window.location.href = data.action_link;
            } else {
                alert(data.error || "Telegram auth failed");
            }
        };
        s.setAttribute("data-userpic", "false");
        s.setAttribute("data-onauth", "tgAuth(user)");
        ref.current?.appendChild(s);
    }, [botUsername]);

    return (
        <div className="w-full flex items-center justify-center">
            <div ref={ref} />
        </div>
    );
}