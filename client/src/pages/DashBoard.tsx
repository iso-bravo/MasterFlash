import { useEffect, useState } from 'react';
import DashBoardContainer from '../components/DashBoardContainer';
import Header from '../components/Header';
import api from '../config/axiosConfig';
import { LuGoal } from 'react-icons/lu';
import { FaPause } from 'react-icons/fa';
import { BiSolidError } from 'react-icons/bi';

const DashBoard = () => {
    const [productionSummary, setProductionSummary] = useState<string>('');
    const [pauses, setPauses] = useState<string>('');
    const [fails, setFails] = useState<string>('');
    //! change this to the current date
    const currentDate = new Date('August 2024');
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const fetchProductionSummary = async () => {
        try {
            //For testing use month=8 and year=2024
            const response = await api.get(`/dashboard/production/?month=${month}&year=${year}`);
            const productionData: string =
                response.data['pieces_ok_total'] + '/' + response.data['target_amount'] + ' piezas';
            setProductionSummary(productionData);
        } catch (error) {
            console.error('Error fetching production summary:', error);
        }
    };

    const fetchFailsAndPauses = async () => {
        try {
            const response = await api.get(`/dashboard/mps-fails-and-pauses/?month=${month}&year=${year}`);
            setPauses(response.data['pause_count']);
            setFails(response.data['failure_count']);
        } catch (error) {
            console.error('Error fetching fails and pauses:', error);
        }
    };

    const fetchScrapPerEmployee = async () => {
        try {
            const response = await api.get(`/dashboard/scrap-per-employee/?date=${currentDate}`);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching scrap per employee:', error);
        }
    };

    useEffect(() => {
        fetchProductionSummary();
        fetchFailsAndPauses();
        // fetchScrapPerEmployee();
    }, []);
    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Dashboard' />
            <div className='mt-8 flex justify-evenly items-center  gap-4 md:flex-row'>
                <DashBoardContainer
                    data={productionSummary}
                    icon={<LuGoal size={24} />}
                    color='bg-orange-500'
                    title='Producción'
                />
                <DashBoardContainer
                    data={pauses}
                    icon={<FaPause size={24} />}
                    color='bg-yellow-500'
                    title='Pausas este mes'
                />
                <DashBoardContainer
                    data={fails}
                    icon={<BiSolidError size={24} />}
                    color='bg-red-500'
                    title='Fallas este mes'
                />
            </div>
            <div>GRÁFICOS</div>
            <div className='mt-8 w-full'>
                <table></table>
            </div>
        </div>
    );
};

export default DashBoard;
