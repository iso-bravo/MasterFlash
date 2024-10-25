import useFormStore from '../../stores/ParamsRegisterStore';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ThirdFormStep = () => {
    const { initParams, secondParams, iccParams, thirdParams, setSteps, setThirdParams, setIccParams } = useFormStore();

    const [cavitiesData, setCavitiesData] = useState<Array<number[]>>(Array(secondParams.cavities).fill([0, 0, 0, 0]));

    useEffect(() => {
        if (initParams.icc && iccParams) {
            setIccParams({ ...iccParams, cavities_arr: cavitiesData });
        } else if (thirdParams) {
            setThirdParams({ ...thirdParams, cavities_arr: cavitiesData });
        }
    }, [cavitiesData]);

    const handleCavityChange = (cavityIndex: number, valueIndex: number, value: number) => {
        setCavitiesData(prevData => {
            const updatedData = [...prevData];
            updatedData[cavityIndex] = [...updatedData[cavityIndex]];
            updatedData[cavityIndex][valueIndex] = value;
            return updatedData;
        });
    };

    const handleBatchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const batchValue = e.target.value;
        if (initParams.icc && iccParams) {
            setIccParams({ ...iccParams, batch: batchValue });
        } else if (thirdParams) {
            setThirdParams({ ...thirdParams, batch: batchValue });
        }
    };

    const handleJulianChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const julianValue = parseFloat(e.target.value);
        if (iccParams?.batch) {
            setIccParams({ ...iccParams, julian: julianValue });
        }
    };

    const handleTs2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const ts2Value = parseFloat(e.target.value);
        if (thirdParams?.batch) {
            setThirdParams({ ...thirdParams, ts2: ts2Value });
        }
    };
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validar que el campo batch esté completo
        const batchValue = initParams.icc ? iccParams?.batch : thirdParams?.batch;
        if (!batchValue) {
            toast.error('Por favor, completa el campo Batch.');
            return;
        }

        // Validar campos específicos para ICC o ThirdParams
        if (initParams.icc) {
            if (!iccParams?.julian) {
                toast.error('Por favor, completa el campo Julian.');
                return;
            }
        } else {
            if (!thirdParams?.ts2) {
                toast.error('Por favor, completa el campo TS2.');
                return;
            }
        }

        // Validar que los valores de las cavidades estén completos
        const areCavitiesValid = cavitiesData.every(cavity => cavity.every(value => value !== 0));
        if (!areCavitiesValid) {
            toast.error('Por favor, completa todos los valores de las cavidades.');
            return;
        }

        // Si todo está completo, avanzar al siguiente paso
        setSteps(4);
    };

    const batchValue = initParams.icc ? iccParams?.batch : thirdParams?.batch;
    const isFormValid =
        batchValue &&
        (initParams.icc ? iccParams?.julian : thirdParams?.ts2) &&
        cavitiesData.every(cavity => cavity.every(value => value !== 0));

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form onSubmit={handleSubmit} className=' space-y-6'>
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
                            name='batch'
                            value={initParams.icc ? iccParams?.batch : thirdParams?.batch}
                            onChange={handleBatchChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                    </div>
                    <div>
                        {initParams.icc ? (
                            <>
                                <label htmlFor='julian' className='block mb-2 text-sm font-medium text-gray-900'>
                                    julian
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    id='julian'
                                    name='julian'
                                    min={0}
                                    value={iccParams?.julian}
                                    onChange={handleJulianChange}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                            </>
                        ) : (
                            <>
                                <label htmlFor='ts2' className='block mb-2 text-sm font-medium text-gray-900'>
                                    ts2
                                </label>
                                <input
                                    type='number'
                                    step='0.01'
                                    id='ts2'
                                    name='ts2'
                                    min={0}
                                    value={thirdParams?.ts2}
                                    onChange={handleTs2Change}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                            </>
                        )}
                    </div>
                </div>
                <div className='grid grid-cols-1 gap-4'>
                    {cavitiesData.map((cavity, cavityIndex) => (
                        <div key={cavityIndex} className='p-2 border border-gray-300 rounded-lg'>
                            <h5 className='mb-2 text-lg font-medium text-gray-900'>Cavity {cavityIndex + 1}</h5>
                            <div className='grid grid-cols-4 gap-2'>
                                {cavity.map((value, valueIndex) => (
                                    <div key={valueIndex}>
                                        <label className='block mb-1 text-sm font-medium text-gray-900'>
                                            Value {valueIndex + 1}
                                        </label>
                                        <input
                                            type='number'
                                            step='0.01'
                                            min={0}
                                            value={value}
                                            onChange={e =>
                                                handleCavityChange(cavityIndex, valueIndex, Number(e.target.value))
                                            }
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <button
                    type='submit'
                    className={`w-full text-white ${
                        isFormValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-300 cursor-not-allowed'
                    } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                    disabled={!isFormValid}
                >
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default ThirdFormStep;
