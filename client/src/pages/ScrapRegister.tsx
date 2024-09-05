import api from '../config/axiosConfig';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import '../index.css';
import '../output.css';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import ConfirmationPopUp from '../components/ConfirmationPopUp';
//import Cookies from 'js-cookie';
// Part number para probar  RF101GS-RD-P

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
        gripper: string;
        metal: string;
        insertWithoutRubber: string;
        rubberWeight: string;
        insertWithRubber: string;
        recycledInserts: string;
        totalInserts: string;
        totalGrippers: string;
    };
    codes: { [key: string]: string };
}

const ScrapRegister: React.FC = () => {
    const [formData, setFormData] = useState<InputFields>({
        date: '',
        shift: '',
        line: '',
        auditor: '',
        molder: '',
        inputs: {
            partNumber: '',
            compound: '',
            insert: '',
            gripper: '',
            metal: '',
            insertWithoutRubber: '',
            rubberWeight: '',
            insertWithRubber: '',
            recycledInserts: '',
            totalInserts: '',
            totalGrippers: '',
        },
        codes: {},
    });

    const [machines, setMachines] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);

    const inputs = [
        'No. Parte',
        'Compuesto',
        'Inserto',
        'Gripper',
        'Metal',
        'Inserto s/hule',
        //'Gripper s/hule',
        'Peso Hule',
        'Inserto c/hule',
        //'Gripper c/hule',
        'Incertos Reciclados',
        'Total Insertos',
        'Total grippers',
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

    const navigate = useNavigate();

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

    const handleOpenModal = () => {
        const requiredFields: { [key: string]: string | undefined } = {
            'No. Parte necesario': formData.inputs.partNumber,
            'Fecha necesaria': formData.date,
            'Prensa necesaria': formData.line,
            'Turno necesario': formData.shift,
            'Auditor necesario': formData.auditor,
            'Moldeador necesario': formData.molder,
            'Metal necesario': formData.inputs.metal,
            'Inserto s/hule necesario': formData.inputs.insertWithoutRubber,
            'Peso Hule necesario': formData.inputs.rubberWeight,
            'Inserto. c/hule necesario': formData.inputs.insertWithRubber,
            'Incertos Reciclados necesario': formData.inputs.recycledInserts,
            'Total Insertos necesario': formData.inputs.totalInserts,
        };

        if (formData.inputs.gripper) {
            requiredFields['Total Grippers necesario'] = formData.inputs.totalGrippers;
        }

        for (const [message, value] of Object.entries(requiredFields)) {
            if (!value) {
                toast.error(message);
                return;
            }
        }

        // Validación de fecha
        const today = new Date();
        const selectedDate = new Date(formData.date);

        if (selectedDate > today) {
            toast.error('La fecha no puede ser mayor que la de hoy');
            return;
        }

        // Validación de los códigos
        const hasValidCode = Object.values(formData.codes).some(code => code.trim() !== '');
        if (!hasValidCode) {
            toast.error('Debe ingresar al menos un código');
            return;
        }

        setShowModal(true);
    };

    const handleConfirm = async () => {
        setShowModal(false);
        await handleRegister();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, type: string) => {
        const { name, value } = e.target;

        if (type === 'input') {
            setFormData(prevState => ({
                ...prevState,
                inputs: {
                    ...prevState.inputs,
                    [name]: value,
                },
            }));
        } else if (type === 'code') {
            setFormData(prevState => ({
                ...prevState,
                codes: { ...prevState.codes, [name]: value },
            }));
        } else {
            setFormData(prevState => ({ ...prevState, [name]: value }));
        }
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    const handleRegister = async () => {
        try {
            const formattedDate = formatDate(formData.date);

            const payload = {
                date: formattedDate,
                shift: formData.shift,
                line: formData.line,
                auditor: formData.auditor,
                molder: formData.molder,
                inputs: formData.inputs,
                codes: formData.codes,
            };

            await api.post(`/register_scrap/`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            setFormData({
                date: '',
                shift: '',
                line: '',
                auditor: '',
                molder: '',
                inputs: {
                    partNumber: '',
                    compound: '',
                    insert: '',
                    gripper: '',
                    metal: '',
                    insertWithoutRubber: '',
                    rubberWeight: '',
                    insertWithRubber: '',
                    recycledInserts: '',
                    totalInserts: '',
                    totalGrippers: '',
                },
                codes: {},
            });

            toast.success('Registro exitoso');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error registering data');
        }
    };

    const handleSearchPartNumber = async () => {
        try {
            const partNumber = formData.inputs.partNumber;

            if (!partNumber) {
                toast.error('Favor de introducir No. Parte');
                return;
            }

            const response = await api.get(`/search_in_part_number/`, {
                params: { part_number: partNumber },
            });

            const {
                Compuesto = '',
                Inserto = '',
                Metal = '',
                Gripper = '',
                'Inserto s/hule': ItoSHule = '',
            } = response.data || {};

            setFormData(prevState => ({
                ...prevState,
                inputs: {
                    ...prevState.inputs,
                    compound: Compuesto,
                    insert: Inserto,
                    gripper: Gripper,
                    metal: Metal,
                    insertWithoutRubber: ItoSHule,
                },
            }));
        } catch (error) {
            console.error('Error fetching part number data:', error);
            toast.error('No. Parte no existe');
        }
    };

    const handleSearchMetal = async () => {
        try {
            const metal = formData.inputs.metal;
            const inserto = formData.inputs.insert;

            if (!metal || !inserto) {
                toast.error('Metal y/o Inserto faltantes');
                return;
            }

            const response = await api.get(`/search_weight`, {
                params: { metal, inserto },
            });

            const { 'Ito. s/hule': ItoSHule } = response.data;
            setFormData(prevState => ({
                ...prevState,
                inputs: {
                    ...prevState.inputs,
                    insertWithoutRubber: ItoSHule,
                },
            }));
        } catch (error) {
            console.error('Error fetching metal data:', error);
            toast.error('Inserto s/hule no encontrado');
        }
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer
                position='top-center'
                autoClose={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme='colored'
            />
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Registro Scrap</h1>
            </header>

            <section className='lg:flex gap-4 items-center grid md:grid-cols-5 md:grid-flow-row sm:grid-flow-col sm:grid-rows-2 mt-8'>
                <div>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>Fecha</label>
                    <input
                        name='date'
                        type='date'
                        value={formData.date}
                        onChange={e => handleChange(e, 'date')}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>LIN-</label>
                    <select
                        name='line'
                        value={formData.line}
                        onChange={e => handleChange(e, 'line')}
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
                </div>
                <div>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>Turno</label>
                    <select
                        name='shift'
                        value={formData.shift}
                        onChange={e => handleChange(e, 'shift')}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    >
                        <option value='' disabled>
                            {' '}
                        </option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                    </select>
                </div>
                <div>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>Auditor</label>
                    <input
                        type='number'
                        name='auditor'
                        value={formData.auditor}
                        onChange={e => handleChange(e, 'auditor')}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label className='block mb-2 text-sm font-medium text-gray-900'>Moldeador</label>
                    <input
                        type='number'
                        name='molder'
                        value={formData.molder}
                        onChange={e => handleChange(e, 'molder')}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
            </section>

            <div className='flex lg:flex-row gap-5 mt-7 md:mt-10 flex-col'>
                <div>
                    <div className='grid gap-y-5 md:grid-cols-2 grid-cols-1 lg:grid-cols-1 '>
                        {inputs.map((input, index) => {
                            const inputMap: { [key: number]: keyof typeof formData.inputs } = {
                                0: 'partNumber',
                                1: 'compound',
                                2: 'insert',
                                3: 'gripper',
                                4: 'metal',
                                5: 'insertWithoutRubber',
                                6: 'rubberWeight',
                                7: 'insertWithRubber',
                                8: 'recycledInserts',
                                9: 'totalInserts',
                                10: 'totalGrippers',
                            };
                            return (
                                <div
                                    key={index}
                                    className='flex flex-row items-center lg:grid-cols-3 lg:grid xl:gap-10'
                                >
                                    <label className='block mb-2 text-sm font-medium text-gray-900'>{input}</label>
                                    {input === 'No. Parte' ? (
                                        <>
                                            <input
                                                value={formData.inputs[inputMap[index]] || ''}
                                                onChange={e => handleChange(e, 'input')}
                                                name={inputMap[index]} // Importante agregar el name para manejar el campo
                                                className='block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500'
                                            />
                                            <button
                                                onClick={handleSearchPartNumber}
                                                className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'
                                            >
                                                Buscar
                                            </button>
                                        </>
                                    ) : input === 'Metal' ? (
                                        <>
                                            <input
                                                value={formData.inputs[inputMap[index]] || ''}
                                                onChange={e => handleChange(e, 'input')}
                                                name={inputMap[index]}
                                                className='block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500'
                                            />
                                            <button
                                                onClick={handleSearchMetal}
                                                className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'
                                            >
                                                Buscar
                                            </button>
                                        </>
                                    ) : (
                                        <input
                                            value={formData.inputs[inputMap[index]] || ''}
                                            onChange={e => handleChange(e, 'input')}
                                            name={inputMap[index]}
                                            className='block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500'
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className='justify-center mt-5 items-center'>
                        <button
                            onClick={handleOpenModal}
                            className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                        >
                            <h2>Registrar</h2>
                        </button>
                    </div>
                    {formData && (
                        <ConfirmationPopUp
                            show={showModal}
                            onClose={() => setShowModal(false)}
                            onConfirm={handleConfirm}
                            summary={formData}
                        />
                    )}
                </div>

                <div>
                    <div className='mt-5 grid sm:grid-cols-3 md:grid-cols-8 lg:grid-cols-4 gap-x-6 gap-y-5 justify-items-center lg:ml-12'>
                        {codes.map((code, index) => (
                            <div key={index} className='flex flex-row items-center'>
                                <label className='block w-14 text-sm font-medium text-gray-900'>{code}</label>
                                <input
                                    type='number'
                                    name={code}
                                    value={formData.codes[code] || ''}
                                    onChange={e => handleChange(e, 'code')}
                                    className='block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500'
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScrapRegister;
