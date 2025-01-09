import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';
import { FaPlus } from 'react-icons/fa';
import { IoSearch } from 'react-icons/io5';
import EditPartNumModal from '../components/EditPartNumModal';
import Header from '../components/Header';

interface PartNum {
    id: number;
    part_number: string | null;
    box: string | null;
    client: string | null;
    pieces_x_box: number | null;
    rubber_compound: string | null;
    standard: number | null;
    pallet: string | null;
    box_x_pallet: number | null;
    pieces_x_pallet: number | null;
    mold: string | null;
    insert: string | null;
    caliber: string | null;
    gripper: string | null;
}

interface FullPartNum {
    id: number;
    part_number: string;
    client: string;
    box: string;
    pieces_x_box: number;
    rubber_compound: string;
    price?: number;
    standard: number;
    pallet: string;
    box_x_pallet: number;
    pieces_x_pallet?: number;
    assembly?: string;
    accessories?: string;
    mold: string;
    instructive?: string;
    insert: string;
    gripper: string;
    caliber: string;
    paint?: string;
    std_paint?: number;
    painter?: number;
    scrap?: number;
    box_logo?: string;
    cavities?: number;
    category?: string;
    type2?: string;
    measurement?: string;
    special?: string;
    piece_label?: string;
    qty_piece_labels?: number;
    box_label?: string;
    qty_box_labels?: number;
    box_label_2?: string;
    qty_box_labels_2?: number;
    box_label_3?: string;
    qty_box_labels_3?: number;
    made_in_mexico?: string;
    staples?: string;
    image_piece_label?: File | null;
    image_box_label?: File | null;
    image_box_label_2?: File | null;
    image_box_label_3?: File | null;
}

const PartNumCataloge = () => {
    const navigate = useNavigate();
    const [partNums, setPartNums] = useState<PartNum[]>([]);
    const [filteredPartNums, setFilteredPartNums] = useState<PartNum[]>([]);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPartNumId, setSelectedPartNumId] = useState<number | null>(null);

    const fetchPartNums = async () => {
        try {
            const response = await api.get('/get_all_part_nums/');
            setPartNums(response.data);
        } catch (error) {
            console.error('Error obteniendo datos: ', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartNums();
    }, []);

    useEffect(() => {
        const filtered = partNums.filter(item =>
            item.part_number?.toLocaleLowerCase().includes(searchTerm.toLocaleLowerCase()),
        );
        setFilteredPartNums(filtered);
    }, [searchTerm, partNums]);

    const handleEditClick = (id: number) => {
        setSelectedPartNumId(id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPartNumId(null);
    };

    const handleSavePartNum = async (updatedPartNum: FullPartNum) => {
        try {
            await api.patch(`/part_numbers/${updatedPartNum.id}/update/`, updatedPartNum);
            setPartNums(prev =>
                prev.map(partNum => (partNum.id === updatedPartNum.id ? { ...partNum, ...updatedPartNum } : partNum)),
            );

            handleCloseModal();
        } catch (error) {
            console.error('Error actualizando número de parte:', error);
        }
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Catálogo de Números de Parte' />
            <section className='flex flex-row justify-end p-2 gap-2 items-end mb-4 '>
                <div className='m-2'>
                    <label htmlFor='search' className='mb-2 text-sm font-medium text-gray-900 sr-only'>
                        Número de parte
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
                            placeholder='Buscar Números de parte'
                        />
                    </div>
                </div>
                <button
                    className='flex items-center gap-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2'
                    onClick={() => navigate('/part_num_creation')}
                >
                    <FaPlus />
                    <span>Nuevo número de parte</span>
                </button>
            </section>
            <section className='relative overflow-x-auto shadow-md sm:rounded-lg mt-7 '>
                {loading ? (
                    <p className='text-center'>Cargando datos...</p>
                ) : (
                    <table className='w-full text-sm text-left text-gray-500'>
                        <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                            <tr>
                                <th scope='col' className='px-6 py-3'>
                                    No.Parte
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Cliente
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Box
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Piezas Box
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Compuesto de hule
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Standard
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Pallet
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Box X Pallet
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Piezas X Pallet
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Molde
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Inserto
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Calibre
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    Gripper
                                </th>
                                <th scope='col' className='px-6 py-3'>
                                    <span className='sr-only'>Edit</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPartNums.map((item, index) => (
                                <tr key={index} className='odd:bg-white even:bg-gray-50 border-b'>
                                    <th className='px-6 py-3'>{item.part_number}</th>
                                    <th className='px-6 py-3'>{item.client}</th>
                                    <th className='px-6 py-3'>{item.box}</th>
                                    <th className='px-6 py-3'>{item.pieces_x_box}</th>
                                    <th className='px-6 py-3'>{item.rubber_compound}</th>
                                    <th className='px-6 py-3'>{item.standard}</th>
                                    <th className='px-6 py-3'>{item.pallet}</th>
                                    <th className='px-6 py-3'>{item.box_x_pallet}</th>
                                    <th className='px-6 py-3'>{item.pieces_x_pallet}</th>
                                    <th className='px-6 py-3'>{item.mold}</th>
                                    <th className='px-6 py-3'>{item.insert}</th>
                                    <th className='px-6 py-3'>{item.caliber}</th>
                                    <th className='px-6 py-3'>{item.gripper}</th>
                                    <td className='px-6 py-4 text-right'>
                                        <button
                                            onClick={() => handleEditClick(item.id)}
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
            <EditPartNumModal
                partNumId={selectedPartNumId}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePartNum}
            />
        </div>
    );
};

export default PartNumCataloge;
