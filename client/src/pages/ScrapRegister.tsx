import api from '../config/axiosConfig';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import '../index.css';
import '../output.css';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { log } from 'console';
//import Cookies from 'js-cookie';

interface InputFields {
    date: string;
    shift: string;
    line: string;
    auditor: string;
    inputs: string[];
    codes: { [key: string]: string };
}

const ScrapRegister: React.FC = () => {
    const [formData, setFormData] = useState<InputFields>({
        date: '',
        shift: '',
        line: '',
        auditor: '',
        inputs: Array(8).fill(''),
        codes: {},
    });

    const [machines, setMachines] = useState<string[]>([]);

    const inputs = [
        'No. Parte',
        'Moldeador',
        'Compuesto',
        'Inserto',
        'Metal',
        'Peso Hule',
        'Ito. c/hule',
        'Ito. s/hule',
        'Incertos Reciclados',
        'Total Insertos',
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        type: string,
        index: number | null = null,
    ) => {
        const { name, value } = e.target;

        if (type === 'input') {
            if (index !== null) {
                const updatedInputs = [...formData.inputs];
                updatedInputs[index] = value;
                setFormData({ ...formData, inputs: updatedInputs });
            }
        } else if (type === 'code') {
            setFormData({ ...formData, codes: { ...formData.codes, [name]: value } });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const formatDate = (date: string) => {
        const [year, month, day] = date.split('-');
        return `${year}-${month}-${day}`;
    };

    const handleRegister = async () => {
        try {
            const requiredFields = {
                'No. Parte necesario': formData.inputs[0],
                'Fecha necesaria': formData.date,
                'Prensa necesaria': formData.line,
                'Turno necesario': formData.shift,
                'Auditor necesario': formData.auditor,
                'Moldeador necesario': formData.inputs[1],
                'Metal necesario': formData.inputs[4],
                'Peso Hule necesario': formData.inputs[5],
                'Ito. c/hule necesario': formData.inputs[6],
                'Ito. s/hule necesario': formData.inputs[7],
                'Total Insertos necesario': formData.inputs[9],
            };

            for (const [message, value] of Object.entries(requiredFields)) {
                if (!value) {
                    toast.error(message);
                    return;
                }
            }

            const formattedDate = formatDate(formData.date);

            const formBody = new URLSearchParams();
            formBody.append('date', formattedDate);
            formBody.append('shift', formData.shift);
            formBody.append('line', formData.line);
            formBody.append('auditor', formData.auditor);

            formData.inputs.forEach((input, index) => {
                formBody.append(`inputs[${index}]`, input);
            });

            Object.keys(formData.codes).forEach(code => {
                formBody.append(`codes[${code}]`, formData.codes[code]);
            });

            console.log(formBody.toString());

            await api.post(`/register_scrap/`, formBody.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            setFormData({
                date: '',
                shift: '',
                line: '',
                auditor: '',
                inputs: Array(9).fill(''),
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
            const partNumber = formData.inputs[0];

            if (partNumber == '' || partNumber == null) {
                toast.error('Favor de introducir No. Parte');
            }

            const response = await api.get(`/search_in_part_number/`, {
                params: { part_number: partNumber },
            });

            console.log(response.data);
            const { Compuesto, Inserto, Metal, 'Ito. s/hule': ItoSHule } = response.data;
            const updatedInputs = [...formData.inputs];

            updatedInputs[2] = Compuesto == null ? '' : Compuesto;
            updatedInputs[3] = Inserto == null ? '' : Inserto;
            updatedInputs[4] = Metal == null ? '' : Metal;
            updatedInputs[7] = ItoSHule == null ? '' : ItoSHule;

            setFormData({ ...formData, inputs: updatedInputs });
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                toast.error('No. Parte no existe');
                const updatedInputs = [...formData.inputs];
                updatedInputs[2] = '';
                updatedInputs[3] = '';
                updatedInputs[4] = '';
                updatedInputs[7] = '';
                setFormData({ ...formData, inputs: updatedInputs });
            } else {
                console.error('Error fetching part number data:', error);
            }
        }
    };

    const handleSearchMetal = async () => {
        try {
            const metal = formData.inputs[4];
            const inserto = formData.inputs[3];

            if (metal === '' || metal == null || inserto === '' || inserto == null) {
                toast.error('Metal y/o Inserto faltantes');
                return;
            }

            const response = await api.get(`/search_weight`, {
                params: { metal: metal, inserto: inserto },
            });

            const { 'Ito. s/hule': ItoSHule } = response.data;
            const updatedInputs = [...formData.inputs];
            updatedInputs[7] = ItoSHule;

            setFormData({ ...formData, inputs: updatedInputs });
            console.log(response.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                toast.error('Ito s/hule no encontrado');
                const updatedInputs = [...formData.inputs];
                updatedInputs[7] = ' ';
            } else {
                console.error('Error fetching metal data:', error);
            }
        }
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer />
            <div className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Registro Scrap</h1>
            </div>

            <div className='flex justify-end gap-4 items-center'>
                <div className='flex flex-row gap-2'>
                    <h2>Fecha</h2>
                    <input
                        name='date'
                        type='date'
                        value={formData.date}
                        onChange={e => handleChange(e, 'date')}
                        className='rounded-sm w-32 h-6'
                    />
                </div>
                <div className='flex flex-row gap-2'>
                    <h2>LIN-</h2>
                    <select
                        name='line'
                        value={formData.line}
                        onChange={e => handleChange(e, 'line')}
                        className='bg-white rounded-sm w-24 h-6 px-2 text-sm flex items-center'
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
                <div className='flex flex-row gap-2'>
                    <h2>Turno</h2>
                    <select
                        name='shift'
                        value={formData.shift}
                        onChange={e => handleChange(e, 'shift')}
                        className='bg-white rounded-sm w-16 h-6 px-2'
                    >
                        <option value='' disabled>
                            {' '}
                        </option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                    </select>
                </div>
                <div className='flex flex-row gap-2'>
                    <h2>Auditor</h2>
                    <input
                        type='number'
                        name='auditor'
                        value={formData.auditor}
                        onChange={e => handleChange(e, 'auditor')}
                        className='rounded-sm w-20 h-6'
                    />
                </div>
                <button onClick={handleRegister} className='px-3 py-2 bg-[#9ADD57] rounded-md md:ml-4'>
                    <h2>Registrar</h2>
                </button>
            </div>

            <div className='flex flex-row gap-5 mt-7 md:mt-10'>
                <div>
                    <div className='grid gap-y-5'>
                        {inputs.map((input, index) => (
                            <div key={index} className='flex flex-row items-center'>
                                <label className='w-24'>{input}</label>
                                {input === 'No. Parte' ? (
                                    <>
                                        <input
                                            value={formData.inputs[index]}
                                            onChange={e => handleChange(e, 'input', index)}
                                            className='w-40 rounded-sm h-6'
                                        />
                                        <button
                                            onClick={handleSearchPartNumber}
                                            className=' text-sm ml-2 px-2 py-1 bg-[#579fdd] rounded-sm'
                                        >
                                            Buscar
                                        </button>
                                    </>
                                ) : input === 'Metal' ? (
                                    <>
                                        <input
                                            value={formData.inputs[index]}
                                            onChange={e => handleChange(e, 'input', index)}
                                            className='w-40 rounded-sm h-6'
                                        />
                                        <button
                                            onClick={handleSearchMetal}
                                            className=' text-sm ml-2 px-2 py-1 bg-[#579fdd] rounded-sm'
                                        >
                                            Buscar
                                        </button>
                                    </>
                                ) : (
                                    <input
                                        value={formData.inputs[index]}
                                        onChange={e => handleChange(e, 'input', index)}
                                        className='w-40 rounded-sm h-6'
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-5 justify-items-center'>
                        {codes.map((code, index) => (
                            <div key={index} className='flex flex-row items-center'>
                                <label className='w-14'>{code}</label>
                                <input
                                    type='number'
                                    name={code}
                                    value={formData.codes[code] || ''}
                                    onChange={e => handleChange(e, 'code')}
                                    className='w-4/6 rounded-sm h-6'
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
