import React, { useState, useCallback, useEffect } from 'react';
import AdForm from './components/AdForm';
import AdPreview from './components/AdPreview';
import ClientModal from './components/ClientModal';
import { AdFormData, Client, GeneratedAd, GeneratedAdResult, Settings } from './types';
import { generateAd, generateAdDetails } from './services/geminiService';
import { getGeneratedAd, saveGeneratedAd, getSettings, getGeneratedAds } from './services/storageService';
import { AD_TEMPLATES, AD_SIZES, GOOGLE_FONTS } from './constants';

interface CreatorPageProps {
  adId?: string; // For editing an existing ad
  templateId?: string; // For creating from a template
}

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const prepareFormDataForSaving = async (formData: AdFormData): Promise<AdFormData> => {
    const newFormData = { ...formData };
    if (newFormData.productImage instanceof File) {
        newFormData.productImage = await fileToDataUrl(newFormData.productImage);
    }
    if (newFormData.backgroundImage instanceof File) {
        newFormData.backgroundImage = await fileToDataUrl(newFormData.backgroundImage as File);
    }
    if (newFormData.templateStyleImage instanceof File) {
        newFormData.templateStyleImage = await fileToDataUrl(newFormData.templateStyleImage as File);
    }
    if (newFormData.logoImage instanceof File) {
        newFormData.logoImage = await fileToDataUrl(newFormData.logoImage);
    }
    return newFormData;
}

const getDefaultFormData = (settings: Settings): Partial<AdFormData> => ({
  adName: `Campaign ${new Date().toLocaleDateString()}`,
  prompt: settings.defaultPrompt,
  creativeStyle: settings.defaultCreativeStyle,
  ctaTextColor: settings.defaultCtaTextColor,
  ctaBackgroundColor: settings.defaultCtaBackgroundColor,
  ctaPadding: settings.defaultCtaPadding,
  ctaCornerRadius: settings.defaultCtaCornerRadius,
  adSizes: [AD_SIZES[0]],
  header1FontFamily: GOOGLE_FONTS[3],
  header1FontSize: 48,
  header2FontFamily: GOOGLE_FONTS[3],
  header2FontSize: 32,
  descriptionFontFamily: GOOGLE_FONTS[0],
  descriptionFontSize: 18,
  priceFontFamily: GOOGLE_FONTS[0],
  priceFontSize: 24,
  salePriceFontFamily: GOOGLE_FONTS[0],
  salePriceFontSize: 28,
  ctaFontFamily: GOOGLE_FONTS[3],
  ctaFontSize: 20,
});


