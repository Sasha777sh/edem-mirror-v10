'use client';

import React, { useState, useEffect } from 'react';
import { useEdemLivingLLM } from '@/hooks/useEdemLivingLLM';

interface HistoryPermissionToggleProps {
  onPermissionChange?: (allowed: boolean) => void;
}

export default function HistoryPermissionToggle({ 
  onPermissionChange 
}: HistoryPermissionToggleProps) {
  const { getUserPreferences, toggleHistoryPermission } = useEdemLivingLLM();
  const [allowHistory, setAllowHistory] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      setLoading(true);
      const preferences = await getUserPreferences('');
      if (preferences) {
        setAllowHistory(preferences.allowHistory);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    try {
      setSaving(true);
      const newPermission = !allowHistory;
      const success = await toggleHistoryPermission('', newPermission);
      
      if (success) {
        setAllowHistory(newPermission);
        if (onPermissionChange) {
          onPermissionChange(newPermission);
        }
      } else {
        // Revert the toggle if it failed
        setAllowHistory(allowHistory);
      }
    } catch (error) {
      console.error('Error toggling history permission:', error);
      // Revert the toggle if it failed
      setAllowHistory(allowHistory);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${allowHistory ? 'bg-purple-500' : 'bg-gray-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${allowHistory ? 'translate-x-6' : ''}`}></div>
          </div>
        </div>
        <div className="flex-grow">
          <h3 className="text-lg font-medium text-gray-900">История взаимодействий</h3>
          <p className="mt-1 text-sm text-gray-600">
            {allowHistory 
              ? "Я запоминаю вашу историю для персонализации ответов" 
              : "Я не сохраняю вашу историю - каждый раз с чистого листа"}
          </p>
          <div className="mt-3">
            <button
              onClick={handleToggle}
              disabled={saving}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                allowHistory
                  ? 'text-white bg-red-600 hover:bg-red-700'
                  : 'text-white bg-green-600 hover:bg-green-700'
              } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Сохранение...
                </>
              ) : allowHistory ? (
                'Очистить историю и запретить сохранение'
              ) : (
                'Разрешить сохранение истории'
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 p-4 bg-blue-50 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">
              {allowHistory
                ? "Сохранение истории помогает мне лучше понимать вас и давать более точные ответы. Вы можете в любой момент отключить это."
                : "Без сохранения истории я не буду запоминать ваши предыдущие сообщения, но всё равно смогу помогать вам в рамках одного разговора."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}