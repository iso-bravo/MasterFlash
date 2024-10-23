import { toast } from 'react-toastify';
import api from '../../config/axiosConfig';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';
import { PartNumberFormValues } from '../../types/PartNumsRegisterTypes';
import axios from 'axios';

const InputFormSummary = () => {
    const { generalInfo, palletAssembly, paintScrap, labelsCavities, imagesOthers, resetForm } = usePartNumForm();

    const handleRegister = async () => {
        // Crear un objeto JSON para los datos no relacionados con archivos
        const formDataJson: PartNumberFormValues = {
            ...generalInfo,
            ...palletAssembly,
            ...paintScrap,
            ...labelsCavities,
            ...imagesOthers,
        };

        try {
            await api.post('/new/part-number/', formDataJson);
            toast.success('Nuevo número de parte creado');
            resetForm();
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Verificamos si la respuesta tiene un mensaje de error específico del backend
                const errorMessage =
                    error.response?.data?.error || 'Error desconocido al registrar el número de parte.';
                toast.error(`Error: ${errorMessage}`);
            } else {
                // Si no es un error de Axios, mostramos un mensaje genérico
                toast.error('Error desconocido al registrar el número de parte.');
            }
            console.error('Error al registrar el número de parte:', error);
        }
    };

    const renderSection = (section: object, title: string) => {
        const entries = Object.entries(section);
        return (
            <div>
                <h3 className='font-semibold'>{title}</h3>
                <div>
                    {entries.map(([key, value], index) => (
                        <p key={index}>
                            <strong>{key.replace(/_/g, ' ')}: </strong>
                            {value || 'N/A'}
                        </p>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div>
            <h2 className='text-xl font-bold mb-4'>Resumen de Datos</h2>

            <div className='space-y-4 lg:grid lg:grid-cols-5'>
                {renderSection(generalInfo, 'Información General')}
                {renderSection(palletAssembly, 'Pallet Assembly')}
                {renderSection(paintScrap, 'Pain Scrap')}
                {renderSection(labelsCavities, 'Labels and Cavities')}
                {renderSection(imagesOthers, 'Images and Others')}
                <button
                    className='mt-4 px-4 py-2 bg-green-500 text-white rounded-lg col-span-5'
                    onClick={handleRegister}
                >
                    Registrar Número de Parte
                </button>
            </div>
        </div>
    );
};

export default InputFormSummary;
