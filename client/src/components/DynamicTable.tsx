import { useEffect, useState } from 'react';

interface scrapData {
    molder_number: string;
    CS?: number;
    CROP?: number;
    DP?: number;
    DI?: number;
    F?: number;
    FC?: number;
    FPO?: number;
    GA?: number;
    GM?: number;
    H?: number;
    IM?: number;
    IMC?: number;
    IR: number;
    M?: number;
    MR?: number;
    R?: number;
    SG?: number;
    SI?: number;
}

interface DynamicTableProps {
    data: scrapData[];
}

const DynamicTable: React.FC<DynamicTableProps> = ({ data }) => {
    const [columns, setColumns] = useState<(keyof scrapData)[]>([]);

    const extractColumns = (data: scrapData[]) => {
        if (!data || data.length === 0) return [];

        const allKeys = Array.from(new Set(data.flatMap(row => Object.keys(row)))) as (keyof scrapData)[];

        return allKeys.filter(key => data.some(row => row[key] != null));
    };

    useEffect(() => {
        const dynamicColumns = extractColumns(data);
        setColumns(dynamicColumns);
    }, [data]);

    return (
        <div className='relative overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-sm text-left text-gray-500'>
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
                    {data.map((row, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                            {columns.map(column => (
                                <td key={column as string} className='px-6 py-4'>
                                    {row[column] ?? '-'}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DynamicTable;
