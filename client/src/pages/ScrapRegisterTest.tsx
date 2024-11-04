import { useEffect, useState } from 'react';
import Header from '../components/Header';
import { SubmitHandler, useForm } from 'react-hook-form';
import api from '../config/axiosConfig';

interface InputFields {
    date: string;
    shift: string;
    line: string;
    auditor: string;
    molder: string;
    inputs: {
        partNumber: string;
        compound: string;
        insert: string;
        gripper?: string;
        metal: string;
        insertWithoutRubber: string;
        gripperWithoutRubber: string;
        rubberWeight: string;
        insertWithRubber: string;
        gripperWithRubber: string;
        recycledInserts: string;
        totalInserts: string;
        totalGrippers?: string;
    };
    codes: { [key: string]: string };
}

const ScrapRegisterTest = () => {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<InputFields>();
    const [machines, setMachines] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);

    const inputs = [
        'No. Parte',
        'Compuesto',
        'Inserto',
        'Gripper',
        'Metal',
        'Inserto s/hule',
        'Gripper s/hule',
        'Peso Hule',
        'Inserto c/hule',
        'Gripper c/hule',
        'Incertos Reciclados',
        'Total Insertos',
        'Total grippers',
    ];

    const inputKeys: (keyof InputFields['inputs'])[] = [
        'partNumber',
        'compound',
        'insert',
        'gripper',
        'metal',
        'insertWithoutRubber',
        'gripperWithoutRubber',
        'rubberWeight',
        'insertWithRubber',
        'gripperWithRubber',
        'recycledInserts',
        'totalInserts',
        'totalGrippers',
    ];

    const codes = [
        'B',
        'CC',
        'CD',
        'CH',
        'CM',
        'CMB',
        'CR',
        'CROP',
        'CS',
        'D',
        'DI',
        'DP',
        'F',
        'FC',
        'FPM',
        'FPO',
        'GA',
        'GM',
        'H',
        '_ID',
        'IM',
        'IMC',
        'IP',
        'IR',
        'M',
        'MR',
        'O',
        'PD',
        'PR',
        'Q',
        'R',
        'RC',
        'RPM',
        'SG',
        'SI',
        'SL',
        'SR',
    ];

    

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await api.get('/load_scrap_data/');
                console.log(response.data);
                setMachines(response.data);
            } catch (error) {
                console.error('Error fetching machines:', error);
            }
        };

        fetchMachines();
    }, []);

    const onSubmit: SubmitHandler<InputFields> = data => {
        console.log(data);
        // Aquí puedes enviar los datos a la API
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] min-h-screen'>
            <Header title='Registro Scrap TEST' goto='/scrap_register' />
            <form onSubmit={handleSubmit(onSubmit)}>
                <section className='lg:flex gap-4 items-center grid md:grid-cols-5 md:grid-flow-row sm:grid-flow-col sm:grid-rows-2 mt-8'>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Fecha</label>
                        <input
                            type='date'
                            {...register('date', { required: 'La fecha es requerida' })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                        {errors.date && <span>{errors.date.message}</span>}
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>MP</label>
                        <select
                            {...register('line', { required: 'La línea es requerida' })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                {' '}
                            </option>
                            {machines.map((machine, index) => (
                                <option key={index} value={machine}>
                                    {machine}
                                </option>
                            ))}
                        </select>
                        {errors.line && <span>{errors.line.message}</span>}
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Turno</label>
                        <select
                            {...register('shift', { required: 'El turno es requerido' })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                {' '}
                            </option>
                            <option value='1'>1</option>
                            <option value='2'>2</option>
                        </select>
                        {errors.shift && <span>{errors.shift.message}</span>}
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Auditor</label>
                        <input
                            type='number'
                            {...register('auditor', { required: 'El auditor es requerido' })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                        {errors.auditor && <span>{errors.auditor.message}</span>}
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Moldeador</label>
                        <input
                            type='number'
                            {...register('molder', { required: 'El moldeador es requerido' })}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                        {errors.molder && <span>{errors.molder.message}</span>}
                    </div>
                </section>
                <section className='grid gap-y-5 md:grid-cols-2 gap-8 lg:grid-cols-1 grid-cols-1'>
                    {inputKeys.map((inputField, index) => (
                        <div key={index} className='flex flex-row items-center gap-2 lg:grid-cols-3 lg:grid xl:gap-10'>
                            <label>{inputs[index]}</label>
                            <input
                                type='text'
                                {...register(`inputs.${inputField}` as const, {
                                    required: `${inputs[index]} es requerido`,
                                })}
                            />
                            {errors.inputs?.[inputField] && <span>{errors.inputs[inputField]?.message}</span>}
                        </div>
                    ))}
                </section>
                <div className='justify-center mt-5 items-center'>
                    <button
                        // onClick={handleOpenModal}
                        className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    >
                        <h2>Registrar</h2>
                    </button>
                </div>
                <section className='grid grid-cols-4 ml-8 gap-2 '>
                    {codes.map((code, index) => (
                        <div key={index} className='flex flex-row items-center p-1'>
                            <label>{code}</label>
                            <input
                                type='text'
                                {...register(`codes.${code}`, { required: `El código ${code} es requerido` })}
                            />
                            {errors.codes?.[code] && <span>{errors.codes[code]?.message}</span>}
                        </div>
                    ))}
                </section>
            </form>
        </div>
    );
};

export default ScrapRegisterTest;
