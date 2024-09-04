import { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import api from '../config/axiosConfig';

interface FormData {
    start_date: string;
    end_date: string;
    shift: string;
}

const RubberReport = () => {
    const [formData, setFormData] = useState<FormData>({
        start_date: '',
        end_date: '',
        shift: '',
    });

    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!formData.start_date) {
                toast.error('La fecha de inicio es requerida');
                return;
            }
            if (!formData.shift) {
                toast.error('El campo Turno es requerido');
                return;
            }
            if (!formData.end_date) {
                toast.error('La fecha de fin es requerida');
                return;
            }

            const formattedStartDate = formatDate(formData.start_date);
            const formattedEndDate = formatDate(formData.end_date);
            const formBody = new URLSearchParams();
            formBody.append('start_date', formattedStartDate);
            formBody.append('end_date', formattedEndDate);
            formBody.append('shift', formData.shift);

            const response = await api.post('/reports/rubber/generate/', formBody.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseType: 'blob',
            });

            if (response.data.size > 0) {
                const pdfBlob = new Blob([response.data], {
                    type: 'application/pdf',
                });

                const pdfUrl = URL.createObjectURL(pdfBlob);

                setFormData({ start_date: '', end_date: '', shift: '' });

                setPdfUrl(pdfUrl);
            } else {
                toast.error('No se encontraron datos para generar el reporte');
            }
        } catch (error) {
            toast.error('Error al generar el report');
            console.error(error);
        }
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
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
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/reports_menu')} />
                <h1 className='text-xl'>Reportes</h1>
            </header>
            <form
                onSubmit={handleSubmit}
                className='lg:flex justify-end gap-4 items-center grid md:flex  sm:grid-flow-col sm:grid sm:grid-rows-2'
            >
                <div>
                    <label htmlFor='start_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Inicio
                    </label>
                    <input
                        name='start_date'
                        type='date'
                        value={formData.start_date}
                        onChange={handleChange}
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
                        value={formData.end_date}
                        onChange={handleChange}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label htmlFor='shifts' className='block mb-2 text-sm font-medium text-gray-900'>
                        Turno
                    </label>
                    <select
                        name='shift'
                        value={formData.shift}
                        onChange={handleChange}
                        id='shifts'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    >
                        <option value='' disabled>
                            Selecciona un turno
                        </option>
                        <option value='1'>First</option>
                        <option value='2'>Second</option>
                    </select>
                </div>
                <button
                    type='submit'
                    className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center'
                >
                    Buscar
                </button>
            </form>
            <div>
                {pdfUrl && (
                    <div>
                        <iframe src={pdfUrl} width='100%' height='600px' className='mt-10 rounded-md'></iframe>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RubberReport;
