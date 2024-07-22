const PressesRegisterTable: React.FC = () => {
    return (
        <div className='relative overflow-x-auto rounded-sm'>
            <table className='w-full text-sm text-left text-gray-500'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                    <tr>
                        <th scope='col' className='px-6 py-3 '>
                            # MP
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            No.Operador
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            No.Parte
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Cavidades
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Calibre
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Hrs Trabajadas
                        </th>
                        <th scope='col' className='px-6 py-3 bg-yellow-300'>
                            Causa de Tiempo muerto
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Estándar por hora
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Estándar propuesto
                        </th>
                        <th scope='col' className='px-6 py-3 bg-yellow-300'>
                            Causa de tiempo muerto
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Producción
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Eficiencia
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr className='bg-white border-b'>
                        <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                            linea 3
                        </th>
                        <td className='px-6 py-4'>3077</td>
                        <td className='px-6 py-4'>RD201BA</td>
                        <td className='px-6 py-4'>9</td>
                        <td className='px-6 py-4'>0.025</td>
                        <td className='px-6 py-4'>8.6</td>
                        <td className='px-6 py-4'> </td>
                        <td className='px-6 py-4'>130</td>
                        <td className='px-6 py-4'>130</td>
                        <td className='px-6 py-4'> </td>
                        <td className='px-6 py-4'>915</td>
                        <td className='px-6 py-4'>28.62%</td>

                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PressesRegisterTable;
