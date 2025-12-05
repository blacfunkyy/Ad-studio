import React, { useState, useEffect } from 'react';
import { AdTemplate } from '../types';
import { getUserTemplates, deleteUserTemplate } from '../services/storageService';
import { AD_TEMPLATES } from '../constants';
import Link from '../components/Link';

const AdTemplatesPage: React.FC = () => {
    const [userTemplates, setUserTemplates] = useState<AdTemplate[]>([]);

    useEffect(() => {
        loadUserTemplates();
    }, []);

    const loadUserTemplates = () => {
        setUserTemplates(getUserTemplates());
    }

    const handleDelete = (templateId: string) => {
        if (window.confirm('Are you sure you want to delete this template?')) {
            deleteUserTemplate(templateId);
            loadUserTemplates();
        }
    }

    const TemplateCard: React.FC<{ template: AdTemplate, isUserTemplate?: boolean }> = ({ template, isUserTemplate = false }) => (
        <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group flex flex-col">
            <Link href={`#template/${template.id}`} className="block relative">
                <img src={template.previewImage} alt={template.name} className="w-full aspect-square object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-lg font-bold">Use Template</span>
                </div>
            </Link>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-bold text-lg">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1 flex-grow">{template.description}</p>
                {isUserTemplate && (
                    <div className="mt-3 pt-3 border-t text-right">
                        <button onClick={() => handleDelete(template.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                 <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Ad Templates</h1>
                    <Link href="#create" className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-bold rounded-md shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-105">
                        ＋ Create Ad From Scratch
                    </Link>
                </header>
                
                {userTemplates.length > 0 && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Templates</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {userTemplates.map(template => <TemplateCard key={template.id} template={template} isUserTemplate />)}
                        </div>
                    </section>
                )}
                
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Template Gallery</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {AD_TEMPLATES.map(template => <TemplateCard key={template.id} template={template} />)}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AdTemplatesPage;