import { hasAccess } from '@/lib/access';
import { withAccess } from '@/lib/server/guard';

// Mock the getUserAndRole function
jest.mock('@/lib/server/auth', () => ({
    getUserAndRole: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((data, options) => ({
            data,
            status: options?.status || 200
        }))
    }
}));

describe('Server Guard', () => {
    const { getUserAndRole } = require('@/lib/server/auth');
    const { NextResponse } = require('next/server');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should allow access when user has required role', async () => {
        getUserAndRole.mockResolvedValue({ role: 'guardian' });

        const handler = jest.fn();
        const guardedHandler = withAccess('shadow', handler);

        const req = new Request('http://localhost:3000/api/test', { method: 'POST' });
        const ctx = {};

        await guardedHandler(req, ctx);

        expect(handler).toHaveBeenCalled();
    });

    it('should deny access and return fallback when user lacks required role', async () => {
        getUserAndRole.mockResolvedValue({ role: 'public' });

        const handler = jest.fn();
        const guardedHandler = withAccess('shadow', handler);

        const req = new Request('http://localhost:3000/api/test', { method: 'POST' });
        const ctx = {};

        const response = await guardedHandler(req, ctx);

        expect(handler).not.toHaveBeenCalled();
        expect(response.status).toBe(403);
        expect(response.data.reason).toBe('forbidden');
    });

    it('should allow access to light feature for public user', async () => {
        getUserAndRole.mockResolvedValue({ role: 'public' });

        const handler = jest.fn();
        const guardedHandler = withAccess('light', handler);

        const req = new Request('http://localhost:3000/api/test', { method: 'POST' });
        const ctx = {};

        await guardedHandler(req, ctx);

        expect(handler).toHaveBeenCalled();
    });
});