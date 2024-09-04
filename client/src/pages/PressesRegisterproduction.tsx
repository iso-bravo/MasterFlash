import api from '../config/axiosConfig';
import React, { useEffect, useState, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import '../index.css';
import '../output.css';
import { IoIosArrowBack } from 'react-icons/io';
import { useLocation, useNavigate } from 'react-router-dom';
import OverWritePopUp from '../components/OverWritePopUp';

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
    date_time: string;
    shift: string;
    editableField?: keyof DataItem;
}

const PressesRegisterProduction: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [editableData, setEditableData] = useState<DataItem[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>(location.state?.date || '');
    const [selectedShift, setSelectedShift] = useState<string>(location.state?.shift || '');
    const [showModal,setShowModal] = useState<boolean>(false);
    const [overwrite,setOverwrite] = useState<boolean>(false);


    const groupDataItems = (data: DataItem[]): DataItem[] => {
        const groupedData: { [key: string]: DataItem } = {};

        data.forEach(item => {
            const key = `${item.press}-${item.employee_number}-${item.part_number}`;

            if (groupedData[key]) {
                groupedData[key].pieces_ok += item.pieces_ok;
            } else {
                groupedData[key] = { ...item };
            }
        });

        return Object.values(groupedData).sort((a, b) => a.press.localeCompare(b.press));
    };

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

            const groupedData = groupDataItems(responseData);

            groupedData.forEach(item => {
                item.efficiency = 0;
            });

            console.log(groupedData);

            setEditableData(groupedData);
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

        if (field === 'worked_hrs') {
            const workedHrs = Number(value);
            if (workedHrs > 0) {
                const decimal = 100 * (newData[index].pieces_ok / (newData[index].standard * workedHrs));
                newData[index].efficiency = Number(decimal.toFixed(2));
            } else {
                newData[index].efficiency = 0;
            }
        }

        setEditableData(newData);
    };

    const handleSave = async () => {
        const request = {
            date: selectedDate,
            shift: selectedShift,
            records: editableData.map(item => ({
                press: item.press,
                employee_number: item.employee_number,
                part_number: item.part_number,
                work_order: item.work_order,
                caliber: item.caliber || '',
                worked_hrs: item.worked_hrs,
                dead_time_cause_1: item.dead_time_cause_1 || '',
                cavities: item.cavities,
                standard: item.standard,
                proposed_standard: item.proposed_standard || '',
                dead_time_cause_2: item.dead_time_cause_2 || '',
                pieces_ok: item.pieces_ok,
                efficiency: item.efficiency,
            })),
            overwrite: overwrite,
        };

        try {
            const response = await api.post('/save_production_records/', request, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.data.status === 'exists') {
                setShowModal(true); 
            } else {
                toast.success('Datos guardados exitosamente.');
            }
        } catch (error) {
            console.error('Error al guardar los datos: ', error);
            toast.error('Hubo un error al guardar los datos.');
        }
    };

    const handleConfirmOverwrite = async () => {
        setOverwrite(true);
        setShowModal(false);

        try {
            const response = await api.post(
                '/save_production_records/',
                {
                    date: selectedDate,
                    shift: selectedShift,
                    records: editableData.map(item => ({
                        press: item.press,
                        employee_number: item.employee_number,
                        part_number: item.part_number,
                        work_order: item.work_order,
                        caliber: item.caliber || '',
                        worked_hrs: item.worked_hrs,
                        dead_time_cause_1: item.dead_time_cause_1 || '',
                        cavities: item.cavities,
                        standard: item.standard,
                        proposed_standard: item.proposed_standard || '',
                        dead_time_cause_2: item.dead_time_cause_2 || '',
                        pieces_ok: item.pieces_ok,
                        efficiency: item.efficiency,
                    })),
                    overwrite: true,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            );

            console.log(response);
            toast.success('Datos sobrescritos exitosamente.');
        } catch (error) {
            console.error('Error al sobrescribir los datos: ', error);
            toast.error('Hubo un error al sobrescribir los datos.');
        }
    };

    const handleEditClick = () => {
        const queryString = new URLSearchParams({
            date: selectedDate,
            shift: selectedShift,
        }).toString();

        navigate(`/edit_production_record?${queryString}`);
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-screen'>
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
            <OverWritePopUp
                show={showModal}
                onClose={() => setShowModal(false)}
                onConfirm={handleConfirmOverwrite}
                message='Los datos ya existen. ¿Desea sobrescribirlos?'
            />
            <header className='flex items-start gap-3 mb-4'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/production_records')} />
                <h1 className='text-xl'>Registro Producción</h1>
            </header>

            <div className='grid grid-cols-3 items-center gap-4'>
                <div className=' col-start-2 flex justify-center gap-4'>
                    <div>
                        <label htmlFor='shifts select' className='block mb-2 text-sm font-medium text-gray-900'>
                            Turno
                        </label>
                        <select
                            name='shifts select'
                            defaultValue=''
                            id='shifts'
                            value={selectedShift}
                            onChange={handleShiftChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                Selecciona un turno
                            </option>
                            <option value='First'>First</option>
                            <option value='Second'>Second</option>
                            <option value='Free'>Free</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor='date' className='block mb-2 text-sm font-medium text-gray-900'>
                            Fecha
                        </label>
                        <input
                            name='date'
                            type='date'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            onChange={handleDateChange}
                            value={selectedDate}
                        />
                    </div>
                </div>
                <div className='flex justify-end p-2 gap-4'>
                    <button
                        onClick={handleSave}
                        className='text-gray-900 bg-[#9ADD57] lg:text-sm hover:bg-[#9fe35b] focus:ring-4 focus:outline-none focus:ring-lime-300 font-medium rounded-lg text-sm px-5 py-2.5'
                    >
                        Guardar
                    </button>
                    <button
                        onClick={handleEditClick}
                        className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'
                    >
                        Editar
                    </button>
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
                                Orden de trabajo
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
                                Causa de Tiempo muerto (Str.)
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Estándar por hora
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Estándar propuesto
                            </th>
                            <th scope='col' className='px-6 py-3 bg-yellow-300'>
                                Causa de tiempo muerto (Tiempo)
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Producción
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Eficiencia
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {editableData.map((item, index) => (
                            <tr key={`${index}-${item.id}`} className='odd:bg-white even:bg-gray-50 border-b'>
                                <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                    {item.press}
                                </th>
                                <td className='px-6 py-4'>{item.employee_number}</td>
                                <td className='px-6 py-4'>{item.work_order}</td>
                                <td className='px-6 py-4'>{item.part_number}</td>
                                <td className='px-6 py-4' onDoubleClick={() => handleDoubleClick(index, 'cavities')}>
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
                                        <span>{item.cavities}</span>
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
                                        <span>{item.caliber}</span>
                                    )}
                                </td>
                                <td className='px-6 py-4' onDoubleClick={() => handleDoubleClick(index, 'worked_hrs')}>
                                    {item.editableField === 'worked_hrs' ? (
                                        <input
                                            type='text'
                                            value={item.worked_hrs || ''}
                                            onChange={e => handleChange(index, 'worked_hrs', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            autoFocus
                                        />
                                    ) : (
                                        <span>{item.worked_hrs}</span>
                                    )}
                                </td>
                                <td
                                    className='px-6 py-4 bg-yellow-300'
                                    onDoubleClick={() => handleDoubleClick(index, 'dead_time_cause_1')}
                                >
                                    {item.editableField === 'dead_time_cause_1' ? (
                                        <input
                                            type='text'
                                            value={item.dead_time_cause_1 || ''}
                                            onChange={e => handleChange(index, 'dead_time_cause_1', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className='bg-yellow-300 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            autoFocus
                                        />
                                    ) : (
                                        <span>{item.dead_time_cause_1}</span>
                                    )}
                                </td>
                                <td className='px-6 py-4'>{item.standard}</td>
                                <td
                                    className='px-6 py-4'
                                    onDoubleClick={() => handleDoubleClick(index, 'proposed_standard')}
                                >
                                    {item.editableField === 'proposed_standard' ? (
                                        <input
                                            type='text'
                                            value={item.proposed_standard}
                                            onChange={e => handleChange(index, 'proposed_standard', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            autoFocus
                                        />
                                    ) : (
                                        <span>{item.proposed_standard}</span>
                                    )}
                                </td>
                                <td
                                    className='px-6 py-4 bg-yellow-300'
                                    onDoubleClick={() => handleDoubleClick(index, 'dead_time_cause_2')}
                                >
                                    {item.editableField === 'dead_time_cause_2' ? (
                                        <input
                                            type='text'
                                            value={item.dead_time_cause_2 || ''}
                                            onChange={e => handleChange(index, 'dead_time_cause_2', e.target.value)}
                                            onBlur={() => handleBlur(index)}
                                            className='bg-yellow-300 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                            autoFocus
                                        />
                                    ) : (
                                        <span>{item.dead_time_cause_2}</span>
                                    )}
                                </td>
                                <td className='px-6 py-4'>{item.pieces_ok}</td>
                                <td className='px-6 py-4'>{`${item.efficiency}%`}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PressesRegisterProduction;
