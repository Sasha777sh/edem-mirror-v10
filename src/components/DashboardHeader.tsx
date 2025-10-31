'use client';

import { User } from '@/lib/auth';
import { signOut } from '@/lib/supabase-client';
import { LogOut, Settings, User as UserIcon, Crown, Music } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface DashboardHeaderProps {
    user: User;
    plan: string;
}

export default function DashboardHeader({ user, plan }: DashboardHeaderProps) {
    const [showMenu, setShowMenu] = useState(false);
    const isPro = plan === 'pro';

    const handleSignOut = async () => {
        await signOut();
        window.location.href = '/';
    };

    return (
        <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/app" className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg"></div>
                        <span className="text-xl font-bold">EDEM</span>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/app" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Home
                        </Link>
                        <Link href="/app/history" className="text-gray-600 hover:text-gray-900 transition-colors">
                            History
                        </Link>
                        <Link href="/app/journal" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Journal
                        </Link>
                        <Link href="/app/progress" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Progress
                        </Link>
                        <Link href="/app/music" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                            <Music className="w-4 h-4" />
                            Music
                        </Link>
                        <Link href="/app/billing" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Subscription
                        </Link>
                        <Link href="/app/settings" className="text-gray-600 hover:text-gray-900 transition-colors">
                            Settings
                        </Link>
                    </nav>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {user.avatar_url ? (
                                <img
                                    src={user.avatar_url}
                                    alt={user.name || user.email}
                                    className="w-8 h-8 rounded-full"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-gray-600" />
                                </div>
                            )}
                            <div className="text-left hidden sm:block">
                                <div className="text-sm font-medium text-gray-900">
                                    {user.name || 'User'}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    {isPro && <Crown className="w-3 h-3 text-yellow-500" />}
                                    {isPro ? 'PRO' : 'Free'}
                                </div>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <Link
                                    href="/app/settings"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Settings className="w-4 h-4" />
                                    Settings
                                </Link>
                                <Link
                                    href="/app/billing"
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <Settings className="w-4 h-4" />
                                    Subscription
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}