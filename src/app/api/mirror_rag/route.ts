import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { embed } from '@/lib/embed';

/**
 * POST /api/mirror_rag
 * Get RAG response based on user input and embeddings
 */
export async function POST(request: Request) {
    try {
        const supabase = createServerSupabase();

        const body = await request.json();
        const { query, stage, symptom, lang = 'ru' } = body;

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        // Generate embedding for the query
        const queryEmbedding = await embed(query);

        // Build the search query with filters
        let rpcQuery = supabase
            .from('rag_chunks')
            .select('id, title, stage, symptom, archetype, lang, text, embedding')
            .not('embedding', 'is', null);

        // Apply stage filter
        if (stage) {
            rpcQuery = rpcQuery.overlaps('stage', [stage]);
        }

        // Apply symptom filter
        if (symptom) {
            rpcQuery = rpcQuery.overlaps('symptom', [symptom]);
        }

        // Apply language filter
        rpcQuery = rpcQuery.eq('lang', lang);

        // Get all matching chunks
        const { data: chunks, error } = await rpcQuery;

        if (error) {
            console.error('Error searching RAG chunks:', error);
            return NextResponse.json({ error: 'Failed to search RAG chunks' }, { status: 500 });
        }

        if (!chunks || chunks.length === 0) {
            return NextResponse.json({
                response: 'Извините, я не нашел подходящей информации для вашего запроса.',
                stage: stage || 'shadow'
            });
        }

        // Calculate cosine similarity for each chunk
        const similarities = chunks.map((chunk: any) => {
            if (!chunk.embedding) return { chunk, similarity: 0 };

            // Calculate cosine similarity
            const dotProduct = queryEmbedding.reduce((sum: number, val: number, i: number) => sum + val * chunk.embedding![i], 0);
            const queryMagnitude = Math.sqrt(queryEmbedding.reduce((sum: number, val: number) => sum + val * val, 0));
            const chunkMagnitude = Math.sqrt(chunk.embedding!.reduce((sum: number, val: number) => sum + val * val, 0));

            const similarity = queryMagnitude && chunkMagnitude ?
                dotProduct / (queryMagnitude * chunkMagnitude) : 0;

            return { chunk, similarity };
        });

        // Sort by similarity and get top result
        similarities.sort((a: any, b: any) => b.similarity - a.similarity);
        const bestMatch = similarities[0];

        // Extract the appropriate text based on stage
        let responseText = '';
        if (typeof bestMatch.chunk.text === 'object' && bestMatch.chunk.text !== null) {
            // If text is an object with stage-specific content
            responseText = bestMatch.chunk.text[stage as string] ||
                bestMatch.chunk.text.truth ||
                bestMatch.chunk.text.shadow ||
                JSON.stringify(bestMatch.chunk.text);
        } else {
            // If text is a simple string
            responseText = bestMatch.chunk.text as string;
        }

        return NextResponse.json({
            response: responseText,
            stage: stage || 'shadow',
            context: {
                title: bestMatch.chunk.title,
                similarity: bestMatch.similarity,
                id: bestMatch.chunk.id
            }
        });

    } catch (error) {
        console.error('Error in RAG response:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}