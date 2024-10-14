import { FaPlus, FaSlackHash } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const PartNumMenu = () => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Números de parte</h1>
            </header>
            <section className='flex flex-row items-center justify-evenly h-full'>
                <div
                    className='flex flex-col w-14 items-center cursor-pointer'
                    onClick={() => navigate('/part_num_cataloge')}
                >
                    <div className=' bg-[#2459A9] p-2 rounded-sm'>
                        <FaSlackHash color='white' size={40} />
                    </div>
                    <h2 className=' text-center'>Existentes</h2>
                </div>
                <div
                    className='flex flex-col w-14 items-center cursor-pointer'
                    onClick={() => navigate('/part_num_creation')}
                >
                    <div className=' bg-[#538D4A] p-3 rounded-sm'>
                        <FaPlus color='white' size={35} />
                    </div>
                    <h2 className=' text-center '>Nuevo</h2>
                </div>
            </section>
        </div>
    );
};

export default PartNumMenu;
