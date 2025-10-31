import { NextResponse } from 'next/server';
import { createServerSupabase } from '@/lib/supabase';
import { embed } from '@/lib/embed';
import OpenAI from 'openai';

/**
 * POST /api/chat/rag
 * Chat with RAG integration
 */
export async function POST(request: Request) {
    try {
        const supabase = createServerSupabase();
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const body = await request.json();
        const { message, sessionId, stage, symptom, lang = 'ru' } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        // Generate embedding for the user's message
        const queryEmbedding = await embed(message);

        // Retrieve relevant RAG chunks
        let rpcQuery = supabase
            .from('rag_chunks')
            .select('id, title, stage, symptom, archetype, lang, text')
            .not('embedding', 'is', null);

        // Apply filters
        rpcQuery = rpcQuery.eq('lang', lang);

        if (stage) {
            rpcQuery = rpcQuery.overlaps('stage', [stage]);
        }

        if (symptom) {
            rpcQuery = rpcQuery.overlaps('symptom', Array.isArray(symptom) ? symptom : [symptom]);
        }

        // Order by similarity and limit results
        const { data: chunks, error: searchError } = await rpcQuery
            .order('embedding', { ascending: true, nullsFirst: false })
            .limit(5);

        if (searchError) {
            console.error('Error searching RAG chunks:', searchError);
            return NextResponse.json({ error: 'Failed to search RAG chunks' }, { status: 500 });
        }

        // Build context from retrieved chunks
        const context = chunks.map((chunk: any) => {
            return `[${chunk.title}]\n${JSON.stringify(chunk.text)}`;
        }).join('\n\n');

        // Construct the prompt with context
        const prompt = `
You are an AI therapist assistant. Use the following context to inform your response:

Context:
${context}

User message: ${message}

Please provide a helpful response based on the context and the user's message.
`;

        // Call OpenAI API
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: 'You are a helpful AI therapist assistant.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 500,
            temperature: 0.7
        });

        const aiResponse = completion.choices[0].message.content;

        // Save the conversation to session state if sessionId is provided
        if (sessionId) {
            const { error: saveError } = await supabase
                .from('session_states')
                .insert({
                    session_id: sessionId,
                    stage: stage || 'shadow',
                    message: message,
                    response: aiResponse,
                    context_chunks: chunks.map((c: any) => c.id)
                });

            if (saveError) {
                console.error('Error saving session state:', saveError);
            }
        }

        // If stage is 'integration', create a practice
        if (stage === 'integration' && sessionId) {
            const { error: practiceError } = await supabase
                .from('practices')
                .insert({
                    session_id: sessionId,
                    title: 'Daily Practice',
                    description: aiResponse,
                    due_date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString()
                });

            if (practiceError) {
                console.error('Error creating practice:', practiceError);
            }
        }

        return NextResponse.json({
            response: aiResponse,
            chunks: chunks,
            stage: stage || 'shadow'
        });
    } catch (error) {
        console.error('Error in RAG chat:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}