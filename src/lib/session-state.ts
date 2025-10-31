import { sql } from './db';
import { Stage, SignalDetection } from './stages';

export interface SessionState {
    id: string;
    user_id: string;
    session_id: string;
    stage: Stage;
    defensiveness: number;
    acknowledgement: number;
    readiness: number;
    shadow_streak: number;
    updated_at: Date;
    created_at: Date;
}

/**
 * Get current session state
 * @param userId User ID
 * @param sessionId Session ID
 * @returns Current session state or null if not found
 */
export async function getSessionState(userId: string, sessionId: string): Promise<SessionState | null> {
    try {
        const result = await sql`
      SELECT * FROM session_states 
      WHERE user_id = ${userId} AND session_id = ${sessionId}
      ORDER BY updated_at DESC
      LIMIT 1
    `;

        if (result.length === 0) {
            return null;
        }

        return {
            id: result[0].id,
            user_id: result[0].user_id,
            session_id: result[0].session_id,
            stage: result[0].stage,
            defensiveness: result[0].defensiveness,
            acknowledgement: result[0].acknowledgement,
            readiness: result[0].readiness,
            shadow_streak: result[0].shadow_streak,
            updated_at: result[0].updated_at,
            created_at: result[0].created_at
        };
    } catch (error) {
        console.error('Error getting session state:', error);
        return null;
    }
}

/**
 * Save session state
 * @param userId User ID
 * @param sessionId Session ID
 * @param stage Current stage
 * @param signals Signal detection results
 * @returns Updated session state
 */
export async function saveSessionState(
    userId: string,
    sessionId: string,
    stage: Stage,
    signals: SignalDetection
): Promise<SessionState> {
    try {
        // First get current state to calculate shadow streak
        const currentState = await getSessionState(userId, sessionId);
        let shadowStreak = 0;

        if (currentState) {
            // If staying in shadow, increment streak, otherwise reset
            shadowStreak = stage === 'shadow' ? currentState.shadow_streak + 1 : 0;
        }

        // Upsert session state
        const result = await sql`
      INSERT INTO session_states (
        user_id, session_id, stage, defensiveness, acknowledgement, readiness, shadow_streak
      ) VALUES (
        ${userId}, ${sessionId}, ${stage}, ${signals.defensiveness}, ${signals.acknowledgement}, ${signals.readiness}, ${shadowStreak}
      )
      ON CONFLICT (user_id, session_id) 
      DO UPDATE SET
        stage = EXCLUDED.stage,
        defensiveness = EXCLUDED.defensiveness,
        acknowledgement = EXCLUDED.acknowledgement,
        readiness = EXCLUDED.readiness,
        shadow_streak = EXCLUDED.shadow_streak,
        updated_at = NOW()
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
            shadow_streak: result[0].shadow_streak,
            updated_at: result[0].updated_at,
            created_at: result[0].created_at
        };
    } catch (error) {
        console.error('Error saving session state:', error);
        throw error;
    }
}