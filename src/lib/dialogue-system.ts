import { sql } from './db';
import { analytics } from './analytics';

// Types for the dialogue system
export type Stage = 'shadow' | 'truth' | 'integration';

export interface SessionState {
    id: string;
    user_id: string;
    session_id: string;
    stage: Stage;
    defensiveness: number; // 0-3
    acknowledgement: number; // 0-3
    readiness: number; // 0-3
    created_at: Date;
    updated_at: Date;
}

export interface Practice {
    id: string;
    user_id: string;
    session_id: string;
    practice_key: string;
    assigned_at: Date;
    due_at: Date;
    done: boolean;
    self_report: number; // 0-10
    note: string;
    created_at: Date;
    updated_at: Date;
}

export interface SignalDetection {
    defensiveness: number; // 0-3
    acknowledged: boolean;
    readiness: number; // 0-3
}

export interface RagChunk {
    id: string;
    title: string;
    stage: Stage[];
    symptom: string[];
    archetype: string[];
    modality: string[];
    language: 'ru' | 'en';
    reading_time: number;
    text_content: string;
    embedding?: number[]; // vector
    created_at: Date;
    updated_at: Date;
}

export interface PromptTemplate {
    id: string;
    name: string;
    stage: Stage;
    content: string;
    created_at: Date;
    is_active: boolean;
}

