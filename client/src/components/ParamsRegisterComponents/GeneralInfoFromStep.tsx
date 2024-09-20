import { useParamsFormContext } from '../../providers/ParamsRegisterProvider';

const GeneralInfoFromStep = () => {
    const [state, dispatch] = useParamsFormContext();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement> ) => {
        const { name, value } = e.target;
        dispatch({
            type: 'SET_INITIAL_VALUES',
            data: {
                ...state.initial,
                [name]: value,
            },
        });
    };


    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>
            <form className='space-y-6'>
                <h5 className='text-xl font-medium text-gray-900'>Valores generales</h5>
                <div>

                </div>
                <div>
                    <label htmlFor='turno' className='block mb-2 text-sm font-medium text-gray-900'>
                        Turno
                    </label>
                    <select
                        name='turno'
                        id='turno'
                        value={state.initial.turno}
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    >
                        <option value=''>Elige un turno</option>
                        <option value='1'>1</option>
                        <option value='2'>2</option>
                    </select>
                </div>
                {['MP','No. Parte', 'Auditor', 'Moldeador',].map(input => (
                    <div key={input}>
                        <label htmlFor={input} className='block mb-2 text-sm font-medium text-gray-900'>
                            {input}
                        </label>
                        <input
                            type='text'
                            id={input}
                            name={input}
                            value={state.initial.turno || ''}
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
                        checked={state.initial.icc || false}
                        onChange={handleChange}
                        className='sr-only peer'
                    />
                    <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    <span className='ms-3 text-sm font-medium text-gray-900'> ICC </span>
                </label>
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
