import { useEffect, useState } from 'react';
import DashBoardContainer from '../components/DashBoardContainer';
import Header from '../components/Header';
import api from '../config/axiosConfig';
import { LuGoal } from 'react-icons/lu';

const DashBoard = () => {
    const [productionSummary, setProductionSummary] = useState<string>('');
    const currentDate = new Date('August 2024');
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const fetchProductionSummary = async () => {
        try {
            //For testing use month=8 and year=2024
            const response = await api.get(`/dashboard/production/?month=${month}&year=${year}`);
            console.log(response.data);
            const productionData: string =
                response.data['pieces_ok_total'] + '/' + response.data['target_amount'] + ' piezas';
            setProductionSummary(productionData);
        } catch (error) {
            console.error('Error fetching production summary:', error);
        }
    };

    // const fetchFailsAndPauses = async () =>{
    //     try {
    //         const response = await api.get(`/dashboard/mps-fails-and-pauses/?month=${month}&year=${year}`);
    //         console.log(response.data);

    //     } catch (error) {
    //         console.error('Error fetching fails and pauses:', error);
    //     }
    // };

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
        fetchScrapPerEmployee();
    }, []);
    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Dashboard' />
            <div className='mt-8 flex justify-between items-center  gap-4 md:flex-row'>
                <DashBoardContainer
                    data={productionSummary}
                    icon={<LuGoal />}
                    color='bg-orange-500'
                    title='Producción'
                />
            </div>
        </div>
    );
};

export default DashBoard;
