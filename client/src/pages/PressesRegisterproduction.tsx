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
    pieces_ok: number;
    efficiency: number;
    editableField?: keyof DataItem; // Solo para un campo específico
}

const PressesRegisterProduction: React.FC = () => {
    const [editableData, setEditableData] = useState<DataItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedShift, setSelectedShift] = useState<string>('');
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        if (!selectedDate || !selectedShift) {
            toast.error('Selecciona una fecha y un turno.');
            return;
        }
        try {
            const response = await api.post(
                '/get_production_press_by_date/',
                { date: selectedDate, shift: selectedShift },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            const responseData: DataItem[] = response.data;
            setEditableData(responseData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }, [selectedDate, selectedShift]);

    useEffect(() => {
        if (selectedDate) {
            fetchData();
        }
    }, [selectedDate, fetchData]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedShift(e.target.value);
    };

    const handleDoubleClick = (index: number, field: keyof DataItem) => {
        const newData = [...editableData];
        newData[index] = {
            ...newData[index],
            editableField: field,
        };
        setEditableData(newData);
    };

    const handleBlur = (index: number) => {
        const newData = [...editableData];
        newData[index] = {
            ...newData[index],
            editableField: undefined,
        };
        setEditableData(newData);
    };

    const handleChange = (index: number, field: keyof DataItem, value: string | number) => {
        const newData = [...editableData];
        newData[index] = {
            ...newData[index],
            [field]: value,
        };
        setEditableData(newData);
    };

    const groupedData = editableData.reduce<Record<string, DataItem>>((acc, item) => {
        const key = `${item.press}-${item.employee_number}-${item.part_number}-${item.work_order}-${item.caliber}`;

        if (!acc[key]) {
            acc[key] = { ...item }; // Copia el objeto
        } else {
            // Suma las piezas si la clave ya existe
            acc[key].pieces_ok += item.pieces_ok;
            acc[key].worked_hrs += item.worked_hrs;
            acc[key].efficiency = (acc[key].efficiency + item.efficiency) / 2; // Promedio de eficiencia
        }

        return acc;
    }, {});

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer />
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/production_records')} />
                <h1 className='text-xl'>Registro Producción</h1>
            </header>

            <form className='lg:flex justify-end gap-4 items-center grid md:flex sm:grid-flow-col sm:grid sm:grid-rows-2'>
                <div className='flex flex-row gap-2'>
                    <h2>Fecha</h2>
                    <input name='date' type='date' className='rounded-sm w-32 h-6' onChange={handleDateChange} />
                </div>
                <div>
                    <label htmlFor='shifts'>Turno </label>
                    <select name='shifts select' defaultValue='' id='shifts' onChange={handleShiftChange}>
                        <option value='' disabled>
                            Selecciona un turno
                        </option>
                        <option value='First'>First</option>
                        <option value='Second'>Second</option>
                        <option value='Free'>Free</option>
                    </select>
                </div>
            </form>

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
                        {Object.values(groupedData).map((item, index) => (
                            <tr key={item.id} className='odd:bg-white even:bg-gray-50 border-b'>
                                <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                    {item.press}
                                </th>
                                <td className='px-6 py-4'>{item.employee_number}</td>
                                <td className='px-6 py-4'>{item.part_number}</td>
                                <td className='px-6 py-4'>
                                    {item.editableField === 'cavities' ? (
                                        <input
                                            type='text'
                                            value={item.cavities}
                                            onChange={e => handleChange(index, 'cavities', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            autoFocus
                                        />
                                    ) : (
                                        <span onDoubleClick={() => handleDoubleClick(index, 'cavities')}>
                                            {item.cavities}
                                        </span>
                                    )}
                                </td>
                                <td className='px-6 py-4' onDoubleClick={() => handleDoubleClick(index, 'caliber')}>
                                    {item.editableField === 'caliber' ? (
                                        <input
                                            type='text'
                                            value={item.caliber || ''}
                                            onChange={e => handleChange(index, 'caliber', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            autoFocus
                                        />
                                    ) : (
                                        <span onDoubleClick={() => handleDoubleClick(index, 'caliber')}>
                                            {item.caliber}
                                        </span>
                                    )}
                                </td>
                                <td className='px-6 py-4'>{item.editableField === 'worked_hrs'}</td>
                                <td className='px-6 py-4 bg-yellow-300'>{item.dead_time_cause_1}</td>
                                <td className='px-6 py-4'>{item.standard}</td>
                                <td className='px-6 py-4'>{item.proposed_standard}</td>
                                <td className='px-6 py-4 bg-yellow-300'>{item.dead_time_cause_2}</td>
                                <td className='px-6 py-4'>{item.pieces_ok}</td>
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
