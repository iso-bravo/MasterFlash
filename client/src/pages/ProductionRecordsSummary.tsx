import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useCallback, useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import api from '../config/axiosConfig';

interface ProductionRecord {
    id: number;
    press: string;
    employee_number: number | null;
    part_number: string;
    work_order: string;
    caliber: string | null;
    worked_hrs: number | null;
    dead_time_cause_1: string | null;
    cavities: number | null;
    standard: number | null;
    proposed_standard: number | null;
    dead_time_cause_2: string | null;
    pieces_ok: number | null;
    efficiency: number;
    date: string;
    shift: string;
    mod_date: string;
}

const ProductionRecordsSummary = () => {
    const [table, setTable] = useState<ProductionRecord[]>([]);
    const [firstDate, setFirstDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');

    const navigate = useNavigate();

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.name === 'start_date') {
            setFirstDate(e.target.value);
        } else {
            setEndDate(e.target.value);
        }
    };

    const fetchData = useCallback(async () => {
        if (!firstDate || !endDate) {
            toast.error('Selecciona un rango de fechas');
            return;
        }
        try {
            const response = await api.post('/get_pieces_ok_by_date_range', {
                start_date: firstDate,
                end_date: endDate,
            });
            console.log(response.data);

            const records: ProductionRecord[] = response.data;
            setTable(records);
        } catch (error) {
            console.error('Error: ', error);
        }
    }, [firstDate, endDate]);

    useEffect(() => {
        if (firstDate && endDate) {
            fetchData();
        }
    }, [firstDate, endDate, fetchData]);

    //TODO mantener fechas
    const handleDetails = (id: number) => {
        navigate(`/press_production_records_details?id=${id}`);
    };

    return (
        <div className='min-h-screen flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
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
            <Header title='Resumen registros de producción' goto='/production_records' />
            <section className='flex flex-row justify-end p-2 gap-2 items-end mb-4'>
                <div>
                    <label htmlFor='start_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Inicio
                    </label>
                    <input
                        name='start_date'
                        type='date'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        onChange={handleDateChange}
                        value={firstDate}
                    />
                </div>
                <div>
                    <label htmlFor='end_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Fin
                    </label>
                    <input
                        name='end_date'
                        type='date'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        onChange={handleDateChange}
                        value={endDate}
                    />
                </div>
                <button
                    className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    onClick={() => navigate('/presses_register_production')}
                >
                    Nuevo Registro
                </button>
            </section>
            <main className='relative overflow-x-auto shadow-md sm:rounded-lg'>
                <table className='w-full text-sm text-left rtl:text-right text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>
                                Fecha
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Piezas
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                <span className='sr-only'>Detalles</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {table.map((item, index) => (
                            <tr key={`${index}-${item.id}`} className='text-xs text-gray-700 uppercase bg-gray-50'>
                                <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                    {item.date}
                                </th>
                                <td className='px-6 py-4'>{item.pieces_ok}</td>
                                <td className='px-6 py-4'>
                                    <a
                                        className='font-medium text-blue-600 dark:text-blue-500 hover:underline cursor-pointer'
                                        onClick={() => handleDetails(item.id)}
                                    >
                                        Detalles
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default ProductionRecordsSummary;
