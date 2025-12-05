import React, { useState, useEffect } from 'react';
import { Client } from '../types';
import ClientModal from '../components/ClientModal';
import Button from '../components/Button';

const ClientManagementPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadClients();
    }, []);
    
    const loadClients = () => {
        try {
            const savedClients = localStorage.getItem('ad-creator-clients');
            if (savedClients) {
                setClients(JSON.parse(savedClients));
            }
        } catch (e) {
            console.error("Failed to load clients from localStorage", e);
        }
    }

    const handleSaveClient = (client: Omit<Client, 'id'>) => {
        const newClient = { ...client, id: `client-${Date.now()}` };
        const updatedClients = [...clients, newClient];
        setClients(updatedClients);
        localStorage.setItem('ad-creator-clients', JSON.stringify(updatedClients));
        setIsModalOpen(false);
    };

    const handleDeleteClient = (clientId: string) => {
        if(window.confirm("Are you sure you want to delete this client?")) {
            const updatedClients = clients.filter(c => c.id !== clientId);
            setClients(updatedClients);
            localStorage.setItem('ad-creator-clients', JSON.stringify(updatedClients));
        }
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                 <header className="flex flex-col sm:flex-row justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Client Management</h1>
                    <Button onClick={() => setIsModalOpen(true)} className="!w-auto mt-4 sm:mt-0">＋ Add New Client</Button>
                </header>

                <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                    <div className="divide-y divide-gray-200">
                        {clients.length > 0 ? (
                            clients.map(client => (
                                <div key={client.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <img src={`data:${client.logo.mimeType};base64,${client.logo.base64}`} alt={`${client.name} logo`} className="w-12 h-12 object-contain rounded-md bg-gray-100 p-1" />
                                        <span className="font-semibold">{client.name}</span>
                                    </div>
                                    <button onClick={() => handleDeleteClient(client.id)} className="text-red-500 hover:text-red-700">Delete</button>
                                </div>
                            ))
                        ) : (
                            <p className="p-8 text-center text-gray-500">No clients have been added yet.</p>
                        )}
                    </div>
                </div>
            </div>
             <ClientModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveClient}
            />
        </div>
    );
};

export default ClientManagementPage;