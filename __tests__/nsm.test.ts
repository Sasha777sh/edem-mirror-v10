/**
 * Test suite for NSM (Net Satisfaction Metric) implementation
 */

// Mock the database functions for testing
jest.mock('@/lib/db', () => ({
    sql: jest.fn()
}));

import { calculateOverallNsm, getNsmTrend } from '@/lib/nsm';

describe('NSM Implementation', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
    });

    describe('calculateOverallNsm', () => {
        it('should calculate NSM correctly with positive feedback', async () => {
            // Mock database response
            const mockSql = require('@/lib/db').sql;
            mockSql.mockResolvedValue([
                {
                    total_sessions: '100',
                    positive_feedback: '70',
                    negative_feedback: '30',
                    avg_shift_score: '7.5'
                }
            ]);

            const result = await calculateOverallNsm();

            expect(result).toEqual({
                totalSessions: 100,
                positiveFeedback: 70,
                negativeFeedback: 30,
                nsmScore: 40, // (70/100 - 30/100) * 100 = 40
                averageShiftScore: '7.5'
            });
        });

        it('should handle zero sessions', async () => {
            const mockSql = require('@/lib/db').sql;
            mockSql.mockResolvedValue([
                {
                    total_sessions: '0',
                    positive_feedback: '0',
                    negative_feedback: '0',
                    avg_shift_score: null
                }
            ]);

            const result = await calculateOverallNsm();

            expect(result).toEqual({
                totalSessions: 0,
                positiveFeedback: 0,
                negativeFeedback: 0,
                nsmScore: 0,
                averageShiftScore: null
            });
        });
    });

    describe('getNsmTrend', () => {
        it('should return trend data', async () => {
            const mockSql = require('@/lib/db').sql;
            mockSql.mockResolvedValue([
                { date: '2023-01-01', nsm: '50' },
                { date: '2023-01-02', nsm: '60' }
            ]);

            const result = await getNsmTrend(7);

            expect(result).toEqual([
                { date: '2023-01-01', nsm: 50 },
                { date: '2023-01-02', nsm: 60 }
            ]);
        });
    });
});