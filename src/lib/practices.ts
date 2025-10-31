import { sql } from './db';

export interface Practice {
    id: string;
    user_id: string;
    session_id: string;
    practice_key: string;
    assigned_at: Date;
    due_at: Date;
    done: boolean;
    self_report: number | null;
    note: string | null;
    created_at: Date;
    updated_at: Date;
}

/**
 * Assign a practice to a user
 * @param userId User ID
 * @param sessionId Session ID
 * @param practiceKey Practice key
 * @returns Created practice
 */
export async function assignPractice(
    userId: string,
    sessionId: string,
    practiceKey: string
): Promise<Practice> {
    try {
        // Set due date to tomorrow
        const dueAt = new Date();
        dueAt.setDate(dueAt.getDate() + 1);

        const result = await sql`
      INSERT INTO practices (
        user_id, session_id, practice_key, due_at
      ) VALUES (
        ${userId}, ${sessionId}, ${practiceKey}, ${dueAt.toISOString()}
      )
      RETURNING *
    `;

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
        console.error('Error assigning practice:', error);
        throw error;
    }
}

/**
 * Get today's practice for a user
 * @param userId User ID
 * @returns Today's practice or null if none exists
 */
export async function getPracticeForToday(userId: string): Promise<Practice | null> {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const result = await sql`
            SELECT * FROM practices 
            WHERE user_id = ${userId} 
            AND due_at >= ${today.toISOString()}
            AND due_at < ${new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString()}
            AND done = false
            ORDER BY due_at ASC
            LIMIT 1
        `;

        if (result.length === 0) {
            return null;
        }

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
        console.error('Error getting practice for today:', error);
        throw error;
    }
}

/**
 * Mark practice as done
 * @param practiceId Practice ID
 * @param selfReport Self report score (0-10)
 * @param note Optional note
 * @returns Updated practice
 */
export async function completePractice(
    practiceId: string,
    selfReport?: number,
    note?: string
): Promise<Practice> {
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
        console.error('Error completing practice:', error);
        throw error;
    }
}