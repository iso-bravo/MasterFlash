import { useEffect } from 'react';
import useFormStore from '../../stores/ParamsRegisterStore';
import api from '../../config/axiosConfig';
import { SecondParamsRegister, SectionType } from '../../types/ParamsRegisterTypes';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

const SecondPartFormStep = () => {
    const { initParams, secondParams, setSecondParams, setSteps } = useFormStore();
    const options = Array.from({ length: 9 }, (_, i) => i + 1);
    const sectionTypes: SectionType[] = ['superior', 'inferior'];
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SecondParamsRegister>({
        mode: 'onChange',
        defaultValues: secondParams,
    });

    const fetchMold = async () => {
        try {
            const response = await api.get(`/get-mold/${initParams.partnum}`);
            const fetchedMold = response.data.mold;

            // Solo actualiza secondParams si el valor de mold ha cambiado
            if (secondParams.mold !== fetchedMold) {
                setSecondParams({ ...secondParams, mold: fetchedMold });
            }
        } catch (error) {
            console.error('Error fetching mold:', error);
        }
    };

    useEffect(() => {
        // Llama a la función solo si partnum no está vacío
        if (initParams.partnum) {
            fetchMold();
        }
    }, []);

    const onSubmit = (data: SecondParamsRegister) => {
        const requiredFields = ['cavities', 'metal', 'body', 'strips', 'full_cycle', 'cycle_time', 'pressure'];
        const sectionFields = ['screen', 'mold2', 'platen'];

        const isSimpleFieldsValid = requiredFields.every(field => data[field as keyof SecondParamsRegister]);
        const isSectionFieldsValid = sectionFields.every(field => {
            const sectionData = data[field as keyof SecondParamsRegister];
            return sectionData && typeof sectionData === 'object'
                ? sectionTypes.every(section => (sectionData as Record<SectionType, number>)[section])
                : false;
        });

        if (!isSimpleFieldsValid || !isSectionFieldsValid) {
            toast.error('Por favor, completa todos los campos obligatorios.');
            return;
        }

        setSecondParams(data)

        setSteps(3);
    };


    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form className='space-y-6' onSubmit={handleSubmit(onSubmit)}>
                <h5 className='text-xl font-medium text-gray-900'>Segunda parte</h5>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='cavities' className='block mb-2 text-sm font-medium text-gray-900'>
                            Cavidades
                        </label>
                        <select
                            {...register('cavities', { required: true })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            {options.map(number => (
                                <option key={number} value={number}>
                                    {number}
                                </option>
                            ))}
                        </select>
                        {errors.cavities && <span className='text-red-500 text-sm'>Campo requerido</span>}
                    </div>
                    <div>
                        <label htmlFor='metal' className='block mb-2 text-sm font-medium text-gray-900'>
                            Metal
                        </label>
                        <select
                            {...register('metal', { required: true })}
                            id='metal'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                Seleccione una opción
                            </option>
                            <option value='0.025'>0.025</option>
                            <option value='0.032'>0.032</option>
                            <option value='0.040'>0.040</option>
                        </select>
                        {errors.metal && <span className='text-red-500 text-sm'>Campo requerido</span>}
                    </div>
                    {['body', 'strips', 'full_cycle', 'cycle_time'].map(input => (
                        <div key={input}>
                            <label htmlFor={input} className='block mb-2 text-sm font-medium text-gray-900'>
                                {input}
                            </label>
                            <input
                                type='number'
                                {...register(input as keyof SecondParamsRegister, { required: true, min: 0 })}
                                step='0.01'
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            />
                            {errors[input as keyof SecondParamsRegister] && (
                                <span className='text-red-500 text-sm'>Campo requerido</span>
                            )}
                        </div>
                    ))}
                    <div className='col-span-2'>
                        <div className='flex justify-between'>
                            {['screen', 'mold2', 'platen'].map(type => (
                                <div key={type} className='text-center flex-1 p-1'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>{type}</label>
                                    {sectionTypes.map(section => (
                                        <div key={section} className='mb-2'>
                                            <label
                                                htmlFor={`${type}-${section.toLowerCase()}`}
                                                className='block mb-1 text-xs text-gray-700'
                                            >
                                                {section}
                                            </label>
                                            <input
                                                type='number'
                                                step='0.01'
                                                {...register(`${type as 'screen' | 'mold2' | 'platen'}.${section}`, {
                                                    required: true,
                                                    min: 0,
                                                })}
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5'
                                            />
                                            {/* Verifica si el error para el campo específico existe */}
                                            {errors[type as 'screen' | 'mold2' | 'platen']?.[
                                                section as 'superior' | 'inferior'
                                            ] && <span className='text-red-500 text-sm'>Campo requerido</span>}
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor='pressure' className='block mb-2 text-sm font-medium text-gray-900'>
                            Presión(psi)
                        </label>
                        <input
                            type='number'
                            {...register('pressure', { required: true, min: 0 })}
                            step='0.01'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                        {errors.pressure && <span className='text-red-500 text-sm'>Campo requerido</span>}
                    </div>
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

export default SecondPartFormStep;
