import { useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import api from '../config/axiosConfig';
import CompoundSelector from '../components/CompoundSelector';
import CompoundsTable from '../components/CompoundsTable';

interface compoundData {
    compound: string;
    startDate: string;
    endDate: string;
    totalWeight: number;
}

interface PdfData {
    name: string;
    data: string;
}

const RubberReport = () => {
    const [tableData, setTableData] = useState<Array<compoundData>>([]);
    const [pdfUrls, setPdfUrls] = useState<Array<string>>([]);
    const navigate = useNavigate();

    const handleAddCompound = (compoundData: compoundData) => {
        setTableData(prevData => [...prevData, compoundData]);
    };

    const handleRemoveCompound = (index: number) => {
        setTableData(prevData => prevData.filter((_, i) => i !== index)); // Elimina el compuesto basado en el índice
    };

const handleSubmit = async () => {
    if (tableData.length === 0) {
        toast.error('Debe agregar al menos un compuesto antes de enviar.');
        return;
    }

    try {
        const response = await api.post('/reports/rubber/generate/', tableData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const pdfs = response.data.pdfs;

        if (pdfs.length > 0) {
            const urls = pdfs.map((pdf:PdfData) => {
                const binary = atob(pdf.data);
                const arrayBuffer = new Uint8Array(binary.length);
                for (let i = 0; i < binary.length; i++) {
                    arrayBuffer[i] = binary.charCodeAt(i);
                }
                const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
                return URL.createObjectURL(blob);
            });

            setPdfUrls(urls); // Set the URLs for displaying the PDFs
        } else {
            toast.error('No se encontraron reportes para los compuestos seleccionados.');
        }
    } catch (error) {
        toast.error('Error al generar el reporte');
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
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/rubber_menu')} />
                <h1 className='text-xl'>Reportes</h1>
            </header>
            <div className='mt-5'>
                <div className='mb-8'>
                    <CompoundSelector onAddCompound={handleAddCompound} />
                </div>

                <CompoundsTable tableData={tableData} onRemoveCompound={handleRemoveCompound} />

                <button
                    onClick={handleSubmit}
                    className='mt-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5'
                >
                    Generar reporte
                </button>
                {pdfUrls.length > 0 && (
                    <div className='mt-10'>
                        {pdfUrls.map((pdfUrl, index) => (
                            <iframe
                                key={index}
                                src={pdfUrl}
                                width='100%'
                                height='600px'
                                className='mt-10 rounded-md'
                            ></iframe>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RubberReport;
