import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import GeneralInfoFromStep from '../components/ParamsRegisterComponents/GeneralInfoFromStep';
import { useParamsFormContext } from '../providers/ParamsRegisterProvider';

const ParamsRegister = () => {
    const navigate = useNavigate();
    const [state, ] = useParamsFormContext();

    const { initial, percent } = state;

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
            <section>
                <GeneralInfoFromStep />
            </section>
            <section>
                <p>Porcentaje completado: {percent}%</p>
                <p>Datos iniciales: {initial.noParte}</p>
            </section>
        </div>
    );
};

export default ParamsRegister;
