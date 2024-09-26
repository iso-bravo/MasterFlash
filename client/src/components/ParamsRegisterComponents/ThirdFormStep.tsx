import { MdArrowBack } from 'react-icons/md';
import useFormStore from '../../stores/ParamsRegisterStore';
import { useEffect, useState } from 'react';

const ThirdFormStep = () => {
    const { initParams, secondParams, iccParams, thirdParams, setSteps, setThirdParams, setIccParams } = useFormStore();

    const [cavitiesData, setCavitiesData] = useState<Array<number[]>>(Array(secondParams.cavities).fill([0, 0, 0, 0]));

    useEffect(() => {
        if (initParams.icc) {
            setIccParams({ ...iccParams, cavities_arr: cavitiesData });
        } else {
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

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form action='' className=' space-y-6'>
                <MdArrowBack size={30} onClick={() => setSteps(2)} className='cursor-pointer' />
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
                                    id='julian'
                                    name='julian'
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
                                    id='ts2'
                                    name='ts2'
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
                    className='w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                >
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default ThirdFormStep;
