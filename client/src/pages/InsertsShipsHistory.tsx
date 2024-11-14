import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { FaLayerGroup, FaPlus } from 'react-icons/fa';

interface InsertHistory {
    query_date: string;
    start_date: string;
    end_date: string;
    insert: string;
    total_insert: number;
    total_rubber: number;
    total_metal: number;
    total_sum: number;
}

const InsertsShipsHistory = () => {
    const navigate = useNavigate();
    const [historyData, setHistoryData] = useState<InsertHistory[]>([]);
    const [filteredData, setFilteredData] = useState<InsertHistory[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedInsert, setSelectedInsert] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get('/get_inserts_report_history/');
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
            const queryDate = item.query_date.split('T')[0];

            const matchesDateRange = (!startDate || queryDate >= startDate) && (!endDate || queryDate <= endDate);

            const matchesInsert = !selectedInsert || item.insert.toLowerCase().includes(selectedInsert.toLowerCase());

            return matchesDateRange && matchesInsert;
        });
        setFilteredData(filtered);
    }, [startDate, endDate, selectedInsert, historyData]);

    const groupInserts = () => {
        const groupedData = filteredData.reduce((acc, item) => {
            const insertKey = item.insert.toLocaleLowerCase();

            if (acc[insertKey]) {
                acc[insertKey].total_insert += item.total_insert;
                acc[insertKey].total_rubber += item.total_rubber;
                acc[insertKey].total_metal += item.total_metal;
                acc[insertKey].total_sum += item.total_sum;

                acc[insertKey].start_date =
                    acc[insertKey].start_date < item.start_date ? acc[insertKey].start_date : item.start_date;

                acc[insertKey].end_date =
                    acc[insertKey].end_date > item.end_date ? acc[insertKey].end_date : item.end_date;
            } else {
                acc[insertKey] = { ...item };
            }

            return acc;
        }, {} as { [key: string]: InsertHistory });

        setFilteredData(Object.values(groupedData));
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Envios a Almacén insertos' goto='/reports_menu' />
            <section className='flex justify-end p-4'>
                <div>
                    <label htmlFor='start_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha inicio
                    </label>
                    <input
                        type='date'
                        name='start_date'
                        id='start_date'
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
                        id='end_date'
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label htmlFor='insert' className='block mb-2 text-sm font-medium text-gray-900'>
                        Inserto
                    </label>
                    <select
                        name='inserts'
                        id='insert'
                        value={selectedInsert}
                        onChange={e => setSelectedInsert(e.target.value)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    >
                        <option value=''></option>
                        <option value='0.025'>0.025</option>
                        <option value='0.032'>0.032</option>
                        <option value='0.040'>0.040</option>
                        <option value='Residencial'>Residencial</option>
                        <option value='Grippers'>Grippers</option>
                    </select>
                </div>
                <div className='ml-3 mt-7'>
                    <button
                        className='flex items-center gap-2 focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 '
                        onClick={groupInserts}
                    >
                        <FaLayerGroup />
                        <span>Agrupar</span>
                    </button>
                </div>
                <div className='ml-3 mt-7'>
                    <button
                        className='flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                        onClick={() => navigate('/scrap_report')}
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
                                Inserto
                            </th>
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
                                Total Insertos
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Total Hule
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Total Metal
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Suma total
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((item, index) => (
                            <tr key={index} className='odd:bg-white even:bg-gray-50 border-b'>
                                <td className='px-6 py-3'>{item.insert}</td>
                                <td className='px-6 py-3'>{item.query_date.split('T')[0]}</td>
                                <td className='px-6 py-3'>{item.start_date}</td>
                                <td className='px-6 py-3'>{item.end_date}</td>
                                <td className='px-6 py-3'>{item.total_insert}</td>
                                <td className='px-6 py-3'>{item.total_rubber}</td>
                                <td className='px-6 py-3'>{item.total_metal}</td>
                                <td className='px-6 py-3'>{item.total_sum}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
};

export default InsertsShipsHistory;
