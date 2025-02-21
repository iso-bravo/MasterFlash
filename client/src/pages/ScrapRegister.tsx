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
        insertWithoutRubber: number | '';
        chemlok: number;
        gripperWithoutRubber: number;
        rubberWeight: number | '';
        insertWithRubber: number | '';
        gripperWithRubber: number;
        recycledInserts: number | '';
        totalInserts: number | '';
        totalGrippers: number;
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
            gripper: '0',
            metal: '',
            insertWithoutRubber: '',
            chemlok: 0,
            gripperWithoutRubber: 0,
            rubberWeight: '',
            insertWithRubber: '',
            gripperWithRubber: 0,
            recycledInserts: '',
            totalInserts: '',
            totalGrippers: 0,
        },
        codes: {},
    });

    const [machines, setMachines] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [isMoldingChecked, setIsMoldingChecked] = useState(false);
    const [isPeroxidChecked, setIsPeroxidChecked] = useState(false);

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

            console.log(response.data);
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
                    insertWithoutRubber: ItoSHule ? ItoSHule : '0',
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
            const gripper = formData.inputs.gripper;

            if (!metal || !inserto) {
                toast.error('Metal y/o Inserto faltantes');
                return;
            }

            if (!gripper) {
                const response = await api.get(`/search_weight`, {
                    params: { metal, inserto },
                });
                console.log(response.data);
                const { 'Ito. s/hule': ItoSHule, Chemlok } = response.data;
                setFormData(prevState => ({
                    ...prevState,
                    inputs: {
                        ...prevState.inputs,
                        insertWithoutRubber: ItoSHule,
                        chemlok: Chemlok ? Chemlok : '0',
                    },
                }));
            } else {
                const response = await api.get(`/search_weight`, {
                    params: { metal, inserto, gripper },
                });
                const { 'Ito. s/hule': ItoSHule, Gripper: GripsHule, Chemlok } = response.data;
                setFormData(prevState => ({
                    ...prevState,
                    inputs: {
                        ...prevState.inputs,
                        insertWithoutRubber: ItoSHule,
                        gripperWithoutRubber: GripsHule,
                        chemlok: Chemlok ? Chemlok : '0',
                    },
                }));
            }
        } catch (error) {
            console.error('Error fetching metal data:', error);
            toast.error('Inserto s/hule no encontrado');
        }
    };
    const inputs = [
        { key: 'partNumber', label: 'No. Parte', type: 'text', hasButton: true, onButtonClick: handleSearchPartNumber },
        { key: 'compound', label: 'Compuesto', type: 'text', hasCheckboxes: true },
        { key: 'insert', label: 'Inserto', type: 'text' },
        { key: 'gripper', label: 'Gripper', type: 'text' },
        { key: 'metal', label: 'Metal', type: 'text', hasButton: true, onButtonClick: handleSearchMetal },
        { key: 'insertWithoutRubber', label: 'Inserto s/hule', type: 'number' },
        { key: 'chemlok', label: 'Chemlok', type: 'number' },
        { key: 'gripperWithoutRubber', label: 'Gripper s/hule', type: 'number' },
        { key: 'rubberWeight', label: 'Peso Hule', type: 'number' },
        { key: 'insertWithRubber', label: 'Inserto c/hule', type: 'number' },
        { key: 'gripperWithRubber', label: 'Gripper c/hule', type: 'number' },
        { key: 'recycledInserts', label: 'Incertos Reciclados', type: 'number' },
        { key: 'totalInserts', label: 'Total Insertos', type: 'number' },
        { key: 'totalGrippers', label: 'Total grippers', type: 'number' },
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
        const requiredFields: { [key: string]: number | string | undefined } = {
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

    const handleCheckboxChange = (type: 'molding' | 'peroxid') => {
        if (type === 'molding') {
            setIsMoldingChecked(!isMoldingChecked);
        } else if (type === 'peroxid') {
            setIsPeroxidChecked(!isPeroxidChecked);
        }
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

            let compound = formData.inputs.compound;

            if (isMoldingChecked) {
                compound += '-molding';
            }
            if (isPeroxidChecked) {
                compound += '-peroxid';
            }

            const payload = {
                date: formattedDate,
                shift: formData.shift,
                line: formData.line,
                auditor: formData.auditor,
                molder: formData.molder,
                inputs: {
                    ...formData.inputs,
                    compound,
                },
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
                    chemlok: 0,
                    gripperWithoutRubber: 0,
                    rubberWeight: '',
                    insertWithRubber: '',
                    gripperWithRubber: 0,
                    recycledInserts: '',
                    totalInserts: '',
                    totalGrippers: 0,
                },
                codes: {},
            });

            toast.success('Registro exitoso');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error registering data');
        }
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] min-h-screen'>
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
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/scrap_summary')} />
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
                    <label className='block mb-2 text-sm font-medium text-gray-900'>MP</label>
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

            <div className=' flex flex-row justify-end'>
                <button
                    onClick={() => navigate('/scrap_register_test')}
                    className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-full border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100'
                >
                    Modo de pruebas
                </button>
            </div>

            <div className='flex lg:flex-row gap-5 mt-7 md:mt-10 flex-col'>
                <div>
                    <div className='grid gap-y-5 md:grid-cols-2 gap-8 lg:grid-cols-1 grid-cols-1'>
                        {inputs.map((config, index) => (
                            <div
                                key={index}
                                className='flex flex-row items-center  gap-2 lg:grid-cols-3 lg:grid xl:gap-10'
                            >
                                <label className='block mb-2 w-full text-sm font-medium text-gray-900'>
                                    {config.label}
                                </label>
                                <>
                                    <input
                                        type={config.type}
                                        value={formData.inputs[config.key as keyof InputFields['inputs']] || ''}
                                        onChange={e => handleChange(e, 'input')}
                                        min={0}
                                        name={config.key}
                                        className='block w-full p-2 text-gray-900 border border-gray-300 rounded-lg bg-gray-50 text-xs focus:ring-blue-500 focus:border-blue-500'
                                    />
                                    {config.hasButton && (
                                        <button
                                            onClick={config.onButtonClick}
                                            className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'
                                        >
                                            Buscar
                                        </button>
                                    )}
                                    {config.hasCheckboxes && (
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex items-center'>
                                                <input
                                                    id={`checkbox-molding-${index}`}
                                                    disabled={isPeroxidChecked}
                                                    type='checkbox'
                                                    checked={isMoldingChecked}
                                                    onChange={() => handleCheckboxChange('molding')}
                                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                                                />
                                                <label
                                                    htmlFor={`checkbox-molding-${index}`}
                                                    className='ml-2 text-sm font-medium text-gray-900'
                                                >
                                                    Molding
                                                </label>
                                            </div>
                                            <div className='flex items-center'>
                                                <input
                                                    id={`checkbox-peroxid-${index}`}
                                                    disabled={isMoldingChecked}
                                                    type='checkbox'
                                                    checked={isPeroxidChecked}
                                                    onChange={() => handleCheckboxChange('peroxid')}
                                                    className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500'
                                                />
                                                <label
                                                    htmlFor={`checkbox-peroxid-${index}`}
                                                    className='ml-2 text-sm font-medium text-gray-900'
                                                >
                                                    Peroxid
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </>
                            </div>
                        ))}
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
                    <div className='grid grid-cols-4 ml-8 gap-2 '>
                        {codes.map((code, index) => (
                            <div key={index} className='flex flex-row items-center p-1'>
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
