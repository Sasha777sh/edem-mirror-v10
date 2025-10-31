import { POST } from '../src/app/api/mirror_rag/route';

// Mock the Supabase client
jest.mock('@/lib/supabase', () => ({
    createServerSupabase: () => {
        return {
            from: () => {
                return {
                    select: () => {
                        return {
                            not: () => {
                                return {
                                    overlaps: () => {
                                        return {
                                            eq: () => {
                                                return {
                                                    data: [
                                                        {
                                                            id: 'test-id',
                                                            title: 'Test Card',
                                                            stage: ['shadow'],
                                                            symptom: ['anxiety'],
                                                            archetype: ['victim'],
                                                            lang: 'en',
                                                            text: 'This is a test response',
                                                            embedding: Array(1536).fill(0.1)
                                                        }
                                                    ],
                                                    error: null
                                                };
                                            }
                                        };
                                    }
                                };
                            }
                        };
                    }
                };
            }
        };
    }
}));

// Mock the embed function
jest.mock('@/lib/embed', () => ({
    embed: jest.fn().mockResolvedValue(Array(1536).fill(0.2))
}));

describe('RAG API Endpoint', () => {
    it('should return a response for a valid query', async () => {
        const req = {
            json: async () => ({
                query: 'I feel anxious',
                stage: 'shadow',
                symptom: 'anxiety',
                lang: 'en'
            })
        };

        const response = await POST(req as any);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toHaveProperty('response');
        expect(data).toHaveProperty('stage');
        expect(data.stage).toBe('shadow');
    });

    it('should return an error for missing query', async () => {
        const req = {
            json: async () => ({})
        };

        const response = await POST(req as any);

        expect(response.status).toBe(400);
    });
});