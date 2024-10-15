import { IoIosArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";

    const PartNumCreation = () => {
        const navigate = useNavigate();


    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/part_num')} />
                <h1 className='text-xl'>Nuevo Número de parte</h1>
            </header>
        </div>
    );
};

export default PartNumCreation;
