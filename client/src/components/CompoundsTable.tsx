import { ImCancelCircle } from 'react-icons/im';

interface TableData {
    compound: string;
    startDate: string;
    endDate: string;
    totalWeight: number;
    comments?: string
}

interface CompoundsTableProps {
    tableData: TableData[];
    onRemoveCompound: (index: number) => void;
    onCommentChange: (index: number, comment: string) => void;
}

const CompoundsTable = ({ tableData, onRemoveCompound, onCommentChange }: CompoundsTableProps) => {
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
                        <th>Comentarios</th>
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
                                <input
                                    type='text'
                                    name='comments'
                                    value={data.comments || ''}
                                    onChange={e => onCommentChange(index, e.target.value)}
                                    className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                />
                            </td>
                            <td className='px-6 py-4'>
                                <ImCancelCircle
                                    color='red'
                                    size={30}
                                    className='cursor-pointer'
                                    onClick={() => onRemoveCompound(index)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CompoundsTable;
