import { useEffect, useState } from 'react';
import useFormStore from '../../stores/ParamsRegisterStore';
import api from '../../config/axiosConfig';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { InitParamsRegister } from '../../types/ParamsRegisterTypes';

const GeneralInfoFromStep = () => {
    const { initParams, setInitParams, setSteps } = useFormStore();

    const [machines, setMachines] = useState<string[]>();

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<InitParamsRegister>({
        defaultValues: initParams,
        mode: 'onChange', // Para validar al cambiar
    });

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await api.get('/load_scrap_data/');
                setMachines(response.data);
            } catch (error) {
                console.error('Error fetching machines:', error);
            }
        };

        fetchMachines();
    }, []);

    const onSubmit = (data: InitParamsRegister) => {
        // Validar si todos los campos requeridos están completos
        const requiredFields = ['mp', 'turn', 'partnum', 'auditor', 'molder'];
        const isFormComplete = requiredFields.every(field => data[field as keyof InitParamsRegister]);

        if (!isFormComplete) {
            toast.error('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Sincroniza los datos con el store
        setInitParams(data);
        setSteps(2);
    };

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <h5 className='text-xl font-medium text-gray-900'>Valores generales</h5>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='mp' className='block mb-2 text-sm font-medium text-gray-900'>
                            MP
                        </label>
                        <select
                            id='mp'
                            {...register('mp', { required: true })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                Selecciona una opción
                            </option>
                            {machines?.map((machine, index) => (
                                <option key={index} value={machine}>
                                    {machine}
                                </option>
                            ))}
                        </select>
                        {errors.mp && <span className='text-red-500 text-sm'>Campo obligatorio</span>}
                    </div>
                    <div>
                        <label htmlFor='turno' className='block mb-2 text-sm font-medium text-gray-900'>
                            Turno
                        </label>
                        <select
                            id='turno'
                            {...register('turn', { required: true })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value=''>Elige un turno</option>
                            <option value='1'>1</option>
                            <option value='2'>2</option>
                        </select>
                        {errors.turn && <span className='text-red-500 text-sm'>Campo obligatorio</span>}
                    </div>
                    {['partnum', 'auditor', 'molder'].map(input => (
                        <div key={input}>
                            <label htmlFor={input} className='block mb-2 text-sm font-medium text-gray-900'>
                                {input}
                            </label>
                            <input
                                type={input === 'partnum' ? 'text' : 'number'}
                                min={0}
                                id={input}
                                {...register(input as keyof InitParamsRegister, { required: true })}
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            />
                            {errors[input as keyof InitParamsRegister] && (
                                <span className='text-red-500 text-sm'>Campo obligatorio</span>
                            )}
                        </div>
                    ))}
                    <label className='inline-flex items-center cursor-pointer'>
                        <input type='checkbox' {...register('icc')} className='sr-only peer' />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className='ms-3 text-sm font-medium text-gray-900'> ICC </span>
                    </label>
                </div>
                <button
                    type='submit'
                    className={`w-full text-white ${
                        isValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-300 cursor-not-allowed'
                    } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                    disabled={!isValid}
                >
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default GeneralInfoFromStep;
