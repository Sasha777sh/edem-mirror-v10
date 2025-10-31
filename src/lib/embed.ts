import OpenAI from 'openai';

// Initialize OpenAI client only if API key is provided
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
}) : null;

/**
 * Generate embedding for text using OpenAI
 * @param text Text to embed
 * @returns Vector embedding (1536 dimensions for text-embedding-ada-002)
 */
export async function embed(text: string): Promise<number[]> {
    // If no API key, return mock embedding
    if (!openai) {
        console.warn('OPENAI_API_KEY not set, returning mock embedding');
        // Return a mock embedding with some variance
        return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }

    try {
        const response = await openai.embeddings.create({
            model: 'text-embedding-ada-002',
            input: text,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        // Return a mock embedding as fallback
        return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
    }
}