import React, { useState, useEffect } from 'react';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';
import api from '../../config/axiosConfig';

const AutoCompletePartNumForm: React.FC = () => {
    const [query, setQuery] = useState<string>('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { updateAllFields, setSteps } = usePartNumForm();

    // Fetch suggestions based on the query
    useEffect(() => {
        if (query.length > 1) {
            // Call backend to get part number suggestions
            const fetchSuggestions = async () => {
                const response = await api.get(`/part-numbers/names?search=${query}`);
                setSuggestions(response.data.map((item: { part_number: string }) => item.part_number));
            };

            fetchSuggestions();
        }
    }, [query]);

    const handleSelect = async (partNumber: string) => {
        // Fetch the selected part number details
        const response = await api.get(`/part-numbers/${partNumber}`);
        updateAllFields(response.data); // Update store with part number data
        setSteps(1); // Go to step 1
    };

    return (
        <div>
            <label className='mb-2 text-sm font-medium text-gray-900 sr-only'>
                Buscar un número de parte o crear uno nuevo
            </label>
            <input
                type='text'
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder='Buscar número de parte...'
                className='input-class block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500'
            />
            {query.length > 1 && suggestions.length > 0 && (
                <div className='absolute z-50 bg-white divide-y divide-gray-100 rounded-lg shadow w-1/3 max-w-full max-h-80 overflow-y-auto'>
                    <ul className='py-2 text-sm text-gray-700'>
                        {suggestions.map(partNum => (
                            <li key={partNum} onClick={() => handleSelect(partNum)}>
                                <span className='block px-4 py-2 hover:bg-gray-100 cursor-pointer'>{partNum}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AutoCompletePartNumForm;
