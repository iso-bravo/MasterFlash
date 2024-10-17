import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import GeneralInfoFromStep from '../components/ParamsRegisterComponents/GeneralInfoFromStep';
import ProgressSummary from '../components/ParamsRegisterComponents/ProgressSummary';
import useFormStore from '../stores/ParamsRegisterStore';
import SecondPartFormStep from '../components/ParamsRegisterComponents/SecondPartFormStep';
import ThirdFormStep from '../components/ParamsRegisterComponents/ThirdFormStep';
import ProgressBar from '../components/ProgressBar';

const ParamsRegister = () => {
    const navigate = useNavigate();
    const { step, progress } = useFormStore();

    let formStep;
    switch (step) {
        case 1:
            formStep = <GeneralInfoFromStep />;
            break;

        case 2:
            formStep = <SecondPartFormStep />;
            break;
        case 3:
            formStep = <ThirdFormStep />;
            break;

        default:
            formStep = <></>;
            break;
    }

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
            <section className='flex flex-col md:flex-row gap-6'>
                {step != 4 ? (
                    <>
                        <div className='flex-1'>{formStep}</div>
                        <div className='flex-1 md:w-1/3'>
                            <ProgressBar progress={progress} />
                            <ProgressSummary />
                        </div>
                    </>
                ) : (
                    <div className='flex-1'>
                        <ProgressBar progress={progress} />
                        <ProgressSummary />
                    </div>
                )}
            </section>
        </div>
    );
};

export default ParamsRegister;
