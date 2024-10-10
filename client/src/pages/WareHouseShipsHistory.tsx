import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

const WareHouseShipsHistory = () => {
    const navigate = useNavigate();

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/rubber_menu')} />
                <h1 className='text-xl'>Envios a Almacén</h1>
            </header>
            <section className='relative overflow-x-auto shadow-md sm:rounded-lg mt-7 '>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3'>
                                Query date
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Start date
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                End date
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Compound
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Total weight
                            </th>
                        </tr>
                    </thead>
                </table>
            </section>
        </div>
    );
};

export default WareHouseShipsHistory;
