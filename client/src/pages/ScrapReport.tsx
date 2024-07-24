import { useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';

interface InputFields {
    date: string,
    caliber: string
    insert: string | null
}

const ScrapReport: React.FC = () => {

    const [formData,setFormData] = useState<InputFields>({
        date: '',
        caliber: '',
        insert:null
    })

    const [showInsert,setShowInsert] = useState(false)


    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <ToastContainer/>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/reports_menu')} />
                <h1 className='text-xl'>Reportes</h1>
            </header>
            <div className='lg:flex justify-end gap-4 items-center grid md:grid-cols-5 md:grid-flow-row sm:grid-flow-col sm:grid-rows-2'>
                <div className='flex flex-row gap-2'>
                    <h2>Fecha</h2>
                    <input
                        name='date'
                        type='date'
                        value={formData.date}
                        onChange={e => handleChange(e, 'date')}
                        className='rounded-sm w-32 h-6'
                    />
                </div>
                
                <button
                    onClick={handleRegister}
                    className='px-3 py-2 bg-[#9ADD57] rounded-md md:ml-4 text-lg lg:text-sm hover:bg-[#8ddd3e]'
                >
                    <h2>Registrar</h2>
                </button>
            </div>
        </div>
    );
};

export default ScrapReport