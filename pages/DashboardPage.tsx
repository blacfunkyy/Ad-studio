import React, { useState, useEffect } from 'react';
import { GeneratedAd, AdTemplate, Folder } from '../types';
import { getGeneratedAds, getFolders } from '../services/storageService';
import { AD_TEMPLATES } from '../constants';
import Link from '../components/Link';

const DashboardPage: React.FC = () => {
    const [recentAds, setRecentAds] = useState<GeneratedAd[]>([]);
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        const allAds = getGeneratedAds().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setRecentAds(allAds.slice(0, 10));
        setFolders(getFolders());
    }, []);

    const TemplateCard: React.FC<{ template: AdTemplate }> = ({ template }) => (
        <Link href={`#template/${template.id}`} className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
            <img src={template.previewImage} alt={template.name} className="w-full aspect-square object-cover" />
            <div className="p-3">
                <h3 className="font-bold text-md truncate">{template.name}</h3>
            </div>
        </Link>
    );

    const AdCard: React.FC<{ ad: GeneratedAd }> = ({ ad }) => (
        <Link href={`#edit/${ad.id}`} className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
            <img src={ad.imageUrls[0]} alt={ad.name} className="w-full h-32 object-cover" />
             <div className="p-3">
                <h3 className="font-bold text-md truncate">{ad.name}</h3>
                 <p className="text-xs text-gray-500 mt-1">
                    {new Date(ad.createdAt).toLocaleDateString()}
                </p>
            </div>
        </Link>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Dashboard</h1>
                     <Link href="#create" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-md shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                        ＋ Create New Ad
                    </Link>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content: Recent Ads */}
                    <div className="lg:col-span-2">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Ads</h2>
                            {recentAds.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                                    {recentAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
                                </div>
                            ) : (
                                <div className="text-center bg-white p-12 rounded-lg shadow-sm">
                                    <p className="text-gray-500">Your recent ads will appear here.</p>
                                    <Link href="#create" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">
                                        Create your first ad!
                                    </Link>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                         <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Templates</h2>
                             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-4">
                                {AD_TEMPLATES.slice(0, 5).map(template => <TemplateCard key={template.id} template={template} />)}
                                <Link href="#templates" className="flex items-center justify-center bg-gray-200 rounded-lg text-indigo-600 hover:bg-gray-300 transition-colors font-semibold">
                                    View All &rarr;
                                </Link>
                            </div>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Folders</h2>
                            <div className="bg-white p-4 rounded-lg shadow-sm">
                                {folders.length > 0 ? (
                                    <ul className="space-y-2">
                                        {folders.map(folder => (
                                            <li key={folder.id} className="text-gray-700 hover:text-indigo-600">
                                                <Link href="#ads">{folder.name}</Link>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 text-sm">No folders created yet.</p>
                                )}
                                 <Link href="#ads" className="text-indigo-600 text-sm font-semibold hover:underline mt-3 inline-block">
                                    Manage Folders...
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;