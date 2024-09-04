import Scrap from '../assets/scrap.png';
import { IoIosArrowBack } from 'react-icons/io';
import { SiRoundcube } from 'react-icons/si';
import { useNavigate } from 'react-router-dom';

const ReportsMenu: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Reportes</h1>
            </header>

            <section className='flex flex-row items-center justify-evenly h-full'>
                <div className='flex flex-col items-center justify-center'>
                    <div
                        className='flex flex-col w-14 items-center cursor-pointer'
                        onClick={() => navigate('/scrap_report')}
                    >
                        <div className=' bg-[#6A3A90] p-2 rounded-sm'>
                            <img src={Scrap} className=' w-10'></img>
                        </div>
                        <h2 className=' text-center'>Insertos</h2>
                    </div>
                </div>

                <div className='flex flex-col items-center justify-center'>
                    <div
                        className='flex flex-col w-14 items-center cursor-pointer'
                        onClick={() => navigate('/rubber_report')}
                    >
                        <div className=' bg-[#2459A9] p-2 rounded-sm'>
                            <SiRoundcube color='white' size={40} />
                        </div>
                        <h2 className=' text-center'>Hule</h2>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReportsMenu;
