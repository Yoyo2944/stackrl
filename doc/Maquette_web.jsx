import React, { useState } from 'react';
import {
Search,
PlusCircle,
Play,
Clock,
MoreVertical,
LayoutGrid,
List,
Youtube,
Video,
ChevronRight,
User,
Settings,
LogOut,
FolderPlus,
Heart
} from 'lucide-react';

const App = () => {
const [activeTab, setActiveTab] = useState('Mes Playlists');
const [searchQuery, setSearchQuery] = useState('');

// Mock data pour les playlists
const playlists = [
{
id: 1,
title: "Design Inspiration 2024",
count: 12,
videos: [
{ id: 'v1', title: "Abstract Motion Design", platform: "Vimeo", thumbnail: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=225&fit=crop", duration: "04:20" },
{ id: 'v2', title: "Minimalist Architecture", platform: "YouTube", thumbnail: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=225&fit=crop", duration: "12:45" },
{ id: 'v3', title: "UX Case Study: FinTech", platform: "YouTube", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop", duration: "08:15" },
]
},
{
id: 2,
title: "Cours de Développement",
count: 8,
videos: [
{ id: 'v4', title: "React 19 Hooks Guide", platform: "YouTube", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop", duration: "15:30" },
{ id: 'v5', title: "Three.js Masterclass", platform: "Vimeo", thumbnail: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop", duration: "45:00" },
]
},
{
id: 3,
title: "Relaxation & Lo-Fi",
count: 24,
videos: [
{ id: 'v6', title: "Rainy Night in Tokyo", platform: "YouTube", thumbnail: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=225&fit=crop", duration: "02:00:00" },
]
}
];

const SidebarItem = ({ icon: Icon, label, active = false }) => (
<div className={`flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-500 hover:bg-slate-100'}`}>
<Icon size={20} />
<span className="font-medium">{label}</span>
</div>
);

return (
<div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
    {/* Sidebar Navigation */}
    <aside className="w-64 border-r border-slate-200 bg-white p-6 flex flex-col hidden md:flex">
        <div className="flex items-center space-x-2 mb-10 px-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
                <Video className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-indigo-900">VideoHub</h1>
        </div>

        <nav className="space-y-2 flex-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menu Principal</p>
            <SidebarItem icon={LayoutGrid} label="Découvrir" />
            <SidebarItem icon={Heart} label="Favoris" />
            <SidebarItem icon={List} label="Mes Playlists" active={activeTab === 'Mes Playlists'} />
            <SidebarItem icon={Clock} label="À regarder plus tard" />

            <div className="pt-8">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Playlists récentes</p>
                {playlists.map(p => (
                <div key={p.id} className="flex items-center justify-between text-slate-500 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors group">
                    <span className="text-sm truncate pr-2 italic"># {p.title}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                ))}
            </div>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-100">
            <SidebarItem icon={User} label="Mon Compte" />
            <SidebarItem icon={Settings} label="Paramètres" />
        </div>
    </aside>

    {/* Main Content Area */}
    <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header / Search Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
            <div className="relative w-96 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                <input
                        type="text"
                        placeholder="Rechercher une vidéo ou une playlist..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-medium transition-all shadow-lg shadow-indigo-100 active:scale-95">
                    <PlusCircle size={18} />
                    <span>Ajouter un lien</span>
                </button>
                <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm cursor-pointer">
                    <img src="https://ui-avatars.com/api/?name=User&background=6366f1&color=fff" alt="Profile" />
                </div>
            </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
            {playlists.map((playlist) => (
            <section key={playlist.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center space-x-2">
                            <span>{playlist.title}</span>
                            <span className="text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full ml-3">{playlist.count} vidéos</span>
                        </h2>
                    </div>
                    <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center group">
                        Voir tout <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {/* Video Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlist.videos.map((video) => (
                    <div key={video.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100">
                        {/* Thumbnail */}
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="h-12 w-12 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/50 scale-90 group-hover:scale-100 transition-transform">
                                    <Play fill="currentColor" size={24} />
                                </div>
                            </div>
                            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">
                                {video.duration}
                            </div>
                            {/* Platform Badge */}
                            <div className="absolute top-2 left-2 flex space-x-1">
                                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md shadow-sm ${
                                     video.platform === 'YouTube' ? 'bg-red-500/90 text-white' : 'bg-sky-500/90 text-white'
                                }`}>
                                {video.platform === 'YouTube' ? <Youtube size={12} /> : <Video size={12} />}
                                <span>{video.platform}</span>
                            </div>
                        </div>
                    </div>

                    {/* Meta data */}
                    <div className="p-4">
                        <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                {video.title}
                            </h3>
                            <button className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-50">
                                <MoreVertical size={16} />
                            </button>
                        </div>
                        <div className="mt-3 flex items-center text-xs text-slate-400 space-x-2">
                            <span>Ajouté il y a 2 jours</span>
                            <span>•</span>
                            <span className="flex items-center"><Clock size={10} className="mr-1" /> 12k vues</span>
                        </div>
                    </div>
                </div>
                ))}

                {/* Add Video Placeholder in Playlist */}
                <div className="border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center p-6 text-slate-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 cursor-pointer transition-all min-h-[220px] group">
                    <div className="bg-slate-100 p-3 rounded-full group-hover:bg-indigo-100 transition-colors">
                        <PlusCircle size={32} />
                    </div>
                    <span className="mt-3 font-medium text-sm">Ajouter à cette playlist</span>
                </div>
        </div>
        </section>
        ))}

        {/* New Playlist Action */}
        <section className="bg-indigo-900 rounded-[2.5rem] p-10 relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-indigo-200">
            <div className="relative z-10 space-y-4 max-w-md">
                <h2 className="text-3xl font-bold">Organisez votre propre bibliothèque</h2>
                <p className="text-indigo-100/80">Regroupez vos tutoriels, clips musicaux et documentaires préférés dans des collections personnalisées.</p>
                <button className="bg-white text-indigo-900 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-xl active:scale-95">
                    Créer une nouvelle playlist
                </button>
            </div>
            <div className="absolute right-0 top-0 w-1/3 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none"></div>
            <FolderPlus size={160} className="text-indigo-800/50 absolute -right-10 -bottom-10" />
        </section>
</div>
</main>

<style>{`
.custom-scrollbar::-webkit-scrollbar {
    width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #e2e8f0;
    border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #cbd5e1;
}
    `}</style>
</div>
);
};

export default App;
