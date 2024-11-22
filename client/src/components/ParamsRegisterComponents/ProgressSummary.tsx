import useFormStore from '../../stores/ParamsRegisterStore';
import { InitParamsRegister, SecondParamsRegister, ThirdParamsRegister } from '../../types/ParamsRegisterTypes';
import api from '../../config/axiosConfig';
import { toast } from 'react-toastify';

const ProgressSummary = () => {
    const { step, initParams, secondParams, thirdParams, resetForm } = useFormStore();

    const renderParams = <T extends InitParamsRegister | SecondParamsRegister | ThirdParamsRegister>(
        params: T | undefined,
        title: string,
    ) => {
        if (!params) return null;

        return (
            <div className='mb-4'>
                <h3 className='font-bold text-lg'>{title}</h3>
                <ul>
                    {Object.entries(params).map(([key, value]) => (
                        <li key={key} className='mb-2'>
                            <span className='font-semibold capitalize'>{key}: </span>
                            {Array.isArray(value) ? (
                                <ul className='pl-4'>
                                    {value.map((subValue, index) => (
                                        <li key={index}>
                                            <span>{JSON.stringify(subValue)}</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : typeof value === 'object' && value !== null ? (
                                <ul className='pl-4'>
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <li key={subKey}>
                                            <span className='font-semibold capitalize'>{subKey}: </span>
                                            {String(subValue)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span>{value !== undefined && value !== null ? value.toString() : 'N/A'}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const handleSubmit = async () => {
        try {
            const response = await api.post('/save-params', {
                initParams,
                secondParams,
                thirdParams,
            });
            toast.success('Datos enviados correctamente.');
            console.log('Datos enviados correctamente:', response.data);
            resetForm();
        } catch (error) {
            console.error('Error enviando los datos:', error);
            toast.error('Ocurrió un error al enviar los datos.');
        }
    };

    const renderContent = () => {
        switch (step) {
            case 1:
                return renderParams(initParams, 'Datos de la máquina');
            case 2:
                return renderParams(secondParams, 'Parametros del molde');
            case 3:
                return renderParams(thirdParams, 'Parametros de calidad');
            case 4:
                return (
                    <>
                        {renderParams(initParams, 'Datos de la máquina')}
                        {renderParams(secondParams, 'Parametros del molde')}
                        {renderParams(thirdParams, 'Parametros de calidad')}
                        <button
                            onClick={handleSubmit}
                            className='mt-4 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                        >
                            Enviar
                        </button>
                    </>
                );
            default:
                return <div>No data available</div>;
        }
    };

    return <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>{renderContent()}</div>;
};

export default ProgressSummary;
