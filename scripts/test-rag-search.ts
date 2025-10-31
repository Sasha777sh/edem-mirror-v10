/**
 * npx tsx test-rag-search.ts
 * Тестовый скрипт для проверки поиска по RAG чанкам
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const EMBED_MODEL = process.env.EMBED_MODEL || 'text-embedding-3-large';

export async function retrieve(query: string, k = 5, filters?: {
    stage?: string[], symptom?: string[], lang?: string
}) {
    // Получаем эмбеддинг для запроса
    const emb = await openai.embeddings.create({ model: EMBED_MODEL, input: query });
    const vec = emb.data[0].embedding;

    // Базовый запрос
    let sql = `
    select id, title, stage, symptom, archetype, lang, text,
           1 - (embedding <=> $1) as score
    from rag_chunks
    where embedding is not null
  `;
    const params: any[] = [vec];

    // Добавляем фильтры
    if (filters?.lang) {
        sql += ` and lang = $${params.length + 1}`;
        params.push(filters.lang);
    }
    if (filters?.stage?.length) {
        sql += ` and stage && $${params.length + 1}::text[]`;
        params.push(filters.stage);
    }
    if (filters?.symptom?.length) {
        sql += ` and symptom && $${params.length + 1}::text[]`;
        params.push(filters.symptom);
    }

    sql += ` order by embedding <=> $1 limit ${k}`;

    // Выполняем запрос
    const { data, error } = await supabase
        .from('rag_chunks')
        .select('id, title, stage, symptom, archetype, lang, text, embedding')
        .filter('embedding', 'not.is', null)
        .order('embedding', { foreignTable: 'embedding <=>', ascending: true })
        .limit(k);

    if (error) throw error;
    return data;
}

// Тестовый поиск
async function testSearch() {
    console.log('🔍 Testing RAG search...');

    const query = 'Мне тяжело засыпать, голова шумит, тревога';
    console.log(`\nQuery: ${query}`);

    try {
        const results = await retrieve(query, 5, { lang: 'ru', symptom: ['anxiety', 'sleep'] });
        console.log(`\nFound ${results.length} results:`);

        for (const result of results) {
            console.log(`\n--- ${result.title} ---`);
            console.log(`Stage: ${result.stage?.join(', ')}`);
            console.log(`Symptom: ${result.symptom?.join(', ')}`);
            console.log(`Archetype: ${result.archetype?.join(', ')}`);
            console.log(`Language: ${result.lang}`);
            console.log(`Text: ${JSON.stringify(result.text, null, 2)}`);
        }
    } catch (error) {
        console.error('Search failed:', error);
    }
}

// Запускаем тест
testSearch().catch(console.error);