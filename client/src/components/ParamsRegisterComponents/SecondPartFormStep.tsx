import { useEffect, useRef } from 'react';
import useFormStore from '../../stores/ParamsRegisterStore';
import api from '../../config/axiosConfig';
import { SecondParamsRegister, SectionType } from '../../types/ParamsRegisterTypes';
import { useForm } from 'react-hook-form';

const SecondPartFormStep = () => {
    const { initParams, secondParams, setSecondParams, setSteps } = useFormStore();
    const options = Array.from({ length: 9 }, (_, i) => i + 1);
    const sectionTypes: SectionType[] = ['superior', 'inferior'];
    const inputsRef = useRef(new Map<string, HTMLInputElement | null>());

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<SecondParamsRegister>({
        mode: 'onChange',
        defaultValues: secondParams,
    });

    const {ref,...rest} = register('pressure',{ required: true, min: 0 });

    const fieldLabels: { [key: string]: string } = {
        body: 'Cuerpo',
        strips: 'Cintas',
        full_cycle: 'Ciclo completo',
        cycle_time: 'Tiempo de ciclo',
        screen: 'Pantalla',
        mold2: 'Molde',
        platen: 'Placa',
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, key: string) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            const keys = Array.from(inputsRef.current.keys());
            const currentIndex = keys.indexOf(key);
            const nextKey = keys[currentIndex + 1];
            if (nextKey) {
                const nextInput = inputsRef.current.get(nextKey);
                nextInput?.focus();
            }
        }
    };

    useEffect(() => {
        const fetchMold = async () => {
            try {
                const response = await api.get(`/get-mold/${initParams.partnum}`);
                const fetchedMold = response.data.mold;

                if (fetchedMold) {
                    setSecondParams({ ...secondParams, mold: fetchedMold });
                }
            } catch (error) {
                console.error('Error fetching mold:', error);
            }
        };

        if (initParams.partnum) {
            fetchMold();
        }
    }, [initParams.partnum, setSecondParams]);

    const onSubmit = (data: SecondParamsRegister) => {
        const updatedData = { ...data, mold: secondParams.mold };
        console.log('Datos guardados en setSecondParams:', updatedData);

        setSecondParams(updatedData);
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
                    {['body', 'strips', 'full_cycle', 'cycle_time'].map(input => {
                        const { ref, ...rest } = register(input as keyof SecondParamsRegister, {
                            required: true,
                            min: 0,
                        });
                        return (
                            <div key={input}>
                                <label htmlFor={input} className='block mb-2 text-sm font-medium text-gray-900'>
                                    {fieldLabels[input]}
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    min={0}
                                    {...rest}
                                    ref={e => {
                                        ref(e);
                                        inputsRef.current.set(input, e);
                                    }}
                                    onKeyDown={e => handleKeyDown(e, input)}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {errors[input as keyof SecondParamsRegister] && (
                                    <span className='text-red-500 text-sm'>Campo requerido</span>
                                )}
                            </div>
                        );
                    })}
                    <div className='col-span-2'>
                        <div className='flex justify-between'>
                            {['screen', 'mold2', 'platen'].map(type => (
                                <div key={type} className='text-center flex-1 p-1'>
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>
                                        {fieldLabels[type]}
                                    </label>
                                    {sectionTypes.map(section => {
                                        const key = `${type}.${section}`;
                                        const { ref: registerRef, ...restRegister } = register(
                                            `${type}.${section}` as `${'screen' | 'mold2' | 'platen'}.${
                                                | 'superior'
                                                | 'inferior'}`,
                                            { required: true, min: 0 },
                                        );

                                        return (
                                            <div key={`${type}-${section}`} className='mb-2'>
                                                <label
                                                    htmlFor={`${type}-${section.toLowerCase()}`}
                                                    className='block mb-1 text-xs text-gray-700'
                                                >
                                                    {section}
                                                </label>
                                                <input
                                                    type='number'
                                                    step='0.01'
                                                    min={0}
                                                    {...restRegister}
                                                    ref={e => {
                                                        registerRef(e);
                                                        inputsRef.current.set(key, e);
                                                    }}
                                                    onKeyDown={e => handleKeyDown(e, key)} // Usar índice actual
                                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5'
                                                />
                                                {errors[type as 'screen' | 'mold2' | 'platen']?.[section] && (
                                                    <span className='text-red-500 text-sm'>Campo requerido</span>
                                                )}
                                            </div>
                                        );
                                    })}
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
                            {...rest}
                            step='0.01'
                            ref={e => {
                                ref(e)
                                inputsRef.current.set('psi', e);
                            }}
                            onKeyDown={e => handleKeyDown(e, 'psi')}
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
                    aria-disabled={!isValid}
                >
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default SecondPartFormStep;
