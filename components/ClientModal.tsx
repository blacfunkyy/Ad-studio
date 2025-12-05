import React, { useState, useEffect } from 'react';
import Input from './Input';
import FileInput from './FileInput';
import Button from './Button';
import Select from './Select';
import { ImageFile, Client } from '../types';
import { GOOGLE_FONTS } from '../constants';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id'>) => void;
}

const fileToBase64 = (file: File): Promise<{base64: string, mimeType: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const parts = result.split(',');
      if (parts.length !== 2) {
        return reject(new Error('Invalid data URL format'));
      }
      resolve({ base64: parts[1], mimeType: file.type });
    };
    reader.onerror = (error) => reject(new Error('Failed to read file.'));
  });
};

const ClientModal: React.FC<ClientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [logo, setLogo] = useState<ImageFile | null>(null);
  const [primary, setPrimary] = useState('#000000');
  const [secondary, setSecondary] = useState('#ffffff');
  const [tertiary, setTertiary] = useState('#808080');
  
  // Typography state
  const [headerFontFamily, setHeaderFontFamily] = useState(GOOGLE_FONTS[3]); // Montserrat
  const [header1FontSize, setHeader1FontSize] = useState(48);
  const [header2FontSize, setHeader2FontSize] = useState(32);
  const [bodyFontFamily, setBodyFontFamily] = useState(GOOGLE_FONTS[0]); // Roboto
  const [descriptionFontSize, setDescriptionFontSize] = useState(18);
  const [ctaFontFamily, setCtaFontFamily] = useState(GOOGLE_FONTS[3]); // Montserrat
  const [ctaFontSize, setCtaFontSize] = useState(20);

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset form on close
      setName('');
      setLogo(null);
      setPrimary('#000000');
      setSecondary('#ffffff');
      setTertiary('#808080');
      setHeaderFontFamily(GOOGLE_FONTS[3]);
      setHeader1FontSize(48);
      setHeader2FontSize(32);
      setBodyFontFamily(GOOGLE_FONTS[0]);
      setDescriptionFontSize(18);
      setCtaFontFamily(GOOGLE_FONTS[3]);
      setCtaFontSize(20);
      setError(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !logo) {
      setError('Client Name and Logo are required.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      const { base64, mimeType } = await fileToBase64(logo.file);
      onSave({
        name,
        logo: { base64, mimeType },
        colors: { primary, secondary, tertiary },
        headerFontFamily,
        header1FontSize,
        header2FontSize,
        bodyFontFamily,
        descriptionFontSize,
        ctaFontFamily,
        ctaFontSize,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to process logo image. Please try another file.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Add New Client</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-5">
            <Input label="Client Name" value={name} onChange={setName} required />
            <FileInput label="Client Logo" onFileChange={setLogo} required />
            
            <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Brand Colors</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input label="Primary" type="color" value={primary} onChange={setPrimary} />
                    <Input label="Secondary" type="color" value={secondary} onChange={setSecondary} />
                    <Input label="Tertiary" type="color" value={tertiary} onChange={setTertiary} />
                </div>
            </div>

            <div>
                <h3 className="text-md font-medium text-gray-700 mb-2">Brand Typography Defaults</h3>
                <div className="space-y-4">
                  <Select label="Header Font Family" value={headerFontFamily} onChange={setHeaderFontFamily} options={GOOGLE_FONTS} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Header 1 Size (px)" type="number" value={String(header1FontSize)} onChange={v => setHeader1FontSize(Number(v))} />
                    <Input label="Header 2 Size (px)" type="number" value={String(header2FontSize)} onChange={v => setHeader2FontSize(Number(v))} />
                  </div>
                  <Select label="Body Font Family" value={bodyFontFamily} onChange={setBodyFontFamily} options={GOOGLE_FONTS} />
                  <Input label="Description Size (px)" type="number" value={String(descriptionFontSize)} onChange={v => setDescriptionFontSize(Number(v))} />
                   <Select label="CTA Font Family" value={ctaFontFamily} onChange={setCtaFontFamily} options={GOOGLE_FONTS} />
                  <Input label="CTA Size (px)" type="number" value={String(ctaFontSize)} onChange={v => setCtaFontSize(Number(v))} />
                </div>
            </div>
            
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
             <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <Button type="submit" isLoading={isSaving}>
              {isSaving ? 'Saving...' : 'Save Client'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;
