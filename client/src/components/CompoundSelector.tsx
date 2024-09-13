import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';

interface CompoundSelectorProps {
    onAddCompound: (compoundData: {
        compound: string;
        startDate: string;
        endDate: string;
        totalWeight: number;
    }) => void;
}

const CompoundSelector = ({ onAddCompound }: CompoundSelectorProps) => {
    const [compound, setCompound] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [compoundOptions, setCompoundOptions] = useState<Array<string>>([]);

    useEffect(() => {
        const fetchcompounds = async () => {
            try {
                const response = await api.get('/rubber_compounds/');
                console.log(response.data);
                setCompoundOptions(response.data);
            } catch (error) {
                console.error('Error fetching componds: ', error);
            }
        };

        fetchcompounds();
    }, []);

    const handleAddCompound = async () => {
        if (!compound || !startDate || !endDate) {
            toast.error('Por favor, selecciona un compuesto y el rango de fechas.');
            return;
        }

        try {
            const response = await api.post('/get_total_weight_lbs/', {
                start_date: startDate,
                end_date: endDate,
                compound,
            });

            const totalWeight = response.data.total_weight;

            onAddCompound({ compound, totalWeight, startDate, endDate });
        } catch (error) {
            console.error('Error al obtener el peso:', error);
            toast.error('Hubo un error al obtener el peso.');
        }
    };

    return (
        <div className='lg:flex justify-end gap-4 items-center grid md:flex  sm:grid-flow-col sm:grid sm:grid-rows-2'>
            <ToastContainer
                position='top-center'
                autoClose={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme='colored'
            />
            <div>
                <label htmlFor='start_date' className='block mb-2 text-sm font-medium text-gray-900'>
                    Fecha Inicio
                </label>
                <input
                    name='start_date'
                    type='date'
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                />
            </div>
            <div>
                <label htmlFor='end_date' className='block mb-2 text-sm font-medium text-gray-900'>
                    Fecha Fin
                </label>
                <input
                    name='end_date'
                    type='date'
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                />
            </div>
            <div>
                <label htmlFor='compounds' className='block mb-2 text-sm font-medium text-gray-900'>
                    Compuesto
                </label>
                <select
                    name='compound'
                    value={compound}
                    onChange={e => setCompound(e.target.value)}
                    id='compounds'
                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                >
                    <option value=''>Selecciona un compuesto</option>
                    {compoundOptions.map((compoundOption, index) => (
                        <option key={index} value={compoundOption}>
                            {compoundOption}
                        </option>
                    ))}
                </select>
            </div>
            <button
                onClick={handleAddCompound}
                className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center'
            >
                Agregar compuesto
            </button>
        </div>
    );
};

export default CompoundSelector;
