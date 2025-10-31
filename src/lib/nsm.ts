import { sql } from './db';

export interface NsmMetrics {
    totalSessions: number;
    positiveFeedback: number;
    negativeFeedback: number;
    nsmScore: number; // Net Satisfaction Metric (-100 to +100)
    averageShiftScore: number | null;
}

/**
 * Calculate NSM (Net Satisfaction Metric) for a user
 * Formula: (% positive feedback - % negative feedback)
 */
export async function calculateUserNsm(userId: string): Promise<NsmMetrics> {
    try {
        const result = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN feedback = true THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN feedback = false THEN 1 END) as negative_feedback,
        AVG(shift_score) as avg_shift_score
      FROM session_feedback 
      WHERE user_id = ${userId}
    `;

        const { total_sessions, positive_feedback, negative_feedback, avg_shift_score } = result[0];

        const nsmScore = total_sessions > 0
            ? Math.round(((positive_feedback / total_sessions) - (negative_feedback / total_sessions)) * 100)
            : 0;

        return {
            totalSessions: parseInt(total_sessions),
            positiveFeedback: parseInt(positive_feedback),
            negativeFeedback: parseInt(negative_feedback),
            nsmScore,
            averageShiftScore: avg_shift_score ? parseFloat(avg_shift_score).toFixed(1) as any : null
        };
    } catch (error) {
        console.error('Error calculating NSM:', error);
        throw error;
    }
}

/**
 * Calculate overall NSM across all users
 */
export async function calculateOverallNsm(): Promise<NsmMetrics> {
    try {
        const result = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN feedback = true THEN 1 END) as positive_feedback,
        COUNT(CASE WHEN feedback = false THEN 1 END) as negative_feedback,
        AVG(shift_score) as avg_shift_score
      FROM session_feedback
    `;

        const { total_sessions, positive_feedback, negative_feedback, avg_shift_score } = result[0];

        const nsmScore = total_sessions > 0
            ? Math.round(((positive_feedback / total_sessions) - (negative_feedback / total_sessions)) * 100)
            : 0;

        return {
            totalSessions: parseInt(total_sessions),
            positiveFeedback: parseInt(positive_feedback),
            negativeFeedback: parseInt(negative_feedback),
            nsmScore,
            averageShiftScore: avg_shift_score ? parseFloat(avg_shift_score).toFixed(1) as any : null
        };
    } catch (error) {
        console.error('Error calculating overall NSM:', error);
        throw error;
    }
}

/**
 * Get NSM trend over time
 */
export async function getNsmTrend(days: number = 30): Promise<Array<{ date: string, nsm: number }>> {
    try {
        const result = await sql`
      SELECT 
        DATE(created_at) as date,
        ROUND(((COUNT(CASE WHEN feedback = true THEN 1 END)::float / COUNT(*)) - 
              (COUNT(CASE WHEN feedback = false THEN 1 END)::float / COUNT(*))) * 100) as nsm
      FROM session_feedback
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at)
    `;

        return result.map(row => ({
            date: row.date,
            nsm: parseInt(row.nsm)
        }));
    } catch (error) {
        console.error('Error getting NSM trend:', error);
        throw error;
    }
}