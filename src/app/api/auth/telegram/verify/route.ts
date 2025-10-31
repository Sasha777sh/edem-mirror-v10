import { NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!; // server-only
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;          // server-only

// Проверка hash согласно докам Telegram Login Widget
function verifyTelegramAuth(data: Record<string, any>) {
    const { hash, ...fields } = data;
    const sorted = Object.keys(fields)
        .sort()
        .map((k) => `${k}=${fields[k]}`)
        .join("\n");

    const secret = crypto.createHash("sha256").update(TELEGRAM_BOT_TOKEN).digest();
    const hmac = crypto.createHmac("sha256", secret).update(sorted).digest("hex");

    return hmac === hash;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        if (!verifyTelegramAuth(body)) {
            return NextResponse.json({ ok: false, error: "Invalid Telegram signature" }, { status: 401 });
        }

        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const tgId = String(body.id);
        const email = `tg_${tgId}@telegram.local`; // виртуальная почта
        const userMeta = {
            tg_id: tgId,
            tg_username: body.username || null,
            tg_first_name: body.first_name || null,
            tg_last_name: body.last_name || null,
            tg_photo_url: body.photo_url || null,
            provider: "telegram"
        };

        // Ищем пользователя по e-mail
        const { data: existing } = await supabase.auth.admin.listUsers();
        const found = existing?.users?.find((u: any) => u.email === email);

        if (!found) {
            // создаём и сразу подтверждаем email
            const { data: created, error: createErr } = await supabase.auth.admin.createUser({
                email,
                email_confirm: true,
                user_metadata: userMeta
            });
            if (createErr) return NextResponse.json({ ok: false, error: createErr.message }, { status: 500 });
        } else {
            // обновим метаданные (на всякий)
            await supabase.auth.admin.updateUserById(found.id, { user_metadata: userMeta });
        }

        // Генерируем magic-link (signin), который создаст сессию
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
            type: "magiclink",
            email
        });
        if (linkErr) return NextResponse.json({ ok: false, error: linkErr.message }, { status: 500 });

        return NextResponse.json({ ok: true, action_link: linkData?.properties?.action_link });
    } catch (e: any) {
        return NextResponse.json({ ok: false, error: e?.message || "Server error" }, { status: 500 });
    }
}