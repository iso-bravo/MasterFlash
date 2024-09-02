import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';



const RubberReport = () => {
    const navigate = useNavigate();

    

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
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
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/reports_menu')} />
                <h1 className='text-xl'>Reportes</h1>
            </header>
            <form
                action=''
                className='lg:flex justify-end gap-4 items-center grid md:flex  sm:grid-flow-col sm:grid sm:grid-rows-2'
            >
                <div>
                    <label htmlFor='start_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Inicio
                    </label>
                    <input
                        name='start_date'
                        type='date'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label htmlFor='end_date' className='block mb-2 text-sm font-medium text-gray-900'>
                        Fecha Fin
                    </label>
                    <input
                        name='end_date'
                        type='date'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                    />
                </div>
                <div>
                    <label htmlFor='shifts select' className='block mb-2 text-sm font-medium text-gray-900'>
                        Turno
                    </label>
                    <select
                        name='shifts select'
                        defaultValue=''
                        id='shifts'
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
                <button className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5'>
                    Buscar
                </button>
            </form>
            <div>

            </div>
        </div>
    );
};

export default RubberReport;
