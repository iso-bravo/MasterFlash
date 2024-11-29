import useFormStore from '../../stores/ParamsRegisterStore';
import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useForm, SubmitHandler, useWatch } from 'react-hook-form';
import { ThirdParamsRegister } from '../../types/ParamsRegisterTypes';

const ThirdFormStep = () => {
    const { initParams, secondParams, thirdParams, setSteps, setThirdParams } = useFormStore();
    const inputsRef = useRef(new Map<string, HTMLInputElement | null>());

    const {
        register,
        handleSubmit,
        control,
        setValue,
        formState: { errors },
    } = useForm<ThirdParamsRegister>({
        mode: 'onChange',
        defaultValues: {
            batch: thirdParams.batch || '',
            julian: initParams.icc ? thirdParams.julian : undefined,
            ts2: !initParams.icc ? thirdParams.ts2 : undefined,
            cavities_arr: thirdParams.cavities_arr.length
                ? thirdParams.cavities_arr
                : Array.from({ length: secondParams.cavities }, () => [0, 0, 0, 0, 0]),
        },
    });

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

    const cavities_arr = useWatch({ control, name: 'cavities_arr' });

    useEffect(() => {
        const expectedLength = secondParams.cavities;
        const updatedCavitiesArr = Array.from(
            { length: expectedLength },
            (_, idx) => cavities_arr[idx] || [0, 0, 0, 0, 0],
        );

        // Solo actualiza si es necesario
        if (JSON.stringify(cavities_arr) !== JSON.stringify(updatedCavitiesArr)) {
            setValue('cavities_arr', updatedCavitiesArr);
        }

        // Sincroniza con el estado global
        if (JSON.stringify(thirdParams.cavities_arr) !== JSON.stringify(cavities_arr)) {
            setThirdParams({ ...thirdParams, cavities_arr });
        }
    }, [secondParams.cavities, cavities_arr, setValue, thirdParams, setThirdParams]);

    const onSubmit: SubmitHandler<ThirdParamsRegister> = data => {
        if (!data.batch) {
            toast.error('Por favor, completa el campo Batch.');
            return;
        }

        if (initParams.icc && !data.julian) {
            toast.error('Por favor, completa el campo Julian.');
            return;
        }

        if (!initParams.icc && !data.ts2) {
            toast.error('Por favor, completa el campo TS2.');
            return;
        }

        const areCavitiesValid = data.cavities_arr.every(cavity => {
            const validCount = cavity.filter(value => value > 0).length;
            return validCount >= 4;
        });

        if (!areCavitiesValid) {
            toast.error('Revisa las cavidades: al menos 4 valores deben ser mayores a 0.');
            return;
        }

        try {
            setThirdParams(data);
            setSteps(4);
        } catch (error) {
            console.error('Error setting params: ', error);
            toast.error('Ocurrió un error al procesar los datos.');
        }
    };
    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                <h5 className='text-xl font-medium text-gray-900'>
                    {initParams.icc ? 'Registro ICC' : 'Registro de paredes'}
                </h5>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='batch' className='block mb-2 text-sm font-medium text-gray-900'>
                            Batch
                        </label>
                        <input
                            type='text'
                            id='batch'
                            {...(() => {
                                const { ref, ...rest } = register('batch', { required: true });
                                return {
                                    ...rest,
                                    ref: e => {
                                        ref(e);
                                        inputsRef.current.set('batch', e);
                                    },
                                };
                            })()}
                            onKeyDown={e => handleKeyDown(e, 'batch')}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                        {errors.batch && <span className='text-red-500 text-sm'>Campo requerido</span>}
                    </div>
                    <div>
                        {initParams.icc ? (
                            <>
                                <label htmlFor='julian' className='block mb-2 text-sm font-medium text-gray-900'>
                                    Julian
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    id='julian'
                                    {...(() => {
                                        const { ref, ...rest } = register('julian', { required: true });
                                        return {
                                            ...rest,
                                            ref: e => {
                                                ref(e);
                                                inputsRef.current.set('julian', e);
                                            },
                                        };
                                    })()}
                                    onKeyDown={e => handleKeyDown(e, 'julian')}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {errors.julian && <span className='text-red-500 text-sm'>Campo requerido</span>}
                            </>
                        ) : (
                            <>
                                <label htmlFor='ts2' className='block mb-2 text-sm font-medium text-gray-900'>
                                    TS2
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    id='ts2'
                                    {...(() => {
                                        const { ref, ...rest } = register('ts2', { required: true });
                                        return {
                                            ...rest,
                                            ref: e => {
                                                ref(e);
                                                inputsRef.current.set('ts2', e);
                                            },
                                        };
                                    })()}
                                    onKeyDown={e => handleKeyDown(e, 'ts2')}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                                {errors.ts2 && <span className='text-red-500 text-sm'>Campo requerido</span>}
                            </>
                        )}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    {cavities_arr.map((cavity, cavityIndex) => (
                        <div key={cavityIndex} className='p-2 border border-gray-300 rounded-lg'>
                            <h5 className='mb-2 text-lg font-medium text-gray-900'>Cavidad {cavityIndex + 1}</h5>
                            <div className='grid grid-cols-5 gap-2'>
                                {cavity.map((value, valueIndex) => {
                                    const key = `${cavityIndex}.${valueIndex}`;
                                    const { ref, ...rest } = register(`cavities_arr.${cavityIndex}.${valueIndex}`, {
                                        min: {
                                            value: 0,
                                            message: 'El valor mínimo permitido es 0',
                                        },
                                        required: 'Este campo es obligatorio, mínimo 0',
                                    });
                                    return (
                                        <div key={valueIndex}>
                                            <input
                                                type='number'
                                                step='0.01'
                                                min={0}
                                                value={value}
                                                {...rest}
                                                ref={e => {
                                                    ref(e);
                                                    inputsRef.current.set(key, e);
                                                }}
                                                onKeyDown={e => handleKeyDown(e, key)}
                                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            />
                                            {/* Mensaje de error */}
                                            {errors.cavities_arr?.[cavityIndex]?.[valueIndex] && (
                                                <span className='text-red-500 text-sm'>
                                                    {errors.cavities_arr[cavityIndex][valueIndex].message}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type='submit'
                    className='w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                >
                    Continuar
                </button>
            </form>
        </div>
    );
};

export default ThirdFormStep;
