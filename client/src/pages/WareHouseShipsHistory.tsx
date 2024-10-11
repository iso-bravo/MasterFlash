import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

interface reportHistory {
    query_date: string;
    start_date: string;
    end_date: string;
    compound: string;
    total_weight: number;
}

const WareHouseShipsHistory = () => {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState<reportHistory[]>([]);
    const [filteredData, setFilteredData] = useState<reportHistory[]>([]);
    const [selectedQueryDate, setSelectedQueryDate] = useState<string>('');
    const [selectedCompound, setSelectedCompound] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/get_rubber_report_history/');
                setHistoryData(response.data);
                setFilteredData(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        const filtered = historyData.filter(item => {
            const queryDate = item.query_date.split('T')[0]; // Esto obtiene solo la fecha en formato YYYY-MM-DD

            // Comparar solo la fecha
            const matchesDate = !selectedQueryDate || queryDate === selectedQueryDate;
            const matchesCompound =
                !selectedCompound || item.compound.toLowerCase().includes(selectedCompound.toLowerCase());

            return matchesDate && matchesCompound;
        });
        setFilteredData(filtered);
    }, [selectedQueryDate, selectedCompound, historyData]);

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/rubber_menu')} />
                <h1 className='text-xl'>Envios a Almacén</h1>
            </header>
            <section className='flex justify-end p-4'>
                <div className='mr-3'>
                    <label htmlFor='query_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Query Date
                    </label>
                    <input
                        type='date'
                        name='query_date'
                        value={selectedQueryDate}
                        onChange={e => setSelectedQueryDate(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label htmlFor='compound' className='block mb-2 text-sm font-medium text-gray-900'>
                        Compuesto
                    </label>
                    <input
                        type='text'
                        name='compound'
                        value={selectedCompound}
                        onChange={e => setSelectedCompound(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
            </section>
            <section className='relative overflow-x-auto shadow-md sm:rounded-lg mt-7 '>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>
                                Fecha de envio
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Fecha Inicio
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Fecha Fin
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Compound
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Peso Total (lbs)
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index}>
                                <td className='px-6 py-3'>{item.query_date.split('T')[0]}</td>
                                <td className='px-6 py-3'>{item.start_date}</td>
                                <td className='px-6 py-3'>{item.end_date}</td>
                                <td className='px-6 py-3'>{item.compound}</td>
                                <td className='px-6 py-3'>{item.total_weight}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default WareHouseShipsHistory;
