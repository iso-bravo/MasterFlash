import { toast, ToastContainer } from 'react-toastify';
import Header from '../components/Header';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { TbEyeClosed, TbEye } from 'react-icons/tb';

interface EmailConfigs {
    email: string;
    password: string;
    recipients: string[];
    smtp_host: string;
    smtp_port: number;
    use_tls: boolean;
}

const EmailConfig = () => {
    const { register, handleSubmit, setValue } = useForm<EmailConfigs>();
    const [recipients, setRecipients] = useState<string[]>([]);
    const [newRecipient, setNewRecipient] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await api.get('/email_config/');
                if (response.data) {
                    const data = response.data;
                    setValue('email', data.sender_email || '');
                    setValue('smtp_host', data.smtp_host || 'smtp.gmail.com');
                    setValue('smtp_port', data.smtp_port || 587);
                    setValue('use_tls', data.use_tls || true);
                    setRecipients(data.recipients || []);
                } else {
                    toast.error('No se pudo cargar la configuración de correo.');
                }
            } catch (error) {
                toast.error(`Error al obtener la configuración ${error}`);
            }
        };

        fetchConfig();
    }, [setValue]);

    const handleAddRecipient = () => {
        if (newRecipient && !recipients.includes(newRecipient)) {
            setRecipients([...recipients, newRecipient]);
            setNewRecipient('');
        } else {
            toast.error('El destinatario ya existe o está vacío.');
        }
    };

    const onSubmit = async (data: EmailConfigs) => {
        const payload = { ...data, recipients };

        try {
            const response = await api.post('/email_config/', payload);
            if (response.status === 200 || response.status === 201) {
                toast.success('Configuración guardada exitosamente.');
            } else {
                toast.error('No se pudo guardar la configuración.');
            }
        } catch (error) {
            toast.error(`Error al guardar la configuración`);
            console.error(error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(prevState => !prevState);
    };

    return (
        <div className='min-h-screen flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer
                position='top-center'
                stacked
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme='colored'
            />
            <Header title='Email Config' goto='/config' />
            <section className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 mt-4'>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Correo remitente</label>
                        <input
                            {...register('email', { required: 'Este campo es obligatorio.' })}
                            type='email'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            placeholder='example@gmail.com'
                        />
                    </div>
                    <div className='relative'>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Contraseña del remitente</label>
                        <input
                            {...register('password', { required: 'Este campo es obligatorio.' })}
                            type={showPassword ? 'text' : 'password'}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            placeholder='********'
                        />
                        <button
                            type='button'
                            onClick={togglePasswordVisibility}
                            className='absolute right-3 top-9 text-gray-500'
                        >
                            {showPassword ? <TbEye size={20} /> : <TbEyeClosed size={20} />}
                        </button>
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>SMTP Host</label>
                        <input
                            {...register('smtp_host', { required: 'Este campo es obligatorio.' })}
                            type='text'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            placeholder='smtp.gmail.com'
                        />
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>SMTP Port</label>
                        <input
                            {...register('smtp_port', { required: 'Este campo es obligatorio.', valueAsNumber: true })}
                            type='number'
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                            placeholder='587'
                        />
                    </div>
                    <div>
                        <label className='block mb-2 text-sm font-medium text-gray-900'>Usar TLS</label>
                        <input
                            {...register('use_tls')}
                            type='checkbox'
                            className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Destinatarios</label>
                        <ul className='list-disc pl-5'>
                            {recipients.map((recipient, index) => (
                                <li key={index} className='flex justify-between'>
                                    <span>{recipient}</span>
                                    <button
                                        type='button'
                                        onClick={() => setRecipients(prev => prev.filter((_, i) => i !== index))}
                                        className='text-red-500 text-sm'
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <div className='flex items-center mt-2'>
                            <input
                                type='email'
                                value={newRecipient}
                                onChange={e => setNewRecipient(e.target.value)}
                                className='mr-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                                placeholder='Nuevo destinatario'
                            />
                            <button
                                type='button'
                                onClick={handleAddRecipient}
                                className='py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100'
                            >
                                Añadir
                            </button>
                        </div>
                    </div>
                    <button
                        type='submit'
                        className='focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 w-full'
                    >
                        Guardar Configuración
                    </button>
                </form>
            </section>
        </div>
    );
};

export default EmailConfig;
