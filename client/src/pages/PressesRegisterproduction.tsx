import api from '../config/axiosConfig';
import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../App.css';
import '../index.css';
import '../output.css';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const PressesRegisterProduction: React.FC = () => {
    //TODO use types and fix the endpoints
    const [data, setData] = useState([]);
    const [editableData, setEditableData] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/data') // Ajusta la URL según sea necesario
            .then(response => {
                setData(response.data);
                setEditableData(response.data.map(item => ({ ...item, editable: false })));
            })
            .catch(error => console.error('Error fetching data:', error));
    }, []);

    const handleEditClick = index => {
        const newData = [...editableData];
        newData[index].editable = true;
        setEditableData(newData);
    };

    const handleSaveClick = index => {
        const newData = [...editableData];
        newData[index].editable = false;
        setEditableData(newData);
        // Aquí puedes enviar los datos al backend si es necesario
        // api.post('/save', newData[index])
        //     .then(response => toast.success('Data saved successfully'))
        //     .catch(error => toast.error('Error saving data'));
    };

    const handleChange = (index, field, value) => {
        const newData = [...editableData];
        newData[index][field] = value;
        setEditableData(newData);
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer />
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Registro Producción</h1>
            </header>

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
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {editableData.map((item, index) => (
                            <tr key={item.id} className='odd:bg-white even:bg-gray-50 border-b'>
                                <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                    {item.mp}
                                </th>
                                <td className='px-6 py-4'>{item.operador}</td>
                                <td className='px-6 py-4'>{item.parte}</td>
                                <td className='px-6 py-4'>
                                    {item.editable ? (
                                        <input
                                            type='text'
                                            value={item.cavidades}
                                            onChange={e => handleChange(index, 'cavidades', e.target.value)}
                                            className='w-full'
                                        />
                                    ) : (
                                        item.cavidades
                                    )}
                                </td>
                                <td className='px-6 py-4'>{item.calibre}</td>
                                <td className='px-6 py-4'>
                                    {item.editable ? (
                                        <input
                                            type='text'
                                            value={item.horas_trabajadas}
                                            onChange={e => handleChange(index, 'horas_trabajadas', e.target.value)}
                                            className='w-full'
                                        />
                                    ) : (
                                        item.horas_trabajadas
                                    )}
                                </td>
                                <td className='px-6 py-4 bg-yellow-300'>
                                    {item.editable ? (
                                        <input
                                            type='text'
                                            value={item.causa_tiempo_muerto}
                                            onChange={e => handleChange(index, 'causa_tiempo_muerto', e.target.value)}
                                            className='w-full'
                                        />
                                    ) : (
                                        item.causa_tiempo_muerto
                                    )}
                                </td>
                                <td className='px-6 py-4'>{item.estandar_por_hora}</td>
                                <td className='px-6 py-4'>
                                    {item.editable ? (
                                        <input
                                            type='text'
                                            value={item.estandar_propuesto}
                                            onChange={e => handleChange(index, 'estandar_propuesto', e.target.value)}
                                            className='w-full'
                                        />
                                    ) : (
                                        item.estandar_propuesto
                                    )}
                                </td>
                                <td className='px-6 py-4 bg-yellow-300'>
                                    {item.editable ? (
                                        <input
                                            type='text'
                                            value={item.causa_tiempo_muerto_propuesto}
                                            onChange={e =>
                                                handleChange(index, 'causa_tiempo_muerto_propuesto', e.target.value)
                                            }
                                            className='w-full'
                                        />
                                    ) : (
                                        item.causa_tiempo_muerto_propuesto
                                    )}
                                </td>
                                <td className='px-6 py-4'>{item.produccion}</td>
                                <td className='px-6 py-4'>{item.eficiencia}</td>
                                <td className='px-6 py-4'>
                                    {item.editable ? (
                                        <button onClick={() => handleSaveClick(index)} className='text-blue-500'>
                                            Save
                                        </button>
                                    ) : (
                                        <button onClick={() => handleEditClick(index)} className='text-blue-500'>
                                            Edit
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PressesRegisterProduction;
