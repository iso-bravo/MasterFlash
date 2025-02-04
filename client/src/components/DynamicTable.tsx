import { useEffect, useState } from 'react';
import { ScrapData, TotalScrapData } from '../types/DashBoardTypes';

interface DynamicTableProps {
    incoming_data: TotalScrapData;
}

const DynamicTable: React.FC<DynamicTableProps> = ({ incoming_data }) => {
    const [columns, setColumns] = useState<(keyof ScrapData)[]>([]);

    const extractColumns = (data: ScrapData[]) => {
        if (!data || data.length === 0) return [];

        const allKeys = Array.from(new Set(data.flatMap(row => Object.keys(row)))) as (keyof ScrapData)[];

        // Removemos "total" y lo agregamos al final
        return [...allKeys.filter(key => key !== 'total'),'total' as keyof ScrapData];
    };

    useEffect(() => {
        const dynamicColumns = extractColumns(incoming_data.data);
        setColumns(dynamicColumns);
    }, [incoming_data]);

    return (
        <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-sm text-left text-gray-800'>
                <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                    <tr>
                        {columns.map(column => (
                            <th key={column as string} className='px-6 py-3'>
                                {column}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {incoming_data.data.map((row, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                            {columns.map(column => (
                                <td key={column as string} className='px-6 py-4'>
                                    {row[column] ?? '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                    <tr className='bg-gray-200 font-semibold'>
                        <td colSpan={columns.length - 1} className='px-6 py-4 text-right'>
                            General Total:
                        </td>
                        <td className='px-6 py-4'>{incoming_data.general_total}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;
