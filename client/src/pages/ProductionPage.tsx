import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { FormMachineData, MachineData } from '../types/PressProductionTypes';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';

const ProductionPage = () => {
    const navigate = useNavigate();
    const { machineName } = useParams();
    const location = useLocation();
    const machineData: MachineData | undefined = location.state?.machineData || undefined;

    const { register, handleSubmit, setValue, reset, watch } = useForm<FormMachineData>({
        defaultValues: {
            employeeNumber: '',
            partNumber: '',
            piecesOK: 0,
            piecesRework: 0,
            workOrder: '',
            molderNumber: '',
            relay: false,
            relayNumber: '',
        },
    });

    const relay = watch('relay');
    const workOrder = watch('workOrder');
    const partNumber = watch('partNumber');

    const [initialLoad, setInitialLoad] = useState(true);
    useEffect(() => {
        reset({
            employeeNumber: machineData?.employee_number,
            partNumber: machineData?.part_number,
            piecesOK: machineData?.pieces_ok,
            piecesRework: machineData?.pieces_rework,
            workOrder: machineData?.work_order,
            molderNumber: machineData?.molder_number,
            relay: false,
            relayNumber: '',
        });
        setInitialLoad(false);
    }, [machineData, reset]);

    useEffect(() => {
        if (!initialLoad && (partNumber !== machineData?.part_number || workOrder !== machineData.work_order)) {
            setValue('piecesOK', 0);
            setValue('piecesRework', 0);
        }
    }, [workOrder, partNumber, setValue, initialLoad, machineData]);

    useEffect(() => {
        if (!relay) setValue('relayNumber', '');
    }, [relay, setValue]);

    const handleSave = async (data: FormMachineData) => {
        if (!machineData) return;

        const isRelay = !!data.relayNumber;
        const previousMolderNumber = isRelay ? machineData.molder_number : null;
        const molderNumberToSave = data.relayNumber || data.molderNumber || machineData.molder_number;

        const updatedMachine: MachineData = {
            ...machineData,
            employee_number: data.employeeNumber || machineData.employee_number,
            pieces_ok: Number(data.piecesOK) ?? machineData.pieces_ok,
            pieces_rework: Number(data.piecesRework) ?? machineData.pieces_rework,
            part_number: data.partNumber || machineData.part_number,
            work_order: data.workOrder || machineData.work_order,
            molder_number: molderNumberToSave,
            is_relay: isRelay,
            previous_molder_number: previousMolderNumber,
        };

        try {
            console.log('Enviando datos actualizados:', updatedMachine);
            const response = await api.post('/register_data_production/', updatedMachine, {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(response.data);
            toast.success('Producción guardada con éxito!');
            navigate('/presses_production');
        } catch (error) {
            console.error('Error al guardar producción:', error);
            toast.error('Error al guardar producción');
        }
    };

    if (!machineData) {
        toast.error('No se encontró información de la máquina.');
        navigate('/presses_production');
        return null;
    }

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-screen '>
            <ToastContainer />
            <Header title={`Producción - ${machineName}`} goto='/presses_production' />
            <section className='flex flex-col justify-evenly items-center'>
                <h1 className='text-2xl lg:text-2xl xl:text-3xl font-semibold'>{machineData.name}</h1>
                <div>
                    <span>Piezas producidas: </span>
                    <span className='text-xl w-11/12 md:w-1/2'>{machineData.pieces_ok}</span>
                </div>
                <div>
                    <span>Piezas re trabajo: </span>
                    <span className='text-xl w-11/12 md:w-1/2'>{machineData.pieces_rework}</span>
                </div>
            </section>
            <div className='flex flex-col justify-center items-center sm:flex-row md:flex-row gap-y-4 md:gap-x-5'>
                <label className='text-xl w-11/12 md:w-1/2'>Relevo</label>
                <label className='inline-flex items-center cursor-pointer'>
                    <input type='checkbox' className='sr-only peer' {...register('relay')} />
                    <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className='ms-3 text-sm font-medium text-gray-900'>{relay ? 'Activado' : 'Desactivado'}</span>
                </label>
            </div>
            <form onSubmit={handleSubmit(handleSave)} className='flex flex-col gap-y-4 mt-4'>
                {[
                    { label: 'Orden de Trabajo', name: 'workOrder', placeholder: machineData.work_order ?? '' },
                    { label: 'Número de Parte', name: 'partNumber', placeholder: machineData.part_number ?? '' },
                    {
                        label: 'Empacador',
                        name: 'employeeNumber',
                        placeholder: machineData.employee_number ?? '',
                        type: 'number',
                    },
                    {
                        label: 'Moldeador',
                        name: 'molderNumber',
                        placeholder: machineData.molder_number ?? '',
                        type: 'number',
                    },
                    {
                        label: 'Piezas Producidas',
                        name: 'piecesOK',
                        placeholder: machineData.pieces_ok ?? '',
                        type: 'number',
                    },
                    { label: 'Piezas Re trabajo', name: 'piecesRework', placeholder: '0', type: 'number' },
                ].map(({ label, name, placeholder, type = 'text' }, idx) => (
                    <div
                        key={idx}
                        className='flex flex-col justify-center items-center sm:flex-row md:flex-row gap-y-4 md:gap-x-5'
                    >
                        <label htmlFor={`${name}Input`} className='text-xl w-11/12 md:w-1/2'>
                            {label}
                        </label>
                        <input
                            id={`${name}Input`}
                            type={type}
                            {...register(name as keyof FormMachineData)}
                            className='bg-white rounded-md w-full md:w-64 px-2'
                            placeholder={String(placeholder)}
                            min={type === 'number' ? 0 : undefined}
                        />
                    </div>
                ))}
                <div
                    className={`flex flex-col justify-center items-center sm:flex-row md:flex-row gap-y-4 md:gap-x-5 
                ${relay ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                transition-all duration-500 ease-in-out`}
                >
                    <label htmlFor='relayNumberInput' className='text-xl w-11/12 md:w-1/2'>
                        Número del Relevo
                    </label>
                    <input
                        id='relayNumberInput'
                        type='number'
                        {...register('relayNumber')}
                        className='bg-white rounded-md w-full md:w-64 px-2'
                        placeholder='Ingrese número del relevo'
                        min='0'
                    />
                </div>

                <button
                    type='submit'
                    className='bg-[#73e33c] px-6 py-2 text-xl rounded-md hover:bg-[#78e741] focus:outline-none focus:ring focus:ring-[#3fd555]'
                >
                    Guardar
                </button>
            </form>
        </div>
    );
};

export default ProductionPage;
