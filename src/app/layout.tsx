import type { Metadata } from 'next/types';

export const metadata: Metadata = {
    title: 'EDEM - Living LLM',
    description: 'A spiritually-intelligent AI system for psychological self-help',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}