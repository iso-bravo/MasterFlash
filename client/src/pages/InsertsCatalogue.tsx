import { IoSearch } from 'react-icons/io5';
import Header from '../components/Header';
import { FaPlus } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import EditInsertModal from '../components/EditInsertModal';
import api from '../config/axiosConfig';
import AddNewInsert from '../components/forms/AddNewInsert';

interface Insert {
    id: number;
    insert: string;
    weight: number;
    caliber: number;
    chemlok: number;
}

type NewInsert = Omit<Insert, 'id'>;

const InsertsCatalogue = () => {
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [inserts, setInserts] = useState<Insert[]>([]);
    const [filteredInserts, setFilteredInserts] = useState<Insert[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedInsert, setSelectedInsert] = useState<Insert | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const handleEditClick = (insert: Insert) => {
        setSelectedInsert(insert);
        setIsEditModalOpen(true);
    };

    const handleAddClick = () => {
        setIsAddModalOpen(true);
    };

    const handleSaveNewInsert = async (newInsert: NewInsert) => {
        try {
            const sanitizedInsert = {
                ...newInsert,
                weight: Number(newInsert.weight),
                caliber: Number(newInsert.caliber),
                chemlok: Number(newInsert.chemlok),
            };
            const response =await api.post('/inserts/new/', sanitizedInsert);
            console.log('Datos guardados en setInserts:', response.data);
            setInserts(prevInserts => [...prevInserts, response.data]);
            setIsAddModalOpen(false);
        } catch (error) {
            console.error('Error guardando el nuevo inserto:', error);
        }
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedInsert(null);
    };

    useEffect(() => {
        const fetchInserts = async () => {
            setLoading(true);
            try {
                const response = await api.get('/inserts/');
                setInserts(response.data);
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error('Error fetching inserts:', error);
            }
        };
        fetchInserts();
    }, []);

    useEffect(() => {
        const filtered = inserts.filter(item =>
            item.insert?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
        );
        setFilteredInserts(filtered);
    }, [searchTerm, inserts]);

    const handleSaveInsert = async (updatedInsert: Insert) => {
        try {
            const sanitizedInsert = {
                ...updatedInsert,
                weight: Number(updatedInsert.weight),
                caliber: Number(updatedInsert.caliber),
                chemlok: Number(updatedInsert.chemlok),
            };
            console.log('Datos guardados en setInserts:', sanitizedInsert);
            await api.patch(`/inserts/${updatedInsert.id}/update/`, sanitizedInsert);
            setInserts(inserts.map(insert => (insert.id === sanitizedInsert.id ? sanitizedInsert : insert)));
            handleCloseEditModal();
        } catch (error) {
            console.error('Error actualizando el inserto:', error);
        }
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Catálogo de Insertos' />
            <section className='flex flex-row justify-end p-2 gap-2 items-end mb-4 '>
                <div className='m-2'>
                    <label htmlFor='search' className='mb-2 text-sm font-medium text-gray-900 sr-only'>
                        Inserto
                    </label>
                    <div className='relative w-full'>
                        <div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
                            <IoSearch />
                        </div>
                        <input
                            id='search'
                            type='text'
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className='block w-full  px-5 py-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 me-2'
                            placeholder='Buscar Insertos'
                        />
                    </div>
                </div>
                <button
                    className='flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    onClick={handleAddClick}
                >
                    <FaPlus />
                    <span>Nuevo inserto</span>
                </button>
            </section>
            {isEditModalOpen && selectedInsert && (
                <EditInsertModal
                    onClose={handleCloseEditModal}
                    onSubmit={handleSaveInsert}
                    insertObj={selectedInsert}
                />
            )}
            {isAddModalOpen && <AddNewInsert onClose={()=> setIsAddModalOpen(false)} onSubmit={handleSaveNewInsert} />}
            <section className='relative overflow-x-auto shadow-md sm:rounded-lg mt-7 '>
                {loading ? (
                    <p className='text-center'>Cargando datos...</p>
                ) : (
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                            <tr>
                                <th scope='col' className='px-6 py-3'>
                                    Inserto
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Peso
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Calibre
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Chemlok
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    <span className='sr-only'>Editar</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInserts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className='text-center'>
                                        <b>No se encontraron insertos</b>
                                    </td>
                                </tr>
                            )}
                            {filteredInserts.map((item, index) => (
                                <tr key={index} className='odd:bg-white even:bg-gray-50 border-b'>
                                    <th className='px-6 py-3'>{item.insert}</th>
                                    <th className='px-6 py-3'>{item.weight}</th>
                                    <th className='px-6 py-3'>{item.caliber}</th>
                                    <th className='px-6 py-3'>{item.chemlok}</th>
                                    <td className='px-6 py-4 text-right'>
                                        <button
                                            onClick={() => handleEditClick(item)}
                                            className='text-blue-600 hover:underline'
                                        >
                                            Editar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default InsertsCatalogue;
