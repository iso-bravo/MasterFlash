import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate,useLocation } from 'react-router-dom';

const EditProductionRecords = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const date = params.get('date');
    const shift = params.get('shift');
    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-scree'>
            <header className='flex items-start gap-3 mb-4'>
                <IoIosArrowBack
                    size={30}
                    className='cursor-pointer'
                    onClick={() => navigate('/presses_register_production')}
                />
                <h1 className='text-xl'>{`Editar registros del turno ${shift} en la fecha ${date} `}</h1>
            </header>
        </div>
    );
};

export default EditProductionRecords;
