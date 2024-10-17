import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { usePartNumForm } from '../stores/PartNumsRegisterStore';
import GeneralInfoForm from '../components/partNumMultiFormSteps/GeneralInfoForm';
import ProgressBar from '../components/ProgressBar';

const PartNumCreation = () => {
    const navigate = useNavigate();
    const { step, progress } = usePartNumForm();

    let formStep;
    switch (step) {
        case 1:
            formStep = <GeneralInfoForm />;
            break;

        default:
            formStep = <>nada</>;
            break;
    }

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
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
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/part_num')} />
                <h1 className='text-xl'>Nuevo Número de parte</h1>
            </header>
            <section className='flex flex-col md:flex-row gap-6 mt-4'>
                {step != 6 ? (
                    <>
                        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 flex-1'>
                            {formStep}
                        </div>
                        <div className='flex-1 md:w-1/3'>
                            <ProgressBar progress={progress} />
                        </div>
                    </>
                ) : (
                    <div className='flex-1'>
                        <ProgressBar progress={progress} />
                    </div>
                )}
            </section>
        </div>
    );
};

export default PartNumCreation;
