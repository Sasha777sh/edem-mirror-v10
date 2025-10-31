// Stripe payment plans configuration

export const PLANS = {
    FREE: {
        name: 'Free',
        price: 0,
        chatLimit: 2,
        features: [
            'Basic AI chat assistant',
            'Limited to 2 chat sessions per day',
            'Standard response quality'
        ]
    },
    PRO: {
        name: 'Pro',
        price: 19.99,
        stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || 'price_pro',
        features: [
            'Advanced AI chat assistant',
            'Unlimited chat sessions',
            'Priority response quality',
            'Early access to new features',
            'Premium support'
        ]
    }
} as const;

export type PlanType = keyof typeof PLANS;