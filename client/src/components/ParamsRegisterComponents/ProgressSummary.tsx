import useFormStore from '../../stores/ParamsRegisterStore';
import {
    IccParamsRegister,
    InitParamsRegister,
    SecondParamsRegister,
    ThirdParamsRegister,
} from '../../types/ParamsRegisterTypes';
import api from '../../config/axiosConfig'; // Asegúrate de que la configuración de Axios esté correcta.

const ProgressSummary = () => {
    const { step, initParams, secondParams, iccParams, thirdParams } = useFormStore();

    const renderParams = <
        T extends InitParamsRegister | SecondParamsRegister | IccParamsRegister | ThirdParamsRegister,
    >(
        params: T,
        title: string,
    ) => {
        return (
            <div className='mb-4'>
                <h3 className='font-bold text-lg'>{title}</h3>
                <ul>
                    {Object.entries(params).map(([key, value]) => (
                        <li key={key} className='mb-2'>
                            <span className='font-semibold capitalize'>{key}: </span>
                            {typeof value === 'object' && value !== null ? (
                                <ul className='pl-4'>
                                    {Object.entries(value).map(([subKey, subValue]) => (
                                        <li key={subKey}>
                                            <span className='font-semibold capitalize'>{subKey}: </span>
                                            {String(subValue)}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <span>{value.toString()}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        );
    };

    const handleSubmit = async () => {
        try {
            // Enviar todos los parámetros a la base de datos
            const response = await api.post('/save-params', {
                initParams,
                secondParams,
                iccParams,
                thirdParams,
            });
            console.log('Datos enviados correctamente:', response.data);
            // Puedes mostrar una notificación de éxito o redirigir
        } catch (error) {
            console.error('Error enviando los datos:', error);
            // Manejar el error
        }
    };

    let content;
    switch (step) {
        case 1:
            content = renderParams(initParams, 'Initial Parameters');
            break;
        case 2:
            content = renderParams(secondParams, 'Second Parameters');
            break;
        case 3:
            content = initParams.icc
                ? iccParams && renderParams(iccParams, 'ICC Parameters')
                : thirdParams && renderParams(thirdParams, 'Third Parameters');
            break;
        case 4:
            content = (
                <>
                    {renderParams(initParams, 'Initial Parameters')}
                    {renderParams(secondParams, 'Second Parameters')}
                    {initParams.icc
                        ? iccParams && renderParams(iccParams, 'ICC Parameters')
                        : thirdParams && renderParams(thirdParams, 'Third Parameters')}
                    <button
                        onClick={handleSubmit}
                        className='mt-4 w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center'
                    >
                        Enviar
                    </button>
                </>
            );
            break;
        default:
            content = <div>No data available</div>;
            break;
    }

    return (
        <div className='p-4 bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8'>

            {content}
        </div>
    );
};

export default ProgressSummary;
