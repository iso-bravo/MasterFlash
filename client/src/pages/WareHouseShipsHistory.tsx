import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';
import { FaLayerGroup, FaPlus } from 'react-icons/fa';

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
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
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
            const queryDate = item.query_date.split('T')[0]; // Obtener solo la fecha en formato YYYY-MM-DD

            // Verificar si el query_date está dentro del rango
            const matchesDateRange = (!startDate || queryDate >= startDate) && (!endDate || queryDate <= endDate);

            const matchesCompound =
                !selectedCompound || item.compound.toLowerCase().includes(selectedCompound.toLowerCase());

            return matchesDateRange && matchesCompound;
        });
        setFilteredData(filtered);
    }, [startDate, endDate, selectedCompound, historyData]);

    const groupCompounds = () => {
        const groupedData = filteredData.reduce((acc, item) => {
            const compoundKey = item.compound.toLocaleLowerCase();

            if (acc[compoundKey]) {
                acc[compoundKey].total_weight += item.total_weight;

                acc[compoundKey].start_date =
                    acc[compoundKey].start_date < item.start_date ? acc[compoundKey].start_date : item.start_date;

                acc[compoundKey].end_date =
                    acc[compoundKey].end_date > item.end_date ? acc[compoundKey].end_date : item.end_date;
            } else {
                acc[compoundKey] = { ...item };
            }

            return acc;
        }, {} as { [key: string]: reportHistory });

        setFilteredData(Object.values(groupedData));
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/reports_menu')} />
                <h1 className='text-xl'>Envios a Almacén</h1>
            </header>
            <section className='flex justify-end p-4'>
                <div className='mr-3'>
                    <label htmlFor='start_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Inicio
                    </label>
                    <input
                        type='date'
                        name='start_date'
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div className='mr-3'>
                    <label htmlFor='end_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Fin
                    </label>
                    <input
                        type='date'
                        name='end_date'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
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
                <div className='ml-3 mt-7'>
                    <button
                        className='flex items-center gap-2 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 '
                        onClick={groupCompounds}
                    >
                        <FaLayerGroup />
                        <span>Agrupar</span>
                    </button>
                </div>
                <div className='ml-3 mt-7'>
                    <button
                        className='flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                        onClick={() => navigate('/rubber_report')}
                    >
                        <FaPlus />
                        <span>Nuevo envio</span>
                    </button>
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
                            <tr key={index} className='odd:bg-white even:bg-gray-50 border-b'>
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
