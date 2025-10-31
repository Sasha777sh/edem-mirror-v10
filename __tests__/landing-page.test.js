/**
 * @jest-environment jsdom
 */

// Simple test to verify the landing page components work
describe('Landing Page Components', () => {
    test('DemoChatSection component should be importable', () => {
        // This test just verifies that the component can be imported without errors
        const DemoChatSection = require('../src/components/DemoChatSection').default;
        expect(DemoChatSection).toBeDefined();
    });

    test('TelegramLoginButton component should be importable', () => {
        // This test just verifies that the component can be imported without errors
        const TelegramLoginButton = require('../src/components/TelegramLoginButton').default;
        expect(TelegramLoginButton).toBeDefined();
    });
});