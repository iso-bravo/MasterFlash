import { FaPlus, FaTruckLoading } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const RubberReportsMenu = () => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/reports_menu')} />
                <h1 className='text-xl'>Reportes Hule</h1>
            </header>
            <section className='flex flex-row items-center justify-evenly h-full'>
                <div
                    className='flex flex-col w-14 items-center cursor-pointer'
                    onClick={() => navigate('/rubber_history')}
                >
                    <div className=' bg-[#78A5B4] p-2 rounded-sm'>
                        <FaTruckLoading color='white' size={40} />
                    </div>
                    <h2 className=' text-center'>Envios a Almacén</h2>
                </div>
                <div
                    className='flex flex-col w-14 items-center cursor-pointer'
                    onClick={() => navigate('/rubber_report')}
                >
                    <div className=' bg-[#B75182] p-3 rounded-sm'>
                        <FaPlus color='white' size={35} />
                    </div>
                    <h2 className=' text-center '>Nuevo Reporte</h2>
                </div>
            </section>
        </div>
    );
};

export default RubberReportsMenu;
