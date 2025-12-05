import React, { useState, useEffect, useMemo } from 'react';
import Input from './Input';
import FileInput from './FileInput';
import Select from './Select';
import Button from './Button';
import { CREATIVE_STYLES, AD_SIZES, CHARACTER_STYLES, GOOGLE_FONTS } from '../constants';
import { AdFormData, Client } from '../types';
import Spinner from './Spinner';

interface AdFormProps {
  onSubmit: (formData: AdFormData) => void;
  isLoading: boolean;
  clients: Client[];
  selectedClientId: string;
  onClientChange: (id: string) => void;
  onAddNewClient: () => void;
  hasGeneratedAds: boolean;
  initialData?: Partial<AdFormData>;
  onGenerateCopy: (brief: string) => void;
  isCopyLoading: boolean;
}

const STEPS = [
    { id: 1, name: "Strategy", icon: "💡" },
    { id: 2, name: "Creative", icon: "🎨" },
    { id: 3, name: "Format", icon: "📐" }
];

const AdForm: React.FC<AdFormProps> = ({ onSubmit, isLoading, clients, selectedClientId, onClientChange, onAddNewClient, hasGeneratedAds, initialData, onGenerateCopy, isCopyLoading }) => {
  const [formData, setFormData] = useState<Partial<AdFormData>>({});
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  const selectedClient = useMemo(() => clients.find(c => c.id === selectedClientId), [clients, selectedClientId]);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (selectedClient) {
      setFormData(prev => ({
        ...prev,
        header1FontFamily: prev.header1FontFamily || selectedClient.headerFontFamily,
        header1FontSize: prev.header1FontSize || selectedClient.header1FontSize,
        header2FontFamily: prev.header2FontFamily || selectedClient.headerFontFamily,
        header2FontSize: prev.header2FontSize || selectedClient.header2FontSize,
        descriptionFontFamily: prev.descriptionFontFamily || selectedClient.bodyFontFamily,
        descriptionFontSize: prev.descriptionFontSize || selectedClient.descriptionFontSize,
        priceFontFamily: prev.priceFontFamily || selectedClient.bodyFontFamily,
        priceFontSize: prev.priceFontSize || selectedClient.descriptionFontSize,
        salePriceFontFamily: prev.salePriceFontFamily || selectedClient.bodyFontFamily,
        salePriceFontSize: prev.salePriceFontSize || selectedClient.descriptionFontSize,
        ctaFontFamily: prev.ctaFontFamily || selectedClient.ctaFontFamily,
        ctaFontSize: prev.ctaFontSize || selectedClient.ctaFontSize,
      }));
    }
  }, [selectedClient]);

  const handleChange = (field: keyof AdFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSizeChange = (size: string) => {
    const currentSizes = formData.adSizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    handleChange('adSizes', newSizes);
  };

  const validateStep = (step: number) => {
      setError(null);
      if (step === 1) {
        if (!formData.adName) return "Please enter an Ad Name.";
      }
      if (step === 2) {
          if (!formData.header1) return "A Main Headline (Header 1) is required.";
      }
      return null;
  };

  const handleNext = () => {
      const err = validateStep(currentStep);
      if (err) {
          setError(err);
          return;
      }
      setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
      setError(null);
      setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateStep(1) || validateStep(2);
    if(err) {
        setError(err);
        return;
    }
    if(!formData.adSizes || formData.adSizes.length === 0) {
        setError('Please select at least one ad size.');
        return;
    }
    
    setError(null);
    onSubmit({
      ...formData,
      numberOfAds: formData.adSizes.length,
    } as AdFormData);
  };

  const handleClientSelection = (id: string) => {
    if (id === 'add-new') {
      onAddNewClient();
    } else {
      onClientChange(id);
    }
  };
  
  const TypographyInputRow: React.FC<{ label: string; fontField: keyof AdFormData; sizeField: keyof AdFormData; }> = ({ label, fontField, sizeField }) => (
    <div className="grid grid-cols-12 gap-3 items-end p-3 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
        <div className="col-span-8">
            <Select label={`${label} Font`} value={formData[fontField] as string || ''} onChange={v => handleChange(fontField, v)} options={GOOGLE_FONTS} />
        </div>
        <div className="col-span-4">
             <Input label="Size" type="number" value={String(formData[sizeField] || '')} onChange={v => handleChange(sizeField, Number(v))} />
        </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      
      {/* Stepper Header */}
      <div className="bg-white/50 backdrop-blur-sm p-6 border-b border-gray-100 z-20">
          <div className="flex items-center justify-between relative max-w-md mx-auto">
              {STEPS.map((step, idx) => {
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center z-10 cursor-pointer group" onClick={() => step.id < currentStep && setCurrentStep(step.id)}>
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold mb-2 transition-all duration-500 ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40 scale-110 rotate-3' : isCompleted ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isCompleted ? '✓' : step.icon}
                        </div>
                        <span className={`text-xs font-bold tracking-wider uppercase transition-colors ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>{step.name}</span>
                    </div>
                  )
              })}
              
              {/* Track Lines */}
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-100 -z-10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-100 transition-all duration-500 ease-out" style={{ width: `${((currentStep - 1) / 2) * 100}%` }}></div>
              </div>
          </div>
      </div>

      {/* Form Content Area */}
      <div className="p-6 sm:p-8 flex-grow overflow-y-auto custom-scrollbar bg-gradient-to-b from-white to-gray-50">
        
        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl shadow-sm flex items-center animate-shake">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                </div>
                <span className="font-medium">{error}</span>
            </div>
        )}

        {/* STEP 1: STRATEGY */}
        {currentStep === 1 && (
            <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Strategy & Context</h2>
                    <p className="text-gray-500 text-lg">Who is this ad for and what is the message?</p>
                </div>

                <div className="space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                     <Select 
                        label="Select Client" 
                        value={selectedClientId} 
                        onChange={handleClientSelection}
                        options={[{ value: '', label: 'No Client (Generic)' }, ...clients.map(c => ({ value: c.id, label: c.name })), { value: 'add-new', label: '＋ Create New Client Profile...' }]} 
                    />

                    <Input 
                        label="Campaign Name" 
                        value={formData.adName || ''} 
                        onChange={v => handleChange('adName', v)} 
                        required 
                        placeholder="e.g. Summer Collection Launch 2025"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                    />
                    
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100 relative group">
                        <div className="flex justify-between items-center mb-3">
                             <label className="block text-sm font-bold text-indigo-900 flex items-center gap-2">
                                <span className="text-xl">✨</span> AI Copywriter
                             </label>
                        </div>
                        <p className="text-sm text-indigo-700/80 mb-3">Describe your product and goal, and we'll generate catchy headlines for you.</p>
                        <div className="relative">
                            <textarea
                                className="w-full bg-white/80 border-transparent rounded-xl shadow-sm px-4 py-3 text-gray-900 placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px] resize-none transition-all"
                                value={formData.brief || ''}
                                onChange={(e) => handleChange('brief', e.target.value)}
                                placeholder="e.g. Selling premium coffee beans. Target audience is young professionals. Tone should be energetic and warm."
                            />
                            <button 
                                type="button" 
                                onClick={() => onGenerateCopy(formData.brief || '')} 
                                disabled={!formData.brief || isCopyLoading}
                                className={`absolute bottom-3 right-3 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${!formData.brief ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
                            >
                                {isCopyLoading ? <Spinner className="w-4 h-4" /> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>}
                                Generate Magic
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STEP 2: CREATIVE */}
        {currentStep === 2 && (
            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Content & Creative</h2>
                    <p className="text-gray-500 text-lg">Upload assets and craft your message.</p>
                </div>
                
                {/* Images Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">🖼️</span>
                        Visual Assets
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FileInput label="Background Reference (Optional)" onFileChange={f => handleChange('backgroundImage', f?.file)} />
                        <FileInput label="Product Overlay (Transparent PNG)" onFileChange={f => handleChange('productImage', f?.file)} />
                    </div>
                </div>

                 {/* Text Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">✍️</span>
                        Copywriting
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <Input label="Main Headline" value={formData.header1 || ''} onChange={v => handleChange('header1', v)} required placeholder="The Big Hook" />
                        <Input label="Subheadline" value={formData.header2 || ''} onChange={v => handleChange('header2', v)} placeholder="Supporting details" />
                        <Input label="Description" value={formData.description || ''} onChange={v => handleChange('description', v)} isTextArea placeholder="Features, benefits, or story." />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 pt-2">
                         <div className="col-span-1">
                            <Input label="Price" type="text" value={formData.price || ''} onChange={v => handleChange('price', v)} placeholder="$" />
                         </div>
                         <div className="col-span-1">
                            <Input label="Sale Price" type="text" value={formData.salePrice || ''} onChange={v => handleChange('salePrice', v)} placeholder="$" />
                         </div>
                         <div className="col-span-1">
                             <Input label="CTA Text" value={formData.cta || ''} onChange={v => handleChange('cta', v)} placeholder="Shop" />
                         </div>
                    </div>
                </div>
                
                {/* Style Section */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                         <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">🎨</span>
                         Art Direction
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Visual Style" value={formData.creativeStyle || CREATIVE_STYLES[0]} onChange={v => handleChange('creativeStyle', v)} options={CREATIVE_STYLES} />
                        <Select label="Character Style" value={formData.characterStyle || CHARACTER_STYLES[0]} onChange={v => handleChange('characterStyle', v)} options={CHARACTER_STYLES} />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                         <Input label="Additional AI Instructions" value={formData.prompt || ''} onChange={v => handleChange('prompt', v)} isTextArea placeholder="e.g. Use soft morning light, make the background a blurred office, ensure no text in generated image..." />
                    </div>
                </div>
            </div>
        )}

        {/* STEP 3: FORMAT */}
        {currentStep === 3 && (
            <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Format & Polish</h2>
                    <p className="text-gray-500 text-lg">Select sizes and fine-tune the look.</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-sm uppercase tracking-wide text-gray-400 font-bold">Target Sizes</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {AD_SIZES.map(size => (
                        <label key={size} htmlFor={`size-${size}`} className={`flex flex-col items-start p-4 rounded-xl border cursor-pointer transition-all duration-200 group ${ (formData.adSizes || []).includes(size) ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500 ring-offset-2' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300' }`}>
                            <div className="flex items-center space-x-3 mb-1 w-full">
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${ (formData.adSizes || []).includes(size) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white' }`}>
                                    {(formData.adSizes || []).includes(size) && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <input type="checkbox" id={`size-${size}`} value={size} checked={(formData.adSizes || []).includes(size)} onChange={() => handleSizeChange(size)} className="sr-only" />
                                <span className={`font-bold text-sm ${ (formData.adSizes || []).includes(size) ? 'text-indigo-900' : 'text-gray-700' }`}>{size.split(' ')[0]}</span>
                            </div>
                             <span className="text-xs text-gray-400 pl-8 group-hover:text-gray-500">{size.split(' ').slice(1).join(' ').replace(/[()]/g, '')}</span>
                        </label>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-sm uppercase tracking-wide text-gray-400 font-bold">Typography Settings</h3>
                    <div className="space-y-2">
                        <TypographyInputRow label="Header 1" fontField="header1FontFamily" sizeField="header1FontSize" />
                        <TypographyInputRow label="Header 2" fontField="header2FontFamily" sizeField="header2FontSize" />
                        <TypographyInputRow label="Description" fontField="descriptionFontFamily" sizeField="descriptionFontSize" />
                        <TypographyInputRow label="Button" fontField="ctaFontFamily" sizeField="ctaFontSize" />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-sm uppercase tracking-wide text-gray-400 font-bold">CTA Button Styling</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <Input label="Text Color" type="color" value={formData.ctaTextColor || '#FFFFFF'} onChange={v => handleChange('ctaTextColor', v)} />
                        <Input label="Background" type="color" value={formData.ctaBackgroundColor || '#000000'} onChange={v => handleChange('ctaBackgroundColor', v)} />
                        <Input label="Padding" type="number" value={String(formData.ctaPadding || 12)} onChange={v => handleChange('ctaPadding', Number(v))} />
                        <Input label="Radius" type="number" value={String(formData.ctaCornerRadius || 8)} onChange={v => handleChange('ctaCornerRadius', Number(v))} />
                    </div>
                </div>
            </div>
        )}
      </div>
      
      {/* Footer Actions */}
      <div className="p-6 border-t border-gray-100 bg-white z-20 flex justify-between items-center backdrop-blur-md bg-white/80">
          {currentStep > 1 ? (
              <button type="button" onClick={handleBack} className="text-gray-500 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Back
              </button>
          ) : (
              <div></div>
          )}

          {currentStep < 3 ? (
               <button type="button" onClick={handleNext} className="bg-gray-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg hover:bg-black hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  Next Step
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
          ) : (
              <Button type="submit" isLoading={isLoading} className="!w-auto px-8 text-lg shadow-xl shadow-indigo-500/20 bg-indigo-600 hover:bg-indigo-700 rounded-xl">
                  {isLoading ? `Generating...` : (hasGeneratedAds ? 'Regenerate Ads ✨' : 'Generate Ads 🚀')}
              </Button>
          )}
      </div>
    </form>
  );
};

export default AdForm;