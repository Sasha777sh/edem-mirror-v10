'use client';

import HeroVideoPreview from '@/components/HeroVideoPreview';

export default function HeroTestPage() {
    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem' }}>Hero Video Preview Test</h1>
            <HeroVideoPreview />
        </div>
    );
}