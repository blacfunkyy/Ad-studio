import React, { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../services/storageService';
import { Settings } from '../types';
import Input from '../components/Input';
import Select from '../components/Select';
import Button from '../components/Button';
import { CREATIVE_STYLES } from '../constants';

const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000); // Hide message after 2 seconds
  };

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Set your default values for new ad creations.</p>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6 border border-gray-200">
            <div className="space-y-4 border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800">Default AI Instructions</h3>
                <Input label="Default Prompt" value={settings.defaultPrompt || ''} onChange={v => handleChange('defaultPrompt', v)} isTextArea />
            </div>

            <div className="space-y-4 border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-800">Default Creative Style</h3>
                <Select label="Creative Style" value={settings.defaultCreativeStyle || ''} onChange={v => handleChange('defaultCreativeStyle', v)} options={CREATIVE_STYLES} />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">Default CTA Styling</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                    <Input label="Text Color" type="color" value={settings.defaultCtaTextColor || '#FFFFFF'} onChange={v => handleChange('defaultCtaTextColor', v)} />
                    <Input label="Background" type="color" value={settings.defaultCtaBackgroundColor || '#000000'} onChange={v => handleChange('defaultCtaBackgroundColor', v)} />
                    <Input label="Padding (px)" type="number" value={String(settings.defaultCtaPadding || 12)} onChange={v => handleChange('defaultCtaPadding', Number(v))} />
                    <Input label="Corner Radius (px)" type="number" value={String(settings.defaultCtaCornerRadius || 8)} onChange={v => handleChange('defaultCtaCornerRadius', Number(v))} />
                </div>
            </div>

            <div className="flex justify-end items-center gap-4">
                {isSaved && <span className="text-green-600 text-sm">Settings saved!</span>}
                <Button onClick={handleSave} className="!w-auto">Save Settings</Button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;