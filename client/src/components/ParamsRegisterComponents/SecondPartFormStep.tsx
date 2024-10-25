import { useEffect } from 'react';
import useFormStore from '../../stores/ParamsRegisterStore';
import api from '../../config/axiosConfig';
import { SecondParamsRegister, SectionType } from '../../types/ParamsRegisterTypes';
import { MdArrowBack } from 'react-icons/md';
import { toast } from 'react-toastify';

const SecondPartFormStep = () => {
    const { initParams, secondParams, setSecondParams, setSteps } = useFormStore();
    const options = Array.from({ length: 9 }, (_, i) => i + 1);
    const sectionTypes: SectionType[] = ['superior', 'inferior'];

    useEffect(() => {
        const fetchMold = async () => {
            try {
                const response = await api.get(`/get-mold/${initParams.partnum}`);
                const fetchedMold = response.data.mold;

                // Solo actualiza secondParams si el valor de mold ha cambiado
                if (secondParams.mold !== fetchedMold) {
                    setSecondParams({ ...secondParams, mold: fetchedMold });
                }
            } catch (error) {
                console.error('Error fetching mold:', error);
            }
        };

        // Llama a la función solo si partnum no está vacío
        if (initParams.partnum) {
            fetchMold();
        }
    }, [initParams.partnum, setSecondParams, secondParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        // Evitar números negativos
        const numericValue = Math.max(0, parseFloat(value));

        if (name.includes('-')) {
            const [field, section] = name.split('-');

            setSecondParams({
                ...secondParams,
                [field]: {
                    ...(secondParams[field as keyof SecondParamsRegister] as Record<SectionType, number>),
                    [section]: numericValue,
                },
            });
        } else {
            setSecondParams({
                ...secondParams,
                [name]: name === 'metal' || name === 'cavities' ? numericValue : value,
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Definir los campos requeridos
        const requiredFields = ['cavities', 'metal', 'body', 'strips', 'full_cycle', 'cycle_time', 'pressure'];
        const sectionFields = ['screen', 'mold2', 'platen'];

        // Validar campos sencillos
        const isSimpleFieldsValid = requiredFields.every(field => secondParams[field as keyof SecondParamsRegister]);

        // Validar los campos que tienen secciones (superior/inferior)
        const isSectionFieldsValid = sectionFields.every(field => {
            const sectionData = secondParams[field as keyof SecondParamsRegister];
            return sectionData && typeof sectionData === 'object'
                ? sectionTypes.every(section => (sectionData as Record<SectionType, number>)[section])
                : false;
        });

        if (!isSimpleFieldsValid || !isSectionFieldsValid) {
            toast.error('Por favor, completa todos los campos obligatorios.');
            return;
        }

        // Si todos los campos están completos, cambiar al siguiente paso
        setSteps(3);
    };

    const isFormValid =
        ['cavities', 'metal', 'body', 'strips', 'full_cycle', 'cycle_time', 'pressure'].every(
            field => secondParams[field as keyof SecondParamsRegister],
        ) &&
        ['screen', 'mold2', 'platen'].every(field => {
            const sectionData = secondParams[field as keyof SecondParamsRegister];
            return sectionData && typeof sectionData === 'object'
                ? sectionTypes.every(section => (sectionData as Record<SectionType, number>)[section])
                : false;
        });

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form className='space-y-6' onSubmit={handleSubmit}>
                <MdArrowBack size={30} onClick={() => setSteps(1)} className='cursor-pointer' />
                <h5 className='text-xl font-medium text-gray-900'>Segunda parte</h5>
                <div className='grid grid-cols-2 gap-4'>
                    <div>
                        <label htmlFor='cavities' className='block mb-2 text-sm font-medium text-gray-900'>
                            Cavidades
                        </label>
                        <select
                            name='cavities'
                            id='cavities'
                            value={secondParams.cavities}
                            onChange={handleChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            {options.map(number => (
                                <option key={number} value={number}>
                                    {number}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor='metal' className='block mb-2 text-sm font-medium text-gray-900'>
                            Metal
                        </label>
                        <select
                            name='metal'
                            id='metal'
                            value={secondParams.metal}
                            onChange={handleChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        >
                            <option value='' disabled>
                                Seleccione una opción
                            </option>
                            <option value='0.025'>0.025</option>
                            <option value='0.032'>0.032</option>
                            <option value='0.040'>0.040</option>
                        </select>
                    </div>
                    {['body', 'strips', 'full_cycle', 'cycle_time'].map(input => {
                        const value = secondParams[input as keyof SecondParamsRegister];

                        const isStringOrNumber = typeof value === 'string' || typeof value === 'number';

                        return (
                            <div key={input}>
                                <label htmlFor={input} className='block mb-2 text-sm font-medium text-gray-900'>
                                    {input}
                                </label>
                                <input
                                    type='number'
                                    id={input}
                                    name={input}
                                    step='0.01'
                                    min={0}
                                    value={isStringOrNumber ? value : ''}
                                    onChange={handleChange}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                            </div>
                        );
                    })}
                    <div className='col-span-2'>
                        <div className='flex justify-between'>
                            {['screen', 'mold2', 'platen'].map(type => {
                                const sectionData = secondParams[type as keyof SecondParamsRegister];
                                if (typeof sectionData === 'object') {
                                    return (
                                        <div key={type} className='text-center flex-1 p-1'>
                                            <label className='block mb-2 text-sm font-medium text-gray-900'>
                                                {type}
                                            </label>
                                            {sectionTypes.map(section => (
                                                <div key={section} className='mb-2'>
                                                    <label
                                                        htmlFor={`${type}-${section.toLowerCase()}`}
                                                        className='block mb-1 text-xs text-gray-700'
                                                    >
                                                        {section}
                                                    </label>
                                                    <input
                                                        type='number'
                                                        step='0.01'
                                                        id={`${type}-${section.toLowerCase()}`}
                                                        name={`${type}-${section.toLowerCase()}`}
                                                        min={0}
                                                        value={sectionData[section as SectionType] ?? 0}
                                                        onChange={handleChange}
                                                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5'
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    );
                                }
                                return null;
                            })}
                        </div>
                    </div>
                    <div>
                        <label htmlFor='pressure' className='block mb-2 text-sm font-medium text-gray-900'>
                            Presión(psi)
                        </label>
                        <input
                            type='number'
                            name='pressure'
                            id='pressure'
                            step='0.01'
                            min={0}
                            value={secondParams.pressure || ''}
                            onChange={handleChange}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                        />
                    </div>
                </div>
                <button
                    type='submit'
                    className={`w-full text-white ${
                        isFormValid ? 'bg-blue-700 hover:bg-blue-800' : 'bg-gray-300 cursor-not-allowed'
                    } focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center`}
                    disabled={!isFormValid}
                >
                    Siguiente
                </button>
            </form>
        </div>
    );
};

export default SecondPartFormStep;
