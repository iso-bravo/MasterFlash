import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../config/axiosConfig';
import Header from '../components/Header';

interface InputFields {
    start_date: string;
    end_date: string;
    report: string;
    insert: string;
}

const ScrapReport: React.FC = () => {
    const [formData, setFormData] = useState<InputFields>({
        start_date: '',
        end_date: '',
        report: '',
        insert: '',
    });

    const [showInsert, setShowInsert] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'report') {
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
            if (!formData.start_date) {
                toast.error('El campo Fecha es requerido');
                return;
            }
            if (!formData.report) {
                toast.error('El campo Calibre es requerido');
                return;
            }
            if (showInsert && !formData.insert) {
                toast.error('El campo Insert es requerido');
                return;
            }
            const formattedStartDate = formatDate(formData.start_date);
            const formattedEndDate = formatDate(formData.end_date);
            const formBody = new URLSearchParams();
            formBody.append('start_date', formattedStartDate);
            formBody.append('end_date', formattedEndDate);
            formBody.append('report', formData.report);
            formBody.append('insert', formData.insert);

            const response = await api.post('/reports/inserts/generate/', formBody.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                responseType: 'blob',
            });

            console.log(response);

            if (response.data.size > 0) {
                const pdfBlob = new Blob([response.data], {
                    type: 'application/pdf',
                });

                const pdfUrl = URL.createObjectURL(pdfBlob);

                // Descargar PDF
                // const link = document.createElement('a');
                // link.href = pdfUrl;
                // link.setAttribute('download', 'reporte.pdf');
                // document.body.appendChild(link);
                // link.click();
                // ___________

                setPdfUrl(pdfUrl);
            } else {
                toast.error('No se encontraron datos para generar el reporte');
            }

            setFormData({ start_date: '', end_date: '', report: '', insert: '' });

            toast.info('PDF generado');
        } catch (error) {
            console.error(error);
            toast.error('Error Registrando datos');
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
            <Header title='Nuevo reporte' goto='/inserts_history' />

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
                        onChange={e => handleChange(e)}
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
                        onChange={e => handleChange(e)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label htmlFor='shifts select' className='block mb-2 text-sm font-medium text-gray-900'>
                        Reporte
                    </label>
                    <select
                        name='report'
                        value={formData.report}
                        onChange={e => handleChange(e)}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    >
                        <option value='' disabled>
                            {''}
                        </option>
                        <option value='0.025'>0.025</option>
                        <option value='0.032'>0.032</option>
                        <option value='0.040'>0.040</option>
                        <option value='Residencial'>Residencial</option>
                        <option value='Grippers'>Grippers</option>
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
                    className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'
                >
                    <h2>Buscar</h2>
                </button>
            </form>
            {pdfUrl && (
                <div>
                    <iframe src={pdfUrl} width='100%' height='600px' className='mt-10 rounded-md'></iframe>
                </div>
            )}
        </div>
    );
};

export default ScrapReport;
