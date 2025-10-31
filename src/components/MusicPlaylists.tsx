'use client';

import { useState } from 'react';
import { useFeatureFlag } from '@/hooks/useFeatureFlags';
import { Play, Pause, Music, Zap, Moon, Sun } from 'lucide-react';

interface Playlist {
    id: string;
    title: string;
    description: string;
    mood: 'focus' | 'relax' | 'sleep';
    duration: string;
    tracks: number;
    provider: 'spotify' | 'youtube';
    url: string;
    coverImage: string;
}

const PLAYLISTS: Playlist[] = [
    {
        id: 'focus-1',
        title: 'Deep Focus Flow',
        description: 'Концентрация и ясность мысли',
        mood: 'focus',
        duration: '1h 30m',
        tracks: 18,
        provider: 'spotify',
        url: '#',
        coverImage: 'https://placehold.co/300x300/8B5CF6/FFFFFF?text=Focus'
    },
    {
        id: 'focus-2',
        title: 'Morning Energy Boost',
        description: 'Энергия для продуктивного дня',
        mood: 'focus',
        duration: '1h 15m',
        tracks: 15,
        provider: 'youtube',
        url: '#',
        coverImage: 'https://placehold.co/300x300/3B82F6/FFFFFF?text=Energy'
    },
    {
        id: 'relax-1',
        title: 'Evening Wind Down',
        description: 'Спокойствие после напряжённого дня',
        mood: 'relax',
        duration: '1h 45m',
        tracks: 20,
        provider: 'spotify',
        url: '#',
        coverImage: 'https://placehold.co/300x300/10B981/FFFFFF?text=Relax'
    },
    {
        id: 'relax-2',
        title: 'Nature Sounds & Piano',
        description: 'Звуки природы и мягкий фортепиано',
        mood: 'relax',
        duration: '2h 10m',
        tracks: 25,
        provider: 'youtube',
        url: '#',
        coverImage: 'https://placehold.co/300x300/059669/FFFFFF?text=Nature'
    },
    {
        id: 'sleep-1',
        title: 'Deep Sleep Journey',
        description: 'Глубокий и спокойный сон',
        mood: 'sleep',
        duration: '1h 30m',
        tracks: 12,
        provider: 'spotify',
        url: '#',
        coverImage: 'https://placehold.co/300x300/6366F1/FFFFFF?text=Sleep'
    },
    {
        id: 'sleep-2',
        title: 'ASMR Night Rain',
        description: 'Звуки дождя для расслабления',
        mood: 'sleep',
        duration: '2h',
        tracks: 8,
        provider: 'youtube',
        url: '#',
        coverImage: 'https://placehold.co/300x300/4F46E5/FFFFFF?text=Rain'
    }
];

interface MusicPlaylistsProps {
    className?: string;
}

export default function MusicPlaylists({ className = '' }: MusicPlaylistsProps) {
    const [playingPlaylist, setPlayingPlaylist] = useState<string | null>(null);
    const [activeMood, setActiveMood] = useState<'focus' | 'relax' | 'sleep' | 'all'>('all');
    const musicPlaylistsEnabled = useFeatureFlag('music_playlists');

    // Don't render if feature is disabled
    if (!musicPlaylistsEnabled) {
        return null;
    }

    const togglePlay = (playlistId: string) => {
        if (playingPlaylist === playlistId) {
            setPlayingPlaylist(null);
        } else {
            setPlayingPlaylist(playlistId);
        }
    };

    const filteredPlaylists = activeMood === 'all'
        ? PLAYLISTS
        : PLAYLISTS.filter(p => p.mood === activeMood);

    const getMoodIcon = (mood: string) => {
        switch (mood) {
            case 'focus': return <Zap className="w-5 h-5" />;
            case 'relax': return <Sun className="w-5 h-5" />;
            case 'sleep': return <Moon className="w-5 h-5" />;
            default: return <Music className="w-5 h-5" />;
        }
    };

    const getMoodColor = (mood: string) => {
        switch (mood) {
            case 'focus': return 'bg-yellow-100 text-yellow-800';
            case 'relax': return 'bg-green-100 text-green-800';
            case 'sleep': return 'bg-indigo-100 text-indigo-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className={className}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Музыкальные плейлисты</h2>
                <p className="text-gray-600 mb-6">
                    Подборки музыки для разных состояний и практик
                </p>

                {/* Mood Filters */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveMood('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeMood === 'all'
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Все
                    </button>
                    <button
                        onClick={() => setActiveMood('focus')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeMood === 'focus'
                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Zap className="w-4 h-4" />
                        Собраться
                    </button>
                    <button
                        onClick={() => setActiveMood('relax')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeMood === 'relax'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Sun className="w-4 h-4" />
                        Расслабиться
                    </button>
                    <button
                        onClick={() => setActiveMood('sleep')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeMood === 'sleep'
                                ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        <Moon className="w-4 h-4" />
                        Заснуть
                    </button>
                </div>
            </div>

            {/* Playlists Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPlaylists.map((playlist) => (
                    <div
                        key={playlist.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                    >
                        <div className="relative">
                            <img
                                src={playlist.coverImage}
                                alt={playlist.title}
                                className="w-full h-48 object-cover"
                            />
                            <button
                                onClick={() => togglePlay(playlist.id)}
                                className="absolute bottom-4 right-4 w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center text-white hover:bg-violet-700 transition-colors"
                            >
                                {playingPlaylist === playlist.id ? (
                                    <Pause className="w-5 h-5" />
                                ) : (
                                    <Play className="w-5 h-5 ml-1" />
                                )}
                            </button>
                        </div>

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">{playlist.title}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMoodColor(playlist.mood)}`}>
                                    {getMoodIcon(playlist.mood)}
                                </span>
                            </div>

                            <p className="text-gray-600 text-sm mb-4">
                                {playlist.description}
                            </p>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>{playlist.tracks} треков</span>
                                <span>{playlist.duration}</span>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <a
                                    href={playlist.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 px-3 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
                                >
                                    {playlist.provider === 'spotify' ? 'Spotify' : 'YouTube'}
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-violet-50 rounded-xl border border-violet-100">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Music className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                            Как использовать музыку в практиках
                        </h3>
                        <p className="text-gray-700 text-sm">
                            Слушайте плейлисты во время медитаций, дыхательных практик и записей в дневник.
                            Музыка усиливает эффект практик и помогает глубже погрузиться в процесс.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}