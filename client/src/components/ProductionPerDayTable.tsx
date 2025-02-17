import { ProductionPerDay } from '../types/PressProductionTypes';

interface ProductionPerDayTableProps {
    data: ProductionPerDay[];
}

const ProductionPerDayTable: React.FC<ProductionPerDayTableProps> = ({ data }) => {
    return (
        <div className='relative overflow-x-auto rounded-md'>
            <table className='min-w-full divide-y divide-gray-200 shadow-sm rounded-lg overflow-hidden'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50 '>
                    <tr>
                        <th scope='col' className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                            Número de parte
                        </th>
                        <th scope='col' className='px-4 py-3 text-left text-sm font-medium text-gray-700'>
                            Piezas producidas
                        </th>
                    </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                    {data.map(item => (
                        <tr key={item.part_number} className='odd:bg-white even:bg-gray-50 border-b border-gray-200'>
                            <td className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                {item.part_number}
                            </td>
                            <td className='px-6 py-4'>{item.total_pieces_ok}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ProductionPerDayTable;
