import { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../config/axiosConfig';

interface InputFields {
    date: string;
    caliber: string;
    insert: string;
}

const ScrapReport: React.FC = () => {
    const [formData, setFormData] = useState<InputFields>({
        date: '',
        caliber: '',
        insert: '',
    });

    const [showInsert, setShowInsert] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'caliber') {
            setShowInsert(value === '0.040');
        }
        if (name === 'insert') {
            value.toUpperCase();
        }

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (!formData.date) {
                toast.error('El campo Fecha es requerido');
                return;
            }
            if (!formData.caliber) {
                toast.error('El campo Calibre es requerido');
                return;
            }
            if (showInsert && !formData.insert) {
                toast.error('El campo Insert es requerido');
                return;
            }
            const formattedDate = formatDate(formData.date);
            const formBody = new URLSearchParams();
            formBody.append('date', formattedDate);
            formBody.append('caliber', formData.caliber);
            formBody.append('insert', formData.insert);

            const response = await api.post('/reports/generate/', formBody.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseType: 'blob',
            });

            const pdfBlob = new Blob([response.data], {
                type: 'application/pdf',
            });

            const pdfUrl = URL.createObjectURL(pdfBlob);

            setPdfUrl(pdfUrl);

            setFormData({ date: '', caliber: '', insert: '' });

            toast.info('PDF generado');
        } catch (error) {
            console.error(error);
            toast.error('Error Registrando datos');
        }
    };

    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer />
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/reports_menu')} />
                <h1 className='text-xl'>Reportes</h1>
            </header>

            <form
                onSubmit={handleSubmit}
                className='lg:flex justify-end gap-4 items-center grid md:grid-cols-5 md:grid-flow-row sm:grid-flow-col sm:grid-rows-2'
            >
                <div className='flex flex-row gap-2'>
                    <h2>Fecha</h2>
                    <input
                        name='date'
                        type='date'
                        value={formData.date}
                        onChange={e => handleChange(e)}
                        className='rounded-sm w-32 h-6'
                    />
                </div>
                <div className='flex flex-row gap-2'>
                    <h2>Calibre</h2>
                    <select name='caliber' value={formData.caliber} onChange={e => handleChange(e)} className=''>
                        <option value='' disabled>
                            {''}
                        </option>
                        <option value='0.025'>0.025</option>
                        <option value='0.032'>0.032</option>
                        <option value='0.040'>0.040</option>
                    </select>
                </div>
                <div>
                    {showInsert && (
                        <div className='flex flex-row gap-2'>
                            <h2>Insert</h2>
                            <input
                                name='insert'
                                type='text'
                                value={formData.insert || ''}
                                onChange={e => handleChange(e)}
                                className='rounded-sm w-32 h-6'
                            />
                        </div>
                    )}
                </div>

                <button
                    type='submit'
                    className=' lg:text-sm ml-2 px-2 py-1 bg-[#579fdd] rounded-sm text-lg md:text-lg hover:bg-[#448ccc] cursor-pointer'
                    style={{ backgroundColor: '#579fdd' }}
                >
                    <h2>Buscar</h2>
                </button>
            </form>
            {pdfUrl && (
                <div>
                    <iframe src={pdfUrl} width='100%' height='780px' className='mt-10'></iframe>
                </div>
            )}
        </div>
    );
};

export default ScrapReport;
