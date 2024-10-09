import { useEffect, useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import ConfirmPopUp from '../components/ConfirmPopUp';
import api from '../config/axiosConfig';

interface scrapData {
    id: number;
    rubber_weight: number;
    total_pieces: number;
    insert_weight_w_rubber: number;
    date_time: string;
    shift: number;
    line: string;
    auditor_qc: number;
    molder_number: number;
    part_number: string;
    compound: string;
    caliber: number;
}

const ScrapSummary = () => {
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const navigate = useNavigate();
    const [scrapData, setScrapData] = useState<scrapData[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(getTodayDate);
    const [loading, setLoading] = useState(false);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const openDeleteModal = (id: number) => {
        setSelectedId(id);
        setShowModal(true);
    };

    const deleteRegister = async () => {
        if (!selectedId) return;

        try {
            await api.delete(`/delete_scrap_register/${selectedId}`);
            setScrapData(prevData => prevData.filter(item => item.id !== selectedId)); // Actualiza la lista
            setShowModal(false);
        } catch (error) {
            console.error('Error deleting register:', error);
        }
    };

    const fetchScrapData = async (date: string) => {
        setLoading(true);
        try {
            const response = await api.get(`/get_scrap_sumary/${date}`);

            setScrapData(response.data);
        } catch (error) {
            toast.error('Error al obtener los datos.');
            setScrapData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchScrapData(selectedDate);
        }
    }, [selectedDate]);

    //TODO preguntar si el formato debe cambiar
    // const formatDateTime = (dateTimeString: string) => {
    //     const date = new Date(dateTimeString);
    //     return date.toLocaleTimeString('es-ES', {
    //         hour: '2-digit',
    //         minute: '2-digit',
    //     });
    // };

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
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Resumen Scrap</h1>
            </header>
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
            {showModal && (
                <ConfirmPopUp show={showModal} onClose={() => setShowModal(false)} onAccept={deleteRegister} />
            )}
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-7 '>
                {loading ? (
                    <p className='text-center'>Cargando datos...</p>
                ) : (
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                            <tr>
                                <th scope='col' className='px-6 py-3'>
                                    Rubber Weight
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Total Pieces
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Insert Weight w/ Rubber
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Date
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Shift
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    MP
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Auditor QC
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Molder Number
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Part Number
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Compound
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Caliber
                                </th>
                                <th scope='col' className='px-6 py-3'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {scrapData.length > 0 ? (
                                scrapData.map((item, index) => (
                                    <tr
                                        key={index}
                                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}
                                    >
                                        <td className='px-6 py-4'>{item.rubber_weight}</td>
                                        <td className='px-6 py-4'>{item.total_pieces}</td>
                                        <td className='px-6 py-4'>{item.insert_weight_w_rubber}</td>
                                        <td className='px-6 py-4'>{item.date_time}</td>
                                        <td className='px-6 py-4'>{item.shift}</td>
                                        <td className='px-6 py-4'>{item.line}</td>
                                        <td className='px-6 py-4'>{item.auditor_qc}</td>
                                        <td className='px-6 py-4'>{item.molder_number}</td>
                                        <td className='px-6 py-4'>{item.part_number}</td>
                                        <td className='px-6 py-4'>{item.compound}</td>
                                        <td className='px-6 py-4'>{item.caliber}</td>
                                        <td className='px-6 py-4'>
                                            <FaTrash
                                                color='red'
                                                size={20}
                                                className='cursor-pointer'
                                                onClick={() => openDeleteModal(item.id)}
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
                    onClick={() => navigate('/scrap_register')}
                >
                    Nuevo registro
                </button>
            </div>
        </div>
    );
};

export default ScrapSummary;
