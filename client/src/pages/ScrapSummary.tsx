import { useState } from 'react';
import { FaTrash } from 'react-icons/fa';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

interface scrapData {
    rubber_weight: number;
    total_pieces: number;
    insert_weight_w_rubber: number;
    date_time: string;
    shift: number;
    line: string;
    auditor_qc: number;
    molder_number: number;
    part_number: string;
    compound:string
    caliber:number
}

const ScrapSummary = () => {

    const navigate = useNavigate();
    const [scrapData, setScrapData] = useState<scrapData[]>([]);

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] min-h-screen'>
            <ToastContainer
                position='top-center'
                autoClose={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                theme='colored'
            />
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/')} />
                <h1 className='text-xl'>Resumen Scrap</h1>
            </header>
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-6'>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>
                                Rubber Weight
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Total Pieces
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Insert Weight w/ Rubber
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Date
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Shift
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Line
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Auditor QC
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Molder Number
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Part Number
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Compound
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Caliber
                            </th>
                            <th scope='col' className='px-6 py-3'></th>
                        </tr>
                    </thead>
                    <tbody>
                        {scrapData.length > 0 ? (
                            scrapData.map((item, index) => (
                                <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b`}>
                                    <td className='px-6 py-4'>{item.rubber_weight}</td>
                                    <td className='px-6 py-4'>{item.total_pieces}</td>
                                    <td className='px-6 py-4'>{item.insert_weight_w_rubber}</td>
                                    <td className='px-6 py-4'>{item.date_time}</td>
                                    <td className='px-6 py-4'>{item.shift}</td>
                                    <td className='px-6 py-4'>{item.line}</td>
                                    <td className='px-6 py-4'>{item.auditor_qc}</td>
                                    <td className='px-6 py-4'>{item.molder_number}</td>
                                    <td className='px-6 py-4'>{item.part_number}</td>
                                    <td className='px-6 py-4'>{item.compound}</td>
                                    <td className='px-6 py-4'>{item.caliber}</td>
                                    <td className='px-6 py-4'>
                                        <FaTrash color='red' size={20} className='cursor-pointer' />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={12} className='px-6 py-4 text-center'>
                                    No data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ScrapSummary;
