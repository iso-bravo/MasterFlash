import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import { FormMachineData, MachineData, ProductionPerDay } from '../types/PressProductionTypes';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import ProductionPerDayTable from '../components/ProductionPerDayTable';

const ProductionPage = () => {
    const navigate = useNavigate();
    const { machineName } = useParams();
    const location = useLocation();
    const machineData: MachineData | undefined = location.state?.machineData || undefined;

    //TODO Revisar si después de un insert de relay se puede hacer un reset de los valores

    const { register, handleSubmit, setValue, reset, watch } = useForm<FormMachineData>({
        defaultValues: {
            employeeNumber: '',
            partNumber: '',
            caliber: 0,
            piecesOK: 0,
            piecesRework: 0,
            workOrder: '',
            molderNumber: '',
            start_time: '',
            end_time: null,
            relay: false,
            relayNumber: '',
        },
    });

    const relay = watch('relay');

    const [isEndTime, setIsEndTime] = useState(false);
    const [production_per_day, setProduction_per_day] = useState<ProductionPerDay[]>([]);
    const [isFormLocked, setIsFormLocked] = useState(false);

    useEffect(() => {
        // Reiniciar el  formulario completamente si no hay worked_hours_id
        if (!machineData?.worked_hours_id) {
            reset({
                employeeNumber: '',
                partNumber: '',
                caliber: 0,
                piecesOK: 0,
                piecesRework: 0,
                workOrder: '',
                molderNumber: '',
                start_time: '',
                end_time: null,
                relay: false,
                relayNumber: '',
            });
        } else {
            // Mantener lógica original si hay worked_hours activo
            reset({
                employeeNumber: machineData?.employee_number,
                partNumber: machineData?.part_number,
                caliber: machineData?.caliber,
                workOrder: machineData?.work_order,
                molderNumber: machineData?.molder_number,
                start_time: machineData?.start_time ? machineData.start_time.split('+')[0] : '',
                relay: false,
                relayNumber: '',
            });
        }
        setIsFormLocked(!!machineData?.worked_hours_id);
    }, [machineData, reset]);

    useEffect(() => {
        const fetch_production_per_day = async () => {
            try {
                const response = await api.get(`/get_todays_machine_production/?mp=${machineData?.name}`);
                console.log(response.data);
                setProduction_per_day(response.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetch_production_per_day();
    }, [machineData?.name]);

    useEffect(() => {
        if (relay) {
            setValue('piecesOK', 0);
            setValue('start_time', '');
        }
    }, [relay, setValue]);

    useEffect(() => {
        if (!relay) setValue('relayNumber', '');
    }, [relay, setValue]);

    const handleSave = async (data: FormMachineData) => {
        if (!machineData) return;

        const isRelay = !!data.relayNumber;
        const previousMolderNumber = isRelay ? machineData.molder_number : null;
        const molderNumberToSave = data.relayNumber || data.molderNumber || machineData.molder_number;

        if (data.relay && !data.relayNumber) {
            toast.error('Debe ingresar el número del relevo');
            return;
        }

        if (data.relay) {
            if (!data.start_time) {
                toast.error('El relevo debe tener una hora de inicio');
                return;
            }
        }

        const updatedMachine: MachineData = {
            ...machineData,
            employee_number: data.employeeNumber || machineData.employee_number,
            pieces_ok: Number(data.piecesOK),
            pieces_rework: Number(data.piecesRework) ?? machineData.pieces_rework,
            part_number: data.partNumber || machineData.part_number,
            work_order: data.workOrder || machineData.work_order,
            caliber: data.caliber || machineData.caliber,
            molder_number: molderNumberToSave,
            start_time: data.start_time || machineData.start_time,
            end_time: data.end_time,
            worked_hours_id: machineData.worked_hours_id,
            is_relay: isRelay,
            previous_molder_number: previousMolderNumber,
        };
        if (!data.start_time && !machineData.start_time) {
            toast.error('No se puede guardar la producción sin la hora de inicio.');
            return;
        }

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
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-screen overflow-y-auto overflow-x-hidden'>
            <ToastContainer />
            <section className='bg-white rounded-lg shadow-md p-6 mb-6'>
                <Header title={`Producción - ${machineName}`} goto='/presses_production' />
                <h1 className='text-3xl font-bold text-center mb-4 text-gray-800'>{machineData.name}</h1>
                <div className='grid grid-cols-2 gap-4 mb-4'>
                    <div className='bg-blue-50 p-4 rounded-lg'>
                        <p className='text-lg font-semibold text-blue-800'>Piezas producidas</p>
                        <p className='text-2xl font-bold text-blue-600'>{machineData.pieces_ok}</p>
                    </div>
                    <div className='bg-orange-50 p-4 rounded-lg'>
                        <p className='text-lg font-semibold text-orange-800'>Piezas re trabajo</p>
                        <p className='text-2xl font-bold text-orange-600'>{machineData.pieces_rework}</p>
                    </div>
                </div>
            </section>
            <form onSubmit={handleSubmit(handleSave)} className='bg-white rounded-lg shadow-md p-6 space-y-6'>
                <section className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='flex items-center justify-between bg-gray-50 p-4 rounded-lg'>
                        <span className='text-lg font-medium text-gray-700'>Relevo</span>
                        <label className='inline-flex items-center cursor-pointer'>
                            <input type='checkbox' className='sr-only peer' {...register('relay')} />
                            <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div className='flex items-center justify-between bg-gray-50 p-4 rounded-lg'>
                        <span className='text-lg font-medium text-gray-700'>Finalizar turno</span>
                        <label className='inline-flex items-center cursor-pointer'>
                            <input
                                type='checkbox'
                                className='sr-only peer'
                                checked={!!isEndTime}
                                onChange={() => setIsEndTime(!isEndTime)}
                            />
                            <div className="relative w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </section>
                <article className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {[
                        {
                            label: 'Orden de Trabajo',
                            name: 'workOrder',
                            placeholder: machineData.work_order ?? '',
                            disabled: isFormLocked,
                        },
                        {
                            label: 'Número de Parte',
                            name: 'partNumber',
                            placeholder: machineData.part_number ?? '',
                            disabled: isFormLocked,
                        },
                        { label: 'Calibre', name: 'caliber', placeholder: machineData.caliber ?? '' },
                        {
                            label: 'Hora de inicio',
                            name: 'start_time',
                            placeholder: machineData.start_time
                                ? new Date(machineData.start_time).toLocaleString()
                                : '',
                            type: 'datetime-local',
                        },
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
                    ].map(({ label, name, placeholder, type = 'text', disabled }, idx) => (
                        <div key={idx} className='space-y-2'>
                            <label htmlFor={`${name}Input`} className='block text-sm font-medium text-gray-700'>
                                {label}
                            </label>
                            <input
                                id={`${name}Input`}
                                type={type}
                                {...register(name as keyof FormMachineData)}
                                className={`w-full h-12 px-4 border rounded-lg ${
                                    disabled ? 'bg-gray-100 cursor-not-allowed' : 'focus:ring-2 focus:ring-blue-500'
                                }`}
                                placeholder={String(placeholder)}
                                disabled={disabled}
                                min={type === 'number' ? 0 : undefined}
                            />
                        </div>
                    ))}
                </article>
                {(isEndTime || relay) && (
                    <div className='space-y-2'>
                        <label htmlFor='end_time' className='block text-sm font-medium text-gray-700'>
                            Hora de finalización
                        </label>
                        <input
                            id='end_date'
                            type='datetime-local'
                            {...register('end_time')}
                            className='w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>
                )}

                {relay && (
                    <div className='space-y-2'>
                        <label htmlFor='relayNumberInput' className='block text-sm font-medium text-gray-700'>
                            Número del Relevo
                        </label>
                        <input
                            id='relayNumberInput'
                            type='number'
                            {...register('relayNumber')}
                            className='w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                            placeholder='Ingrese número del relevo'
                            min='0'
                        />
                    </div>
                )}

                <ProductionPerDayTable data={production_per_day} />

                <button
                    type='submit'
                    className='w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all'
                >
                    Guardar
                </button>
            </form>
        </div>
    );
};

export default ProductionPage;
