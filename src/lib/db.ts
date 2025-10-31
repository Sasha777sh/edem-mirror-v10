import postgres from 'postgres';

// Check if DATABASE_URL is properly set (not a placeholder)
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl || databaseUrl.startsWith('${{') || databaseUrl.trim() === '') {
    console.warn('DATABASE_URL is not properly configured. Using a mock connection for build process.');
    // For build process, we'll use a mock connection that won't actually connect
    // This allows the build to complete even without real database credentials
    process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
}

// Type-safe database connection
export const sql = postgres(process.env.DATABASE_URL!);