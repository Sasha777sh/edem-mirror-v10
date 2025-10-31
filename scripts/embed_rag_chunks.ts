/**
 * npx tsx embed_rag_chunks.ts
 * Заполняет embedding для всех строк rag_chunks, где embedding IS NULL
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const {
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE,
    OPENAI_API_KEY,
    EMBED_MODEL = 'text-embedding-3-large',
    BATCH_SIZE = '64',
} = process.env as Record<string, string>;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE || !OPENAI_API_KEY) {
    throw new Error('Missing env: SUPABASE_URL / SUPABASE_SERVICE_ROLE / OPENAI_API_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

type RagRow = {
    id: string;
    title: string;
    lang: string;
    text: any; // JSONB { shadow, truth, integration }
};

function toPlainText(row: RagRow) {
    // склеиваем коротко и стабильно
    const s = row.text?.shadow ?? '';
    const t = row.text?.truth ?? '';
    const i = row.text?.integration ?? '';
    return [
        `[TITLE] ${row.title}`,
        `[LANG] ${row.lang}`,
        `[SHADOW] ${s}`,
        `[TRUTH] ${t}`,
        `[INTEGRATION] ${i}`,
    ].join('\n');
}

async function fetchBatch(limit = parseInt(BATCH_SIZE, 10)) {
    const { data, error } = await supabase
        .from('rag_chunks')
        .select('id,title,lang,text')
        .is('embedding', null)
        .limit(limit);

    if (error) throw error;
    return (data ?? []) as RagRow[];
}

async function updateEmbedding(id: string, embedding: number[]) {
    const { error } = await supabase
        .from('rag_chunks')
        .update({ embedding })
        .eq('id', id);
    if (error) throw error;
}

async function embedMany(rows: RagRow[]) {
    if (!rows.length) return 0;

    const inputs = rows.map(toPlainText);

    // OpenAI embeddings — одной пачкой
    const resp = await openai.embeddings.create({
        model: EMBED_MODEL,
        input: inputs,
    });

    const vectors = resp.data.map((d) => d.embedding as number[]);
    // Безопасность: размеры должны совпасть
    if (vectors.length !== rows.length) throw new Error('Embeddings count mismatch');

    // Обновляем построчно (надёжнее)
    for (let i = 0; i < rows.length; i++) {
        await updateEmbedding(rows[i].id, vectors[i]);
        console.log(`✓ Embedded chunk ${rows[i].id} (${rows[i].title})`);
    }

    return rows.length;
}

async function main() {
    let total = 0;
    for (; ;) {
        const batch = await fetchBatch();
        if (batch.length === 0) break;

        // Плавное ретраивание
        try {
            const done = await embedMany(batch);
            total += done;
            console.log(`✓ Embedded ${done}, total=${total}`);
        } catch (e: any) {
            console.error('Embed batch failed:', e?.message || e);
            // маленькая пауза и продолжим
            await new Promise((r) => setTimeout(r, 2000));
        }
    }

    console.log(`✅ Finished. Total embedded: ${total}`);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});