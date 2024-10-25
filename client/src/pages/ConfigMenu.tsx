import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaRegClock } from 'react-icons/fa';



const ConfigMenu = () => {
    const navigate = useNavigate()

    return (
        <div className='min-h-screen flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Config Menu' />
            <section className='flex flex-row items-center justify-evenly h-full'>
                <div className='flex flex-col items-center justify-center'>
                    <div
                        className='flex flex-col w-14 items-center cursor-pointer'
                        onClick={() => navigate('/set_shift')}
                    >
                        <div className=' bg-[#538D4A] p-2 rounded-sm'>
                            <FaRegClock color='white' size={40} />
                        </div>
                        <h2 className=' text-center'>Turnos</h2>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ConfigMenu;
