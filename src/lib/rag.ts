import { createServerSupabase } from './supabase';
import { embed } from './embed';

export type Stage = 'shadow' | 'truth' | 'integration';

export interface RagChunk {
    id: string;
    title: string;
    stage: Stage[];
    symptom: string[];
    archetype: string[];
    modality: string[];
    lang: string;
    text: string;
    similarity?: number;
}

/**
 * Search RAG chunks using embeddings and filters
 * @param input User input text
 * @param filters Search filters
 * @returns Array of matching RAG chunks
 */
export async function ragSearch(
    input: string,
    filters: {
        stage: Stage;
        symptom?: string[];
        lang: 'ru' | 'en'
    }
): Promise<RagChunk[]> {
    try {
        const supabase = createServerSupabase();

        // Generate embedding for input text
        const embedding = await embed(input);

        // Call RPC function to match chunks
        const { data, error } = await supabase.rpc('match_rag_chunks', {
            query_embedding: embedding,
            match_count: 5,
            p_stage: [filters.stage],
            p_symptom: filters.symptom || [],
            p_lang: filters.lang
        });

        if (error) {
            console.error('Error searching RAG chunks:', error);
            return [];
        }

        return data.map((chunk: any) => ({
            id: chunk.id,
            title: chunk.title,
            stage: chunk.stage,
            symptom: chunk.symptom,
            archetype: chunk.archetype,
            modality: chunk.modality,
            lang: chunk.lang,
            text: chunk.text,
            similarity: chunk.similarity
        }));
    } catch (error) {
        console.error('Error in ragSearch:', error);
        return [];
    }
}