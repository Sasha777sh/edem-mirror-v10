'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Create a Supabase client for client-side operations
export function createClientSupabase() {
    return createClientComponentClient();
}

export interface User {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

// Sign up with email
export async function signUpWithEmail(email: string, password: string, name?: string) {
    const supabase = createClientSupabase();

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
            },
        },
    });

    return { data, error };
}

// Sign in with email
export async function signInWithEmail(email: string, password: string) {
    const supabase = createClientSupabase();

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    return { data, error };
}

// Sign in with magic link
export async function signInWithMagicLink(email: string) {
    const supabase = createClientSupabase();

    const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    return { data, error };
}

// Sign in with OAuth (Google, Apple)
export async function signInWithOAuth(provider: 'google' | 'apple') {
    const supabase = createClientSupabase();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    return { data, error };
}

// Sign out
export async function signOut() {
    const supabase = createClientSupabase();

    const { error } = await supabase.auth.signOut();
    return { error };
}