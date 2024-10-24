import { ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import { SubmitHandler, useForm } from 'react-hook-form';

type ShiftConfigFormValues = {
    firstShiftStart: string;
    firstShiftEnd: string;
    secondShiftStart: string;
    secondShiftEnd: string;
};

const ShiftConfig = () => {
    const { register, handleSubmit } = useForm<ShiftConfigFormValues>();

    const onSubmit: SubmitHandler<ShiftConfigFormValues> = data => {
        console.log(data);
    };

    return (
        <div className='min-h-screen flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
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
            <Header title='Horarios' goto='/config' />
            <section className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6 max-w-md mx-auto'>
                    <div>
                        <h2>Primer Turno</h2>
                        <div className='relative z-0 w-full mb-5 group mt-5'>
                            <input
                                type='time'
                                id='firstShiftStart'
                                {...register('firstShiftStart')}
                                className='block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                            />
                            <label
                                htmlFor='firstShiftStart'
                                className='peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                            >
                                Hora de Inicio
                            </label>
                        </div>
                        <div className='relative z-0 w-full mb-5 group'>
                            <input
                                type='time'
                                id='firstShiftEnd'
                                {...register('firstShiftEnd')}
                                className='block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                            />
                            <label
                                htmlFor='firstShiftEnd'
                                className='peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                            >
                                Hora Fin
                            </label>
                        </div>
                    </div>
                    <div>
                        <h2>Segundo Turno</h2>
                        <div className='relative z-0 w-full mb-5 group mt-5'>
                            <input
                                type='time'
                                id='secondShiftStart'
                                {...register('secondShiftStart')}
                                className='block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                            />
                            <label
                                htmlFor='secondShiftStart'
                                className='peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                            >
                                Hora de Inicio
                            </label>
                        </div>
                        <div className='relative z-0 w-full mb-5 group'>
                            <input
                                type='time'
                                id='secondShiftEnd'
                                {...register('secondShiftEnd')}
                                className='block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer'
                            />
                            <label
                                htmlFor='secondShiftEnd'
                                className='peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6'
                            >
                                Hora Fin
                            </label>
                        </div>
                    </div>
                    <button
                        type='submit'
                        className='text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2'
                    >
                        Confirmar
                    </button>
                </form>
            </section>
        </div>
    );
};

export default ShiftConfig;
