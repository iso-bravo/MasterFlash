import { useEffect, useState } from 'react';
import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
import api from '../config/axiosConfig';

interface PartNum {
    part_number: string | null;
    box: string | null;
    client:string | null; 
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

const PartNumCataloge = () => {
    const navigate = useNavigate();
    const [partNums, setPartNums] = useState<PartNum[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchPartNums = async () => {
        try {
            const response = await api.get('/get_all_part_nums/');
            setPartNums(response.data);
        } catch (error) {
            console.error('Error obteniendo datos: ', error);
        } finally {
            setLoading(false); // Cambia el estado a false cuando los datos ya fueron obtenidos
        }
    };

    useEffect(() => {
        fetchPartNums();
    }, []);

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <header className='flex items-start gap-3'>
                <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate('/part_num')} />
                <h1 className='text-xl'>Catálogo de Números de Parte</h1>
            </header>
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
                            </tr>
                        </thead>
                        <tbody>
                            {partNums.map((item, index) => (
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default PartNumCataloge;
