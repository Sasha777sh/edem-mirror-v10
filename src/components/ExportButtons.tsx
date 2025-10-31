'use client';

import { useState } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';

interface ExportButtonsProps {
    className?: string;
}

export default function ExportButtons({ className = '' }: ExportButtonsProps) {
    const [isExporting, setIsExporting] = useState<'csv' | 'json' | null>(null);
    const journalExportEnabled = useFeatureFlag('journal_export');

    // Don't render if feature is disabled
    if (!journalExportEnabled) {
        return null;
    }

    const handleExport = async (format: 'csv' | 'json') => {
        try {
            setIsExporting(format);

            const response = await fetch(`/api/journal/export?format=${format}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Ошибка экспорта');
            }

            // Get filename from Content-Disposition header
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const filename = filenameMatch?.[1] || `edem-journal-${new Date().toISOString().split('T')[0]}.${format}`;

            // Create download
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('Export error:', error);
            alert(`Ошибка экспорта: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(null);
        }
    };

    return (
        <div className={`flex gap-3 ${className}`}>
            <button
                onClick={() => handleExport('csv')}
                disabled={isExporting !== null}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isExporting === 'csv' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Экспорт...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Скачать CSV
                    </>
                )}
            </button>

            <button
                onClick={() => handleExport('json')}
                disabled={isExporting !== null}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {isExporting === 'json' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Экспорт...
                    </>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Скачать JSON
                    </>
                )}
            </button>
        </div>
    );
}