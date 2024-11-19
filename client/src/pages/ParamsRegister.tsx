import { ToastContainer } from 'react-toastify';
import GeneralInfoFromStep from '../components/ParamsRegisterComponents/GeneralInfoFromStep';
import ProgressSummary from '../components/ParamsRegisterComponents/ProgressSummary';
import useFormStore from '../stores/ParamsRegisterStore';
import SecondPartFormStep from '../components/ParamsRegisterComponents/SecondPartFormStep';
import ThirdFormStep from '../components/ParamsRegisterComponents/ThirdFormStep';
import ProgressBar from '../components/ProgressBar';
import { MdArrowBack } from 'react-icons/md';
import Header from '../components/Header';

const ParamsRegister = () => {
    const { step, setSteps, progress, initParams, secondParams, thirdParams, iccParams } = useFormStore();

    let formStep;
    switch (step) {
        case 1:
            formStep = <GeneralInfoFromStep />;
            console.log('init params: ', initParams);
            break;

        case 2:
            formStep = <SecondPartFormStep />;
            console.log('init params: ', initParams);
            console.log('second Part: ', secondParams);
            break;
        case 3:
            formStep = <ThirdFormStep />;
            console.log('ICC: ', iccParams);
            console.log('Third part: ', thirdParams);
            break;

        case 4:
            formStep = <ProgressSummary />;
            break;

        default:
            formStep = <>nada</>;
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
            <Header title='Reg. Params.' />
            <section className='flex flex-col gap-6 mt-4 overflow-auto'>
                <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 flex-1'>
                    {step > 1 && (
                        <MdArrowBack size={30} onClick={() => setSteps(step - 1)} className='cursor-pointer' />
                    )}
                    <ProgressBar progress={progress} />
                    {formStep}
                </div>
            </section>
        </div>
    );
};

export default ParamsRegister;
