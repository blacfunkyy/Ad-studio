import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedAd, Folder } from '../types';
import { getGeneratedAds, saveGeneratedAd, deleteGeneratedAd, getFolders, saveFolder, deleteFolder } from '../services/storageService';
import Link from '../components/Link';

const AdsPage: React.FC = () => {
  const [ads, setAds] = useState<GeneratedAd[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    loadContent();
  }, []);
  
  const loadContent = () => {
     setAds(getGeneratedAds().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
     setFolders(getFolders());
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
        const newFolder = { id: `folder-${Date.now()}`, name: newFolderName.trim() };
        saveFolder(newFolder);
        setNewFolderName('');
        setIsCreatingFolder(false);
        loadContent();
    }
  }

  const handleRenameAd = (ad: GeneratedAd) => {
    setEditingAdId(ad.id);
    setEditingName(ad.name);
  };

  const handleSaveAdName = (adId: string) => {
    const adToUpdate = ads.find(ad => ad.id === adId);
    if (adToUpdate) {
      const updatedAd = { ...adToUpdate, name: editingName };
      saveGeneratedAd(updatedAd);
      loadContent();
    }
    setEditingAdId(null);
  };

  const handleDeleteAd = (adId: string) => {
    if (window.confirm('Are you sure you want to delete this ad?')) {
        deleteGeneratedAd(adId);
        loadContent();
    }
  }

  const filteredAds = useMemo(() => {
    if (selectedFolderId === 'unassigned') {
        return ads.filter(ad => !ad.folderId);
    }
    return selectedFolderId ? ads.filter(ad => ad.folderId === selectedFolderId) : ads;
  }, [ads, selectedFolderId]);

  const AdCard: React.FC<{ ad: GeneratedAd }> = ({ ad }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
        <Link href={`#edit/${ad.id}`} className="block relative group">
            <img src={ad.imageUrls[0]} alt={ad.name} className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-lg font-bold">Edit Ad</span>
            </div>
        </Link>
        <div className="p-4 flex-grow flex flex-col">
          {editingAdId === ad.id ? (
            <input type="text" value={editingName} onChange={(e) => setEditingName(e.target.value)} onBlur={() => handleSaveAdName(ad.id)} onKeyPress={(e) => e.key === 'Enter' && handleSaveAdName(ad.id)} className="font-bold text-lg p-1 border rounded" autoFocus />
          ) : ( <h3 className="font-bold text-lg cursor-pointer" onClick={() => handleRenameAd(ad)}>{ad.name}</h3> )}
           <p className="text-xs text-gray-500 mt-1">Created: {new Date(ad.createdAt).toLocaleDateString()}</p>
            <div className="mt-4 pt-4 border-t border-gray-200 flex-grow flex items-end justify-end">
                <button onClick={() => handleDeleteAd(ad.id)} title="Delete Ad" className="text-red-500 hover:text-red-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">My Ads</h1>
          <Link href="#create" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-md shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">＋ Create New Ad</Link>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar for Folders */}
          <aside className="md:w-1/4 lg:w-1/5">
            <h2 className="text-lg font-semibold mb-3">Folders</h2>
            <ul className="space-y-1">
                <li><button onClick={() => setSelectedFolderId(null)} className={`w-full text-left p-2 rounded ${!selectedFolderId ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}>All Ads</button></li>
                {folders.map(folder => (
                     <li key={folder.id}><button onClick={() => setSelectedFolderId(folder.id)} className={`w-full text-left p-2 rounded ${selectedFolderId === folder.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}>{folder.name}</button></li>
                ))}
                 <li><button onClick={() => setSelectedFolderId('unassigned')} className={`w-full text-left p-2 rounded ${selectedFolderId === 'unassigned' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}>Unassigned</button></li>
            </ul>
            {isCreatingFolder ? (
                <div className="mt-4">
                    <input type="text" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} placeholder="Folder name" className="w-full p-2 border rounded mb-2" />
                    <button onClick={handleCreateFolder} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Save</button>
                    <button onClick={() => setIsCreatingFolder(false)} className="w-full mt-1 text-gray-500 text-sm">Cancel</button>
                </div>
            ) : (
                <button onClick={() => setIsCreatingFolder(true)} className="w-full mt-4 p-2 border-2 border-dashed rounded text-gray-500 hover:bg-gray-200 hover:text-gray-700">＋ New Folder</button>
            )}
          </aside>
          
          {/* Main Content */}
          <main className="flex-1">
             <section>
                {filteredAds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                        {filteredAds.map(ad => <AdCard key={ad.id} ad={ad} />)}
                    </div>
                ) : (
                    <div className="text-center bg-white p-12 rounded-lg shadow-sm">
                    <p className="text-gray-500">No ads found in this view.</p>
                    <Link href="#create" className="text-indigo-600 font-semibold hover:underline mt-2 inline-block">Create an ad to get started!</Link>
                    </div>
                )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdsPage;