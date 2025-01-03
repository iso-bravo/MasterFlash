import { toast, ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { MdRemoveRedEye } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

interface paramsData {
    id: number;
    date: string;
    mp: string;
    shift: number;
    auditor: number;
    molder: number;
    part_number: string;
    mold: string;
}

const ParamsSummary = () => {
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const navigate = useNavigate();
    const [paramsData, setParamsData] = useState<paramsData[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDate);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    useEffect(() => {
        const fetchParamsData = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/get_params_by_date/${selectedDate}`);
                const data = response.data;
                setParamsData(data);
            } catch (error) {
                toast.error('Error al obtener los datos.');
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchParamsData();
    }, [selectedDate]);

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] min-h-screen'>
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
            <Header title='Resumen de parámetros' />
            <div className='flex justify-end'>
                <div>
                    <label htmlFor='date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha
                    </label>
                    <input
                        name='date'
                        type='date'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        onChange={handleDateChange}
                        value={selectedDate}
                    />
                </div>
            </div>
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-7 '>
                {loading ? (
                    <p className='text-center'>Cargando datos...</p>
                ) : (
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                            <tr>
                                <th scope='col' className='px-6 py-3'>
                                    Fecha
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    MP
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Turno
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Auditor
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Moldeador
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    No. Parte
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Molde
                                </th>
                                <th scope='col' className='px-6 py-3'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paramsData.length > 0 ? (
                                paramsData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}
                                    >
                                        <td className='px-6 py-4'>{item.date}</td>
                                        <td className='px-6 py-4'>{item.mp}</td>
                                        <td className='px-6 py-4'>{item.shift}</td>
                                        <td className='px-6 py-4'>{item.auditor}</td>
                                        <td className='px-6 py-4'>{item.molder}</td>
                                        <td className='px-6 py-4'>{item.part_number}</td>
                                        <td className='px-6 py-4'>{item.mold}</td>
                                        <td className='px-6 py-4'>
                                            <MdRemoveRedEye
                                                color='#1d4ed8'
                                                size={20}
                                                className='cursor-pointer'
                                                onClick={() => setSelectedId(item.id)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={12} className='px-6 py-4 text-center'>
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <div className='flex justify-end items-center mt-6'>
                <button
                    className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    onClick={() => navigate('/params_register')}
                >
                    Nuevo registro
                </button>
            </div>
        </div>
    );
};

export default ParamsSummary;
