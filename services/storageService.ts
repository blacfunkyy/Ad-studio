import { GeneratedAd, Folder, Settings, AdTemplate } from "../types";

const ADS_STORAGE_KEY = 'ad-creator-generated-ads';
const FOLDERS_STORAGE_KEY = 'ad-creator-folders';
const SETTINGS_STORAGE_KEY = 'ad-creator-settings';
const USER_TEMPLATES_STORAGE_KEY = 'ad-creator-user-templates';

// --- Ads ---
export const getGeneratedAds = (): GeneratedAd[] => {
  try {
    const savedAdsJson = localStorage.getItem(ADS_STORAGE_KEY);
    return savedAdsJson ? JSON.parse(savedAdsJson) : [];
  } catch (e) { console.error(e); return []; }
};

export const getGeneratedAd = (id: string): GeneratedAd | undefined => {
    return getGeneratedAds().find(ad => ad.id === id);
}

export const saveGeneratedAd = (ad: GeneratedAd): void => {
  try {
    const allAds = getGeneratedAds();
    const existingAdIndex = allAds.findIndex(a => a.id === ad.id);
    if (existingAdIndex > -1) allAds[existingAdIndex] = ad;
    else allAds.push(ad);
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(allAds));
  } catch (e) { console.error(e); }
};

export const deleteGeneratedAd = (adId: string): void => {
    try {
        const updatedAds = getGeneratedAds().filter(ad => ad.id !== adId);
        localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updatedAds));
    } catch (e) { console.error(e); }
}

// --- Folders ---
export const getFolders = (): Folder[] => {
  try {
    const savedJson = localStorage.getItem(FOLDERS_STORAGE_KEY);
    return savedJson ? JSON.parse(savedJson) : [];
  } catch (e) { console.error(e); return []; }
};

export const saveFolder = (folder: Folder): void => {
  try {
    const allFolders = getFolders();
    const existingIndex = allFolders.findIndex(f => f.id === folder.id);
    if (existingIndex > -1) allFolders[existingIndex] = folder;
    else allFolders.push(folder);
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(allFolders));
  } catch (e) { console.error(e); }
};

export const deleteFolder = (folderId: string): void => {
    try {
        const updatedFolders = getFolders().filter(f => f.id !== folderId);
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders));
        // Also un-assign ads from this folder
        const updatedAds = getGeneratedAds().map(ad => ad.folderId === folderId ? { ...ad, folderId: undefined } : ad);
        localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updatedAds));
    } catch (e) { console.error(e); }
}

// --- Settings ---
export const getSettings = (): Settings => {
    const defaults: Settings = {
        defaultPrompt: '',
        defaultCreativeStyle: 'Minimalist & Clean',
        defaultCtaTextColor: '#FFFFFF',
        defaultCtaBackgroundColor: '#000000',
        defaultCtaPadding: 12,
        defaultCtaCornerRadius: 8,
    };
    try {
        const savedJson = localStorage.getItem(SETTINGS_STORAGE_KEY);
        return savedJson ? { ...defaults, ...JSON.parse(savedJson) } : defaults;
    } catch (e) { console.error(e); return defaults; }
};

export const saveSettings = (settings: Settings): void => {
    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) { console.error(e); }
};


// --- User Templates ---
export const getUserTemplates = (): AdTemplate[] => {
  try {
    const savedJson = localStorage.getItem(USER_TEMPLATES_STORAGE_KEY);
    return savedJson ? JSON.parse(savedJson) : [];
  } catch (e) { console.error(e); return []; }
};

export const saveUserTemplate = (template: AdTemplate): void => {
  try {
    const allTemplates = getUserTemplates();
    const existingIndex = allTemplates.findIndex(f => f.id === template.id);
    if (existingIndex > -1) allTemplates[existingIndex] = template;
    else allTemplates.push(template);
    localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(allTemplates));
  } catch (e) { console.error(e); }
};

export const deleteUserTemplate = (templateId: string): void => {
    try {
        const updatedTemplates = getUserTemplates().filter(f => f.id !== templateId);
        localStorage.setItem(USER_TEMPLATES_STORAGE_KEY, JSON.stringify(updatedTemplates));
    } catch (e) { console.error(e); }
}