import React, { useEffect, useState } from 'react';
import api from '../config/axiosConfig';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';

interface TableData {
    id: number;
    press: string;
    employee_number: number;
    part_number: string;
    work_order: string;
    hour: string;
    pieces_ok: number;
    editableField?: keyof TableData;
}

interface GroupedData {
    [key: string]: {
        items: TableData[];
        press: string;
        work_order: string;
        part_number: string;
    };
}

const EditProductionRecords = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const date = params.get('date');
    const shift = params.get('shift');
    const navigate = useNavigate();

    const [groupedData, setGroupedData] = useState<GroupedData>({});
    const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.post(
                    '/get_production_press_by_date/',
                    { date: date, shift: shift },
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    },
                );

                console.log(response);
                const responseData: TableData[] = response.data;
                const grouped = groupData(responseData);
                setGroupedData(grouped);
                setExpandedGroups(Object.keys(grouped).reduce((acc, key) => ({ ...acc, [key]: false }), {}));
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };

        fetchData();
    }, [date, shift]);

    const groupData = (data: TableData[]): GroupedData => {
        const grouped = data.reduce((acc, item) => {
            const key = `${item.press}_${item.work_order}_${item.part_number}`;

            if (!acc[key]) {
                acc[key] = {
                    items: [],
                    press: item.press,
                    work_order: item.work_order,
                    part_number: item.part_number,
                };
            }

            acc[key].items.push(item);
            return acc;
        }, {} as GroupedData);

        // Ordenar por el número de prensa
        const sortedGrouped = Object.keys(grouped)
            .sort((a, b) => {
                const pressA = grouped[a].press;
                const pressB = grouped[b].press;
                return pressA.localeCompare(pressB, undefined, { numeric: true });
            })
            .reduce((acc, key) => {
                acc[key] = grouped[key];
                return acc;
            }, {} as GroupedData);

        return sortedGrouped;
    };

    const toggleGroup = (press: string) => {
        setExpandedGroups(prev => ({ ...prev, [press]: !prev[press] }));
    };

    const handleDoubleClick = (groupKey:string,index:number,field:keyof TableData) =>{
        const newGroupedData ={...groupedData}
        newGroupedData[groupKey].items[index]= {
            ...newGroupedData[groupKey].items[index],
            editableField: field,
        };
        setGroupedData(newGroupedData);
    }

    const handleBlur = (groupKey:string,index:number)=>{
        const newGroupedData = { ...groupedData };
        newGroupedData[groupKey].items[index] = {
            ...newGroupedData[groupKey].items[index],
            editableField: undefined,
        };
        setGroupedData(newGroupedData);
    }

    const handleChange = (groupKey: string, index: number, field: keyof TableData, value: string | number) => {
        const newGroupedData = { ...groupedData };
        newGroupedData[groupKey].items[index] = {
            ...newGroupedData[groupKey].items[index],
            [field]: value,
        };
        setGroupedData(newGroupedData);
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-7 md:py-4 bg-[#d7d7d7] h-full sm:h-scree'>
            <header className='flex items-start gap-3 mb-4'>
                <IoIosArrowBack
                    size={30}
                    className='cursor-pointer'
                    onClick={() => navigate('/presses_register_production', { state: { date, shift } })}
                />
                <h1 className='text-xl'>{`Editar registros del turno ${shift} en la fecha ${date} `}</h1>
            </header>
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-12'>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>
                                # MP
                            </th>
                            <th scope='col' className='px-6 py-3 '>
                                Orden de trabajo
                            </th>
                            <th scope='col' className='px-6 py-3 '>
                                No.Parte
                            </th>
                            <th scope='col' className='px-6 py-3 '>
                                No.Operador
                            </th>
                            <th scope='col' className='px-6 py-3 '>
                                Hora
                            </th>
                            <th scope='col' className='px-6 py-3 '>
                                Producción
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(groupedData).map(([key, group]) => {
                            const [press, workOrder, partNumber] = key.split('_');

                            return (
                                <React.Fragment key={key}>
                                    <tr
                                        className='odd:bg-white even:bg-gray-50 border-b hover:bg-muted/50 cursor-pointer'
                                        onClick={() => toggleGroup(key)}
                                    >
                                        <td className='px-6 py-4 font-medium'>
                                            <div className='flex items-center'>
                                                {expandedGroups[key] ? (
                                                    <IoChevronDown className='h-4 w-4 mr-2' />
                                                ) : (
                                                    <IoChevronForward className='h-4 w-4 mr-2' />
                                                )}
                                                {press}
                                            </div>
                                        </td>
                                        <td className='px-6 py-4 font-medium'>{workOrder}</td>
                                        <td className='px-6 py-4 font-medium'>{partNumber}</td>
                                    </tr>
                                    {expandedGroups[key] &&
                                        group.items.map((item, index) => (
                                            <tr
                                                key={`${key}-${index}`}
                                                className='odd:bg-white even:bg-gray-50 border-b'
                                            >
                                                <td></td>
                                                <td></td>
                                                <td></td>
                                                <td className='px-6 py-4'>{item.employee_number}</td>
                                                <td className='px-6 py-4'>{item.hour}</td>
                                                <td
                                                    className='px-6 py-4'
                                                    onDoubleClick={() => handleDoubleClick(key, index, 'pieces_ok')}
                                                >
                                                    {item.editableField === 'pieces_ok' ? (
                                                        <input
                                                            type='text'
                                                            value={item.pieces_ok}
                                                            onChange={e =>
                                                                handleChange(
                                                                    key,
                                                                    index,
                                                                    'pieces_ok',
                                                                    Number(e.target.value),
                                                                )
                                                            }
                                                            onBlur={() => handleBlur(key, index)}
                                                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5'
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span>{item.pieces_ok}</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EditProductionRecords;