// Dialogue System Service
class DialogueSystemService {
    // Get current session state
    async getSessionState(userId: string, sessionId: string): Promise<SessionState | null> {
        try {
            const result = await sql`
        SELECT * FROM session_states 
        WHERE user_id = ${userId} AND session_id = ${sessionId}
        ORDER BY updated_at DESC
        LIMIT 1
      `;

            if (result.length === 0) {
                // Create initial state if none exists
                return await this.initializeSessionState(userId, sessionId);
            }

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                session_id: result[0].session_id,
                stage: result[0].stage,
                defensiveness: result[0].defensiveness,
                acknowledgement: result[0].acknowledgement,
                readiness: result[0].readiness,
                created_at: result[0].created_at,
                updated_at: result[0].updated_at
            };
        } catch (error) {
            console.error('Failed to get session state:', error);
            return null;
        }
    }

    // Initialize session state
    async initializeSessionState(userId: string, sessionId: string): Promise<SessionState> {
        try {
            const result = await sql`
        INSERT INTO session_states (user_id, session_id, stage)
        VALUES (${userId}, ${sessionId}, 'shadow')
        RETURNING *
      `;

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                session_id: result[0].session_id,
                stage: result[0].stage,
                defensiveness: result[0].defensiveness,
                acknowledgement: result[0].acknowledgement,
                readiness: result[0].readiness,
                created_at: result[0].created_at,
                updated_at: result[0].updated_at
            };
        } catch (error) {
            console.error('Failed to initialize session state:', error);
            throw error;
        }
    }

    // Update session state with signals
    async updateSessionState(userId: string, sessionId: string, signals: Partial<SignalDetection>): Promise<SessionState> {
        try {
            // First get current state
            let currentState = await this.getSessionState(userId, sessionId);
            if (!currentState) {
                currentState = await this.initializeSessionState(userId, sessionId);
            }

            // Update signals
            const updates: any = {};
            if (signals.defensiveness !== undefined) updates.defensiveness = signals.defensiveness;
            if (signals.acknowledged !== undefined) updates.acknowledgement = signals.acknowledged ? Math.min(currentState.acknowledgement + 1, 3) : 0;
            if (signals.readiness !== undefined) updates.readiness = signals.readiness;

            const result = await sql`
        UPDATE session_states 
        SET ${sql(updates)}, updated_at = NOW()
        WHERE user_id = ${userId} AND session_id = ${sessionId}
        RETURNING *
      `;

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                session_id: result[0].session_id,
                stage: result[0].stage,
                defensiveness: result[0].defensiveness,
                acknowledgement: result[0].acknowledgement,
                readiness: result[0].readiness,
                created_at: result[0].created_at,
                updated_at: result[0].updated_at
            };
        } catch (error) {
            console.error('Failed to update session state:', error);
            throw error;
        }
    }

    // Decide next stage based on signals
    decideStage(signals: SignalDetection, currentStage: Stage): Stage {
        // If high defensiveness, stay in shadow
        if (signals.defensiveness >= 2) return 'shadow';

        // If acknowledged and currently in shadow, move to truth
        if (signals.acknowledged && currentStage === 'shadow') return 'truth';

        // If readiness is high enough, move to integration
        if (signals.readiness >= 2) return 'integration';

        // Otherwise stay in current stage
        return currentStage;
    }

    // Update stage in database
    async updateStage(userId: string, sessionId: string, newStage: Stage): Promise<SessionState> {
        try {
            const result = await sql`
        UPDATE session_states 
        SET stage = ${newStage}, updated_at = NOW()
        WHERE user_id = ${userId} AND session_id = ${sessionId}
        RETURNING *
      `;

            // Track stage change in analytics
            analytics.track('stage_changed', {
                user_id: userId,
                session_id: sessionId,
                from_stage: result[0].stage, // This will be the old stage
                to_stage: newStage
            });

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                session_id: result[0].session_id,
                stage: result[0].stage,
                defensiveness: result[0].defensiveness,
                acknowledgement: result[0].acknowledgement,
                readiness: result[0].readiness,
                created_at: result[0].created_at,
                updated_at: result[0].updated_at
            };
        } catch (error) {
            console.error('Failed to update stage:', error);
            throw error;
        }
    }

    // Get active prompt template for stage
    async getPromptTemplate(stage: Stage): Promise<PromptTemplate | null> {
        try {
            const result = await sql`
        SELECT * FROM prompt_versions 
        WHERE stage = ${stage} AND is_active = true
        ORDER BY created_at DESC
        LIMIT 1
      `;

            if (result.length === 0) return null;

            return {
                id: result[0].id,
                name: result[0].name,
                stage: result[0].stage,
                content: result[0].content,
                created_at: result[0].created_at,
                is_active: result[0].is_active
            };
        } catch (error) {
            console.error('Failed to get prompt template:', error);
            return null;
        }
    }

    // Simple signal detection (to be enhanced with ML)
    async detectSignals(input: string): Promise<SignalDetection> {
        // This is a basic heuristic implementation
        // In production, this would use a more sophisticated NLP model

        const defensivenessMarkers = [
            'но', 'но я', 'это не про меня', 'это не я', 'я не такой',
            'это все не так', 'вы не понимаете', 'мне не помогает'
        ];

        const acknowledgmentMarkers = [
            'да', 'узнаю', 'это про меня', 'точно', 'согласен',
            'понимаю', 'осознаю', 'вижу'
        ];

        const readinessMarkers = [
            'готов', 'хочу', 'попробую', 'сделаю', 'начну',
            'готов попробовать', 'хочу измениться', 'готов работать'
        ];

        let defensiveness = 0;
        let acknowledged = false;
        let readiness = 0;

        const lowerInput = input.toLowerCase();

        // Check for defensiveness markers
        for (const marker of defensivenessMarkers) {
            if (lowerInput.includes(marker)) {
                defensiveness++;
                if (defensiveness >= 3) break;
            }
        }

        // Check for acknowledgment markers
        for (const marker of acknowledgmentMarkers) {
            if (lowerInput.includes(marker)) {
                acknowledged = true;
                break;
            }
        }

        // Check for readiness markers
        for (const marker of readinessMarkers) {
            if (lowerInput.includes(marker)) {
                readiness++;
                if (readiness >= 3) break;
            }
        }

        return {
            defensiveness: Math.min(defensiveness, 3),
            acknowledged,
            readiness: Math.min(readiness, 3)
        };
    }

    // Search RAG chunks based on stage and input
    async searchRagChunks(stage: Stage, input: string, symptoms?: string[], archetypes?: string[]): Promise<RagChunk[]> {
        try {
            // This is a simplified implementation
            // In production, this would use vector similarity search with pgvector

            let query = sql`
        SELECT * FROM rag_chunks 
        WHERE ${stage} = ANY(stage)
      `;

            if (symptoms && symptoms.length > 0) {
                query = sql`
          ${query} AND (
        `;
                for (let i = 0; i < symptoms.length; i++) {
                    if (i > 0) query = sql`${query} OR`;
                    query = sql`${query} ${symptoms[i]} = ANY(symptom)`;
                }
                query = sql`${query} )`;
            }

            if (archetypes && archetypes.length > 0) {
                query = sql`
          ${query} AND (
        `;
                for (let i = 0; i < archetypes.length; i++) {
                    if (i > 0) query = sql`${query} OR`;
                    query = sql`${query} ${archetypes[i]} = ANY(archetype)`;
                }
                query = sql`${query} )`;
            }

            query = sql`${query} ORDER BY created_at DESC LIMIT 5`;

            const result = await query;

            return result.map(row => ({
                id: row.id,
                title: row.title,
                stage: row.stage,
                symptom: row.symptom,
                archetype: row.archetype,
                modality: row.modality,
                language: row.language,
                reading_time: row.reading_time,
                text_content: row.text_content,
                embedding: row.embedding,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));
        } catch (error) {
            console.error('Failed to search RAG chunks:', error);
            return [];
        }
    }

    // Assign practice for integration stage
    async assignPractice(userId: string, sessionId: string, practiceKey: string): Promise<Practice> {
        try {
            // Set due date to tomorrow
            const dueAt = new Date();
            dueAt.setDate(dueAt.getDate() + 1);

            const result = await sql`
        INSERT INTO practices (user_id, session_id, practice_key, due_at)
        VALUES (${userId}, ${sessionId}, ${practiceKey}, ${dueAt.toISOString()})
        RETURNING *
      `;

            // Track practice assignment
            analytics.track('practice_assigned', {
                user_id: userId,
                session_id: sessionId,
                practice_key: practiceKey
            });

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                session_id: result[0].session_id,
                practice_key: result[0].practice_key,
                assigned_at: result[0].assigned_at,
                due_at: result[0].due_at,
                done: result[0].done,
                self_report: result[0].self_report,
                note: result[0].note,
                created_at: result[0].created_at,
                updated_at: result[0].updated_at
            };
        } catch (error) {
            console.error('Failed to assign practice:', error);
            throw error;
        }
    }

    // Mark practice as done
    async completePractice(practiceId: string, selfReport?: number, note?: string): Promise<Practice> {
        try {
            const updates: any = {
                done: true,
                updated_at: new Date().toISOString()
            };

            if (selfReport !== undefined) updates.self_report = selfReport;
            if (note !== undefined) updates.note = note;

            const result = await sql`
        UPDATE practices 
        SET ${sql(updates)}
        WHERE id = ${practiceId}
        RETURNING *
      `;

            // Track practice completion
            analytics.track('practice_completed', {
                practice_id: practiceId,
                self_report: selfReport,
                has_note: !!note
            });

            return {
                id: result[0].id,
                user_id: result[0].user_id,
                session_id: result[0].session_id,
                practice_key: result[0].practice_key,
                assigned_at: result[0].assigned_at,
                due_at: result[0].due_at,
                done: result[0].done,
                self_report: result[0].self_report,
                note: result[0].note,
                created_at: result[0].created_at,
                updated_at: result[0].updated_at
            };
        } catch (error) {
            console.error('Failed to complete practice:', error);
            throw error;
        }
    }

    // Build system message for LLM
    buildSystemMessage(): string {
        return `Ты — EDEM Mirror. Твоя задача — вести по трем стадиям: Shadow → Truth → Integration.
Никогда не давай больше одной практики. Никогда не спорь. Никакой морали. 
Если кризис/суицид — выведи безопасный ответ и завершай.
Сначала оцени сигналы: defensiveness, acknowledgement, readiness.
Затем выбери stage и используй соответствующий шаблон.
Русский краткий, без воды. 120–180 слов максимум.`;
    }

    // Build policy message for LLM
    buildPolicyMessage(): string {
        return `POLICY:
- If defensiveness_high: stay in Shadow (max 2 хода подряд).
- If user_acknowledged: move to Truth next turn.
- If readiness_score>=2: move to Integration.
- After Integration: schedule check-in for tomorrow.
- Always cite 1–2 факта из RAG (без ссылок для пользователя), своими словами.`;
    }

    // Build context from RAG chunks
    buildContextMessage(chunks: RagChunk[]): string {
        if (chunks.length === 0) return '';

        let context = 'CONTEXT:\n';
        chunks.forEach((chunk, index) => {
            context += `<chunk_${index + 1}>${chunk.text_content}</chunk_${index + 1}>\n`;
        });

        return context;
    }

    // Main message handler
    async handleMessage(input: string, userId: string, sessionId: string, symptoms?: string[], archetypes?: string[]): Promise<{ response: string; stage: Stage }> {
        try {
            // 1. Detect signals from input
            const signals = await this.detectSignals(input);

            // 2. Get current session state
            let sessionState = await this.getSessionState(userId, sessionId);
            if (!sessionState) {
                sessionState = await this.initializeSessionState(userId, sessionId);
            }

            // 3. Decide next stage
            const nextStage = this.decideStage(signals, sessionState.stage);

            // 4. Update session state with signals
            const updatedState = await this.updateSessionState(userId, sessionId, signals);

            // 5. If stage changed, update it
            if (nextStage !== sessionState.stage) {
                await this.updateStage(userId, sessionId, nextStage);
            }

            // 6. Search RAG for context
            const ragChunks = await this.searchRagChunks(nextStage, input, symptoms, archetypes);

            // 7. Get prompt template for stage
            const template = await this.getPromptTemplate(nextStage);

            // 8. Build messages for LLM
            const systemMessage = this.buildSystemMessage();
            const policyMessage = this.buildPolicyMessage();
            const contextMessage = this.buildContextMessage(ragChunks);

            // 9. In a real implementation, call LLM here
            // For now, we'll generate a mock response
            const mockResponse = this.generateMockResponse(nextStage, template, ragChunks, input);

            return {
                response: mockResponse,
                stage: nextStage
            };
        } catch (error) {
            console.error('Failed to handle message:', error);
            throw error;
        }
    }

    // Generate mock response (in real implementation, this would call LLM)
    private generateMockResponse(stage: Stage, template: PromptTemplate | null, chunks: RagChunk[], input: string): string {
        // This is a mock implementation - in real system this would call LLM
        switch (stage) {
            case 'shadow':
                return "Зеркало: вижу защиту через обесценивание. Триггер: критика со стороны. Цена: отсутствие поддержки и понимания со стороны близких.";
            case 'truth':
                return "Правда: на самом деле тебе важно чувствовать себя значимым. Сейчас ты закрываешь это через обесценивание, потому что боишься быть уязвимым. Место выбора: принять свою уязвимость как силу.";
            case 'integration':
                return "Шаг на сегодня (3 минуты): вспомни ситуацию, где ты чувствовал обесценивание. Напиши одно предложение о том, что ты в ней чувствовал. Якорь в теле: ощути это чувство в груди. Завтра спрошу: «Сделал ли? Что изменилось по шкале 0–10?»";
            default:
                return "Продолжай делиться своими мыслями.";
        }
    }
}

// Singleton instance
export const dialogueService = new DialogueSystemService();