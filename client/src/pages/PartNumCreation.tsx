import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { usePartNumForm } from '../stores/PartNumsRegisterStore';
import GeneralInfoForm from '../components/partNumMultiFormSteps/GeneralInfoForm';
import PalletAssemblyForm from '../components/partNumMultiFormSteps/PalletAssemblyForm';
import PaintScrapForm from '../components/partNumMultiFormSteps/PaintScrapForm';
import LabelsCavitiesForm from '../components/partNumMultiFormSteps/LabelsCavitiesForm';
import ImagesOthersForm from '../components/partNumMultiFormSteps/ImagesOthersForm';
import InputFormSummary from '../components/partNumMultiFormSteps/InputFormSummary'; // Importar el resumen
import ProgressBar from '../components/ProgressBar';
import SelectPartNumForm from '../components/partNumMultiFormSteps/SelectPartNumForm';
import { MdArrowBack } from 'react-icons/md';

const PartNumCreation = () => {
    const navigate = useNavigate();
    const { setSteps, step, progress } = usePartNumForm();

    let formStep;
    switch (step) {
        case 0:
            formStep = <SelectPartNumForm />;
            break;
        case 1:
            formStep = <GeneralInfoForm />;
            break;
        case 2:
            formStep = <PalletAssemblyForm />;
            break;
        case 3:
            formStep = <PaintScrapForm />;
            break;
        case 4:
            formStep = <LabelsCavitiesForm />;
            break;
        case 5:
            formStep = <ImagesOthersForm />;
            break;
        case 6:
            formStep = <InputFormSummary />;
            break;
        default:
            formStep = <>nada</>;
            break;
    }

    return (
        <div className='min-h-screen flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
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
            <section className='flex flex-col gap-6 mt-4 overflow-auto'>
                <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 flex-1'>
                    {step > 0 && (
                        <MdArrowBack size={30} onClick={() => setSteps(step - 1)} className='cursor-pointer' />
                    )}
                    <ProgressBar progress={progress} />
                    {formStep}
                </div>
            </section>
        </div>
    );
};

export default PartNumCreation;
