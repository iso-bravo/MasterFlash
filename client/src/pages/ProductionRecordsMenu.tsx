import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from 'react-icons/io';
import Barwell from '../assets/conveyor.png';
import Troquelado from '../assets/worker.png';
import { VscGitPullRequestCreate } from 'react-icons/vsc';

const ProductionRecordsMenu = () => {

    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Registro Producción</h1>
            </header>
            <div className='flex justify-center items-center'>
                <div
                    className='flex flex-col w-14 items-center cursor-pointer'
                    onClick={() => navigate('/presses_production')}
                >
                    <div className=' bg-[#C67C38] p-2 rounded-sm'>
                        <VscGitPullRequestCreate color='white' size={40} className='' />
                    </div>
                    <h2 className=' text-center'>Prod. Prensas</h2>
                </div>
                <div className='flex flex-col items-center cursor-pointer'>
                    <div className=' bg-[#6A3A90] p-2 rounded-sm'>
                        <img src={Barwell} className=' w-10'></img>
                    </div>
                    <h2 className=' text-center'>Barwell</h2>
                </div>
                <div className='flex flex-col items-center cursor-pointer'>
                    <div className=' bg-[#8F2C2C] p-2 rounded-sm'>
                        <img src={Troquelado} className=' w-10'></img>
                    </div>
                    <h2 className=' text-center'>Troquelado</h2>
                </div>
            </div>
        </div>
    );
};

export default ProductionRecordsMenu;
