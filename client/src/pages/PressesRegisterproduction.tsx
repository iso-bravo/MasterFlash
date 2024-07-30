import api from '../config/axiosConfig';
import React, { useEffect, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import '../index.css';
import '../output.css';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

interface DataItem {
    id: number;
    press: string;
    employee_number: number;
    part_number: string;
    work_order: string;
    caliber: number | null;
    worked_hrs: number;
    dead_time_cause_1: string;
    cavities: number;
    standard: number;
    proposed_standard: string;
    dead_time_cause_2: string;
    production: number;
    efficiency: number
    editable: boolean;
}

const PressesRegisterProduction: React.FC = () => {
    //TODO use types and fix the endpoints
    const [data, setData] = useState<DataItem[]>([]);
    const [editableData, setEditableData] = useState<DataItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            const response = await api.post(
                '/get_production_press_by_date/',
                { date: selectedDate },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            const responseData: DataItem[] = response.data;
            setData(responseData);
            setEditableData(responseData.map(item => ({ ...item, editable: false })));
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    },[selectedDate]);

    useEffect(() => {
        if (selectedDate) {
            fetchData();
        }
    }, [selectedDate,fetchData]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleDoubleClick = (index: number) => {
        const newData = [...editableData];
        newData[index].editable = true;
        setEditableData(newData);
    };

    const handleBlur = (index: number) => {
        const newData = [...editableData];
        newData[index].editable = false;
        setEditableData(newData);
        // Aquí puedes enviar los datos al backend si es necesario
        // api.post('/save', newData[index])
        //     .then(response => toast.success('Data saved successfully'))
        //     .catch(error => toast.error('Error saving data'));
    };

    const handleChange = (index: number, field: keyof DataItem, value: string | number) => {
        const newData = [...editableData];
        newData[index] = {
            ...newData[index],
            [field]: value,
        };
        setEditableData(newData);
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer />
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Registro Producción</h1>
            </header>

            <div className='lg:flex justify-end gap-4 items-center grid md:flex sm:grid-flow-col sm:grid sm:grid-rows-2'>
                <div className='flex flex-row gap-2'>
                    <h2>Fecha</h2>
                    <input name='date' type='date' className='rounded-sm w-32 h-6' onChange={handleDateChange} />
                </div>
            </div>

            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-12'>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3 '>
                                # MP
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                No.Operador
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                No.Parte
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Cavidades
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Calibre
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Hrs Trabajadas
                            </th>
                            <th scope='col' className='px-6 py-3 bg-yellow-300'>
                                Causa de Tiempo muerto
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Estándar por hora
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Estándar propuesto
                            </th>
                            <th scope='col' className='px-6 py-3 bg-yellow-300'>
                                Causa de tiempo muerto
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Producción
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Eficiencia
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Orden de trabajo
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {editableData.map((item, index) => (
                            <tr key={item.id} className='odd:bg-white even:bg-gray-50 border-b'>
                                <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                    {item.press}
                                </th>
                                <td className='px-6 py-4'>{item.employee_number}</td>
                                <td className='px-6 py-4'>{item.part_number}</td>
                                <td className='px-6 py-4'>
                                    <input
                                        type='text'
                                        value={item.cavities}
                                        onChange={e => handleChange(index, 'cavities', e.target.value)}
                                        onDoubleClick={() => handleDoubleClick(index)}
                                        onBlur={() => handleBlur(index)}
                                        className='w-full'
                                        readOnly={!item.editable}
                                    />
                                </td>
                                <td className='px-6 py-4'>{item.caliber}</td>
                                <td className='px-6 py-4'>
                                    <input
                                        type='text'
                                        value={item.worked_hrs}
                                        onChange={e => handleChange(index, 'worked_hrs', e.target.value)}
                                        onDoubleClick={() => handleDoubleClick(index)}
                                        onBlur={() => handleBlur(index)}
                                        className='w-full'
                                        readOnly={!item.editable}
                                    />
                                </td>
                                <td className='px-6 py-4 bg-yellow-300'>
                                    <input
                                        type='text'
                                        value={item.dead_time_cause_1}
                                        onChange={e => handleChange(index, 'dead_time_cause_1', e.target.value)}
                                        onDoubleClick={() => handleDoubleClick(index)}
                                        onBlur={() => handleBlur(index)}
                                        className='w-full'
                                        readOnly={!item.editable}
                                    />
                                </td>
                                <td className='px-6 py-4'>{item.standard}</td>
                                <td className='px-6 py-4'>
                                    <input
                                        type='text'
                                        value={item.proposed_standard}
                                        onChange={e => handleChange(index, 'proposed_standard', e.target.value)}
                                        onDoubleClick={() => handleDoubleClick(index)}
                                        onBlur={() => handleBlur(index)}
                                        className='w-full'
                                        readOnly={!item.editable}
                                    />
                                </td>
                                <td className='px-6 py-4 bg-yellow-300'>
                                    <input
                                        type='text'
                                        value={item.dead_time_cause_2}
                                        onChange={e =>
                                            handleChange(index, 'dead_time_cause_2', e.target.value)
                                        }
                                        onDoubleClick={() => handleDoubleClick(index)}
                                        onBlur={() => handleBlur(index)}
                                        className='w-full'
                                        readOnly={!item.editable}
                                    />
                                </td>
                                <td className='px-6 py-4'>{item.production}</td>
                                <td className='px-6 py-4'>{item.efficiency}</td>
                                <td className='px-6 py-4'>{item.work_order}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PressesRegisterProduction;
