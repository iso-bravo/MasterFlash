import { usePartNumForm } from '../../stores/PartNumsRegisterStore';
import AutoCompletePartNumForm from './AutoCompletePartNumForm';

const SelectPartNumForm: React.FC = () => {
    const { setSteps } = usePartNumForm();

    return (
        <div>
            <h3 className='font-bold text-lg text-center'>Crear desde 0 o a partir de uno existente</h3>
            <div className='flex flex-col justify-evenly m-2 space-y-4'>
                <AutoCompletePartNumForm />
                <button
                    className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    onClick={() => setSteps(1)}
                >
                    Desde 0
                </button>
            </div>
        </div>
    );
};

export default SelectPartNumForm;
