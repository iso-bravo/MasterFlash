import { toast } from 'react-toastify';
import api from '../../config/axiosConfig';
import { usePartNumForm } from '../../stores/PartNumsRegisterStore';
import { PartNumberFormValues } from '../../types/PartNumsRegisterTypes';

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

        console.log(formDataJson);

        try {
            const response = await api.post('/new/part-number/', formDataJson);
            toast.success(response.data);
            console.log(response.data);
            resetForm();
        } catch (error) {
            toast.error('Error al registrar el número de parte');
            console.error('Error al registrar el número de parte:', error);
        }
    };

    return (
        <div>
            <h2 className='text-xl font-bold mb-4'>Resumen de Datos</h2>

            <div className='space-y-4'>
                <h3 className='font-semibold'>Información General</h3>
                <p>
                    <strong>Part Number:</strong> {generalInfo?.part_number}
                </p>
                <p>
                    <strong>Client:</strong> {generalInfo?.client}
                </p>
                <p>
                    <strong>Box:</strong> {generalInfo?.box}
                </p>
                <p>
                    <strong>Pieces por Box:</strong> {generalInfo?.pieces_x_box}
                </p>
                <p>
                    <strong>Compuesto de Hule:</strong> {generalInfo?.rubber_compound}
                </p>
                <p>
                    <strong>Precio:</strong> {generalInfo?.price}
                </p>
                <p>
                    <strong>Standard:</strong> {generalInfo?.standard}
                </p>

                <h3 className='font-semibold'>Pallet Assembly</h3>
                <p>
                    <strong>Pallet:</strong> {palletAssembly?.pallet}
                </p>
                <p>
                    <strong>Box por Pallet:</strong> {palletAssembly?.box_x_pallet}
                </p>
                <p>
                    <strong>Piezas por Pallet:</strong> {palletAssembly?.pieces_x_pallet}
                </p>

                <h3 className='font-semibold'>Paint Scrap</h3>
                <p>
                    <strong>Calibre:</strong> {paintScrap?.caliber}
                </p>
                <p>
                    <strong>Pintura:</strong> {paintScrap?.paint}
                </p>
                <p>
                    <strong>Painter:</strong> {paintScrap?.painter}
                </p>
                <p>
                    <strong>Scrap:</strong> {paintScrap?.scrap}
                </p>

                <h3 className='font-semibold'>Labels and Cavities</h3>
                <p>
                    <strong>Cavidades:</strong> {labelsCavities?.cavities}
                </p>
                <p>
                    <strong>Categoría:</strong> {labelsCavities?.category}
                </p>
                <p>
                    <strong>Tipo 2:</strong> {labelsCavities?.type2}
                </p>

                <h3 className='font-semibold'>Images and Others</h3>
                <p>
                    <strong>Made in Mexico:</strong> {imagesOthers?.made_in_mexico}
                </p>
                <p>
                    <strong>Staples:</strong> {imagesOthers?.staples}
                </p>

                <button className='mt-4 px-4 py-2 bg-green-500 text-white rounded-lg' onClick={handleRegister}>
                    Registrar Número de Parte
                </button>
            </div>
        </div>
    );
};

export default InputFormSummary;
