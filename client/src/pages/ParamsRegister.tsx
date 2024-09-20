import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import GeneralInfoFromStep from '../components/ParamsRegisterComponents/GeneralInfoFromStep';
import ProgressBar from '../components/ParamsRegisterComponents/ProgressBar';

const ParamsRegister = () => {
    const navigate = useNavigate();


    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] min-h-screen'>
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
            <header className='flex items-start gap-3 mb-20'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Reg. Params.</h1>
            </header>
            <section className='m-5 '>
                <ProgressBar />
            </section>
            <section>
                <GeneralInfoFromStep />
            </section>
            <section>

            </section>
        </div>
    );
};

export default ParamsRegister;
