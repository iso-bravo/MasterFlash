import { ImCancelCircle } from 'react-icons/im';

interface TableData {
    compound: string;
    startDate: string;
    endDate: string;
    totalWeight: number;
}

interface CompoundsTableProps {
    tableData: TableData[];
    onRemoveCompound: (index: number) => void;
}

const CompoundsTable = ({tableData, onRemoveCompound}: CompoundsTableProps) => {

    return (
        <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                    <tr>
                        <th scope='col' className='px-6 py-3'>
                            Compuesto
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Fecha inicio
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Fecha fin
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            Peso lbs
                        </th>
                        <th scope='col' className='px-6 py-3'>
                            <span className='sr-only'>
                                <ImCancelCircle />
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {tableData.map((data, index) => (
                        <tr className='bg-white border-b' key={index}>
                            <th scope='row' className='px-6 py-4 font-medium text-gray-900 whitespace-nowrap'>
                                {data.compound}
                            </th>
                            <td className='px-6 py-4'>{data.startDate}</td>
                            <td className='px-6 py-4'>{data.endDate}</td>
                            <td className='px-6 py-4'>{data.totalWeight}</td>
                            <td className='px-6 py-4'>
                                <ImCancelCircle color='red' size={30} className='cursor-pointer' onClick={() =>onRemoveCompound(index)}/>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompoundsTable;