const CreatorPage: React.FC<CreatorPageProps> = ({ adId, templateId }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopyLoading, setIsCopyLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedAds, setGeneratedAds] = useState<GeneratedAdResult[]>([]);
  
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  const [initialFormData, setInitialFormData] = useState<Partial<AdFormData> | undefined>(undefined);

  useEffect(() => {
    try {
      const savedClients = localStorage.getItem('ad-creator-clients');
      if (savedClients) {
        setClients(JSON.parse(savedClients));
      }
    } catch (e) {
      console.error("Failed to load clients from localStorage", e);
    }
    
    let formDataToLoad: Partial<AdFormData> | undefined;

    if (adId) {
      const adToEdit = getGeneratedAd(adId);
      if (adToEdit) {
        formDataToLoad = adToEdit.formData;
        const adResults: GeneratedAdResult[] = adToEdit.imageUrls.map(url => ({
          imageUrl: url,
          formData: adToEdit.formData,
        }));
        setGeneratedAds(adResults);
      }
    } else if (templateId) {
      const templateToUse = AD_TEMPLATES.find(t => t.id === templateId);
       if (templateToUse) {
        formDataToLoad = templateToUse.formData;
        setGeneratedAds([]);
       }
    } else {
      // Load defaults from settings for a new ad
      const defaultSettings = getSettings();
      formDataToLoad = getDefaultFormData(defaultSettings);
      setGeneratedAds([]);
    }
    setInitialFormData(formDataToLoad);

  }, [adId, templateId]);

  const saveClients = (updatedClients: Client[]) => {
    setClients(updatedClients);
    localStorage.setItem('ad-creator-clients', JSON.stringify(updatedClients));
  }

  const handleSaveClient = (client: Omit<Client, 'id'>) => {
    const newClient = { ...client, id: `client-${Date.now()}` };
    const updatedClients = [...clients, newClient];
    saveClients(updatedClients);
    setSelectedClientId(newClient.id);
    setIsClientModalOpen(false);
  };

  const handleGenerateAd = useCallback(async (formData: AdFormData) => {
    setIsLoading(true);
    setError(null);
    setGeneratedAds([]);
    try {
      if (!formData.adSizes || formData.adSizes.length === 0) {
        throw new Error("Please select at least one ad size.");
      }
      const selectedClient = clients.find(c => c.id === selectedClientId);
      
      // Prepare FormData with client details if available
      const formDataWithClientDetails = { ...formData };
      if (selectedClient?.logo) {
          formDataWithClientDetails.logoImage = `data:${selectedClient.logo.mimeType};base64,${selectedClient.logo.base64}`;
      }

      const adResults = await generateAd(formDataWithClientDetails, selectedClient);
      setGeneratedAds(adResults);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while generating the ad.');
    } finally {
      setIsLoading(false);
    }
  }, [clients, selectedClientId]);
  
  const handleGenerateCopy = useCallback(async (brief: string) => {
    setIsCopyLoading(true);
    setError(null);
    try {
      const adDetails = await generateAdDetails(brief);
      // Update form data with the generated details
      setInitialFormData(prev => ({ ...prev, ...adDetails }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred while generating ad details.');
    } finally {
      setIsCopyLoading(false);
    }
  }, []);

  const handleSaveAd = async (formDataToSave: AdFormData, imageUrls: string[]) => {
    if (imageUrls.length === 0) {
      alert("Please generate an ad before saving.");
      return;
    }
    
    const id = adId || `ad-${Date.now()}`;
    const name = formDataToSave.adName || `Ad Created - ${new Date().toLocaleString()}`;

    const preparedFormData = await prepareFormDataForSaving(formDataToSave);

    const adToSave: GeneratedAd = {
      id,
      name: name,
      formData: preparedFormData,
      imageUrls: imageUrls,
      createdAt: new Date().toISOString(),
    };
    saveGeneratedAd(adToSave);
    alert("Ad saved successfully!");
    window.location.hash = '#ads';
  };

  return (
    <div className="w-full flex flex-col items-center p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-80px)]">
      <main className="w-full max-w-[1800px] flex flex-col xl:flex-row items-start gap-8">
        
        {/* Left Column: Wizard */}
        <div className="w-full xl:w-5/12 2xl:w-4/12 transition-all duration-500 ease-in-out">
           <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-indigo-200/50 border border-white/60 overflow-hidden h-[85vh] flex flex-col sticky top-24">
              <AdForm 
                onSubmit={handleGenerateAd} 
                isLoading={isLoading}
                clients={clients}
                selectedClientId={selectedClientId}
                onClientChange={setSelectedClientId}
                onAddNewClient={() => setIsClientModalOpen(true)}
                hasGeneratedAds={generatedAds.length > 0}
                initialData={initialFormData}
                onGenerateCopy={handleGenerateCopy}
                isCopyLoading={isCopyLoading}
              />
           </div>
        </div>

        {/* Right Column: Preview */}
        <div className="w-full xl:w-7/12 2xl:w-8/12 transition-all duration-500">
           <div className="bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-100/40 border border-white/40 p-2 h-[85vh] sticky top-24 overflow-hidden">
              <AdPreview
                isLoading={isLoading}
                error={error}
                adResults={generatedAds}
                onSaveAd={handleSaveAd}
              />
          </div>
        </div>
      </main>
      
      <ClientModal 
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSave={handleSaveClient}
      />
    </div>
  );
};

export default CreatorPage;