import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import { useEffect, useState } from 'react';
import api from '../config/axiosConfig';

interface ProductionRecord {
    id: number;
    press: string;
    employee_number: number | null;
    part_number: string;
    work_order: string;
    caliber: string | null;
    worked_hrs: number | null;
    dead_time_cause_1: string | null;
    cavities: number | null;
    standard: number | null;
    proposed_standard: number | null;
    dead_time_cause_2: string | null;
    pieces_ok: number | null;
    efficiency: number;
    date: string;
    shift: string;
    mod_date: string;
}

const ProductionRecordsDetails = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const id = params.get('id');

    const [record, setRecord] = useState<ProductionRecord>();

    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await api.get(`/get_record_by_id/${id}`);
                const data = response.data;
                console.log(response);
                data.efficiency = parseFloat(data.efficiency);
                data.worked_hrs = parseFloat(data.worked_hrs);

                setRecord(data);
            } catch (error) {
                console.error('Error fetching data: ', error);
            }
        };
        fetchRecord();
    }, [id]);

    const proposed_efficiency =
        record?.pieces_ok && record?.proposed_standard && record?.worked_hrs
            ? (100 * (record.pieces_ok / (record.proposed_standard * record.worked_hrs))).toFixed(2)
            : 'N/A';

    return (
        <div className='min-h-screen flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Details' goto='/press_production_records_summary' />
            <div className='relative overflow-x-auto shadow-md sm:rounded-lg mt-12 '>
                <table className='w-full text-sm text-left text-gray-500'>
                    <thead className='text-xs text-gray-700 uppercase bg-gray-50'>
                        <tr>
                            <th scope='col' className='px-6 py-3 '>
                                # MP
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                No.Operador
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Orden de trabajo
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                No.Parte
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Cavidades
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Calibre
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Hrs Trabajadas
                            </th>
                            <th scope='col' className='px-6 py-3 bg-yellow-300'>
                                Causa de Tiempo muerto (Str.)
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Estándar por hora
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Estándar propuesto
                            </th>
                            <th scope='col' className='px-6 py-3 bg-yellow-300'>
                                Causa de tiempo muerto (Tiempo)
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Producción
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Eficiencia
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Eficiencia propuesta
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Fecha
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Truno
                            </th>
                            <th scope='col' className='px-6 py-3'>
                                Fecha de modificación
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {record ? (
                            <tr className='odd:bg-white even:bg-gray-50 border-b'>
                                <td className='px-6 py-4'>{record.press}</td>
                                <td className='px-6 py-4'>{record.employee_number}</td>
                                <td className='px-6 py-4'>{record.work_order}</td>
                                <td className='px-6 py-4'>{record.part_number}</td>
                                <td className='px-6 py-4'>{record.cavities}</td>
                                <td className='px-6 py-4'>{record.caliber}</td>
                                <td className='px-6 py-4'>{record.worked_hrs}</td>
                                <td className='px-6 py-4 bg-yellow-300'>{record.dead_time_cause_1}</td>
                                <td className='px-6 py-4'>{record.standard}</td>
                                <td className='px-6 py-4'>{record.proposed_standard}</td>
                                <td className='px-6 py-4 bg-yellow-300'>{record.dead_time_cause_2}</td>
                                <td className='px-6 py-4'>{record.pieces_ok}</td>
                                <td className='px-6 py-4'>{record.efficiency}</td>
                                <td className='px-6 py-4'>{proposed_efficiency}</td>
                                <td className='px-6 py-4'>{record.date}</td>
                                <td className='px-6 py-4'>{record.shift}</td>
                                <td className='px-6 py-4'>{record.mod_date}</td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={14} className='text-center p-4'>
                                    Cargando o sin datos disponibles
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProductionRecordsDetails;
