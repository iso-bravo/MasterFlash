import { useEffect, useState } from 'react';
import useFormStore from '../../stores/ParamsRegisterStore';
import api from '../../config/axiosConfig';

const GeneralInfoFromStep = () => {
    const { initParams, setInitParams, setSteps } = useFormStore();

    const [machines, setMachines] = useState<string[]>();

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await api.get('/load_scrap_data/');
                setMachines(response.data);
            } catch (error) {
                console.error('Error fetching machines:', error);
            }
        };

        fetchMachines();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setInitParams({
            ...initParams,
            [name]: inputValue,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Cambiar al siguiente paso
        setSteps(2);
    };

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form className='space-y-6' onSubmit={handleSubmit}>
                <h5 className='text-xl font-medium text-gray-900'>Valores generales</h5>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='mp' className='block mb-2 text-sm font-medium text-gray-900'>
                            MP
                        </label>
                        <select
                            id='mp'
                            name='mp'
                            value={initParams.mp}
                            onChange={handleChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                Selecciona una opción
                            </option>
                            {machines?.map((machine, index) => (
                                <option key={index} value={machine}>
                                    {machine}
                                </option>
                            )) || (
                                <option value='' disabled>
                                    Cargando máquinas...
                                </option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label htmlFor='turno' className='block mb-2 text-sm font-medium text-gray-900'>
                            Turno
                        </label>
                        <select
                            name='turn'
                            id='turno'
                            value={initParams.turn}
                            onChange={handleChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value=''>Elige un turno</option>
                            <option value='1'>1</option>
                            <option value='2'>2</option>
                        </select>
                    </div>
                    {['partnum', 'auditor', 'molder'].map(input => (
                        <div key={input}>
                            <label htmlFor={input} className='block mb-2 text-sm font-medium text-gray-900'>
                                {input}
                            </label>
                            <input
                                type='text'
                                id={input}
                                name={input}
                                value={String(initParams[input as keyof typeof initParams] || '')}
                                onChange={handleChange}
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            />
                        </div>
                    ))}
                    <label className='inline-flex items-center cursor-pointer'>
                        <input
                            type='checkbox'
                            name='icc'
                            id='icc'
                            checked={initParams.icc || false}
                            onChange={handleChange}
                            className='sr-only peer'
                        />
                        <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className='ms-3 text-sm font-medium text-gray-900'> ICC </span>
                    </label>
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

export default GeneralInfoFromStep;
