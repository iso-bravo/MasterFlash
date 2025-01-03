import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import Header from './Header';
import { ParamsType } from '../types/ParamsRegisterTypes';
import toast from 'react-hot-toast';

interface paramProps {
    id: number;
}

const IndividualParam: React.FC<paramProps> = ({ id }) => {
    const [param, setParam] = useState<ParamsType | null> (null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch_param_by_id = async () => {
            setLoading(true);
            try {
                const response = await api.get(`/get_params_by_id/${id}`);
                setParam(response.data);
            } catch (error) {
                toast.error('Error al obtener los datos.');
                console.error('Error al obtener los datos:', error);
            } finally {
                setLoading(false);
            }
        };
        fetch_param_by_id();
    }, [id]);

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] min-h-screen'>
            <Header title={`Param ${id}`} goto='/params' />
            {loading ? (
                <div className='flex justify-center items-center h-full'>
                    <p className='text-gray-700 text-xl'>Cargando datos...</p>
                </div>
            ) : param ? (
                <div className='mt-4'>
                    <div className='font-sans leading-relaxed text-gray-800 p-4'>
                        <header className='text-center mb-8'>
                            <h1 className='text-2xl font-bold'>Registro de Parámetros</h1>
                        </header>
                        <main>
                            {/* Información General */}
                            <section className='mb-8'>
                                <h3 className='text-lg font-semibold mb-2'>Información General</h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                    {Object.entries(param.general_info).map(([key, value], index) => (
                                        <div key={index} className='border p-4 rounded shadow-sm'>
                                            <strong className='block mb-1'>{key}:</strong>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Parámetros */}
                            <section className='mb-8'>
                                <h3 className='text-lg font-semibold mb-2'>Parámetros</h3>
                                <table className='table-auto w-full border-collapse border border-gray-300'>
                                    <tbody>
                                        {Object.entries(param.parameters).map(([key, value], index) => (
                                            <tr key={index} className='even:bg-gray-100'>
                                                <td className='border px-4 py-2 font-medium text-center bg-gray-200'>
                                                    {key}
                                                </td>
                                                <td className='border px-4 py-2 text-center'>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>

                            {/* Temperatura */}
                            <section className='mb-8'>
                                <h3 className='text-lg font-semibold mb-2'>Temperatura</h3>
                                <table className='table-auto w-full border-collapse border border-gray-300'>
                                    <thead>
                                        <tr>
                                            {param.temperature.labels.map((label, index) => (
                                                <th key={index} className='border px-4 py-2 text-center bg-gray-200'>
                                                    {label}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            {param.temperature.values.map((value, index) => (
                                                <td key={index} className='border px-4 py-2 text-center'>
                                                    {value}
                                                </td>
                                            ))}
                                        </tr>
                                    </tbody>
                                </table>
                            </section>

                            {/* Toma de muestras */}
                            <section className='mb-8'>
                                <h3 className='text-lg font-semibold mb-2'>Toma de muestras</h3>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                    {Object.entries(param.batch_info).map(([key, value], index) => (
                                        <div key={index} className='border p-4 rounded shadow-sm'>
                                            <strong className='block mb-1'>{key}:</strong>
                                            <span>{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Cavidades */}
                            <section>
                                <table className='table-auto w-full border-collapse border border-gray-300'>
                                    <thead>
                                        <tr className='bg-gray-200'>
                                            <th className='border px-4 py-2 text-center'>Cavidad</th>
                                            {Array.from({ length: param.cavities_arr[0].length }, (_, i) => (
                                                <th key={i} className='border px-4 py-2 text-center'>
                                                    Valor {i + 1}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {param.cavities_arr.map((row, index) => (
                                            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                                                <td className='border px-4 py-2 text-center'>{index + 1}</td>
                                                {row.map((item, idx) => (
                                                    <td key={idx} className='border px-4 py-2 text-center'>
                                                        {item}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </section>
                        </main>
                    </div>
                </div>
            ) : (
                <div className='flex justify-center items-center h-full'>
                    <p className='text-red-500 text-xl'>No se encontraron datos.</p>
                </div>
            )}
        </div>
    );
};

export default IndividualParam;
