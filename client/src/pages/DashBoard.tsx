import { useCallback, useEffect, useState } from 'react';
import DashBoardContainer from '../components/DashBoardContainer';
import Header from '../components/Header';
import api from '../config/axiosConfig';
import { LuGoal } from 'react-icons/lu';
import { FaPause } from 'react-icons/fa';
import { BiSolidError } from 'react-icons/bi';
import DashboardCard from '../components/DashboardCard';
import { useWaitFullInput } from '../utils/useWaitFullInput';

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

const DashBoard = () => {
    const [productionSummary, setProductionSummary] = useState<string>('');
    const [pauses, setPauses] = useState<string>('');
    const [fails, setFails] = useState<string>('');
    const [scrapResults, setScrapResults] = useState<scrapData[]>([]);
    //! change this to the current date
    const currentDate = new Date('August 2024');
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();


    const fetchProductionSummary = useCallback(async () => {
        try {
            // * For testing use month=8 and year=2024
            const response = await api.get(`/dashboard/production/?month=${month}&year=${year}`);
            const productionData: string =
                response.data['pieces_ok_total'] + '/' + response.data['target_amount'] + ' piezas';
            setProductionSummary(productionData);
        } catch (error) {
            console.error('Error fetching production summary:', error);
        }
    },[month,year]);

    const fetchFailsAndPauses = useCallback(async () => {
        try {
            const response = await api.get(`/dashboard/mps-fails-and-pauses/?month=${month}&year=${year}`);
            setPauses(response.data['pause_count']);
            setFails(response.data['failure_count']);
        } catch (error) {
            console.error('Error fetching fails and pauses:', error);
        }
    },[month,year]);

    const fetchScrapPerEmployee = useCallback(async (date:string) => {
        try {
            //* use 09/09/2024 for testing
            const response = await api.get(`/dashboard/scrap-per-employee/?date=${date}`);
            console.log(response.data);
            // setScrapResults(response.data);
        } catch (error) {
            console.error('Error fetching scrap per employee:', error);
        }
    },[]);

    const { input, handleInput } = useWaitFullInput("", (value) => {
        console.log("Api called with value:", value);
        fetchScrapPerEmployee(value);
    },1000);

    useEffect(() => {
        fetchProductionSummary();
        fetchFailsAndPauses();
    }, []);
    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-full sm:h-screen'>
            <Header title='Dashboard' />
            <div className='mt-12 flex flex-wrap items-center mb-4  gap-4 md:flex-row'>
                <DashBoardContainer
                    data={productionSummary}
                    icon={<LuGoal size={30} />}
                    color='bg-orange-500'
                    title='Producción'
                />
                <DashBoardContainer
                    data={pauses}
                    icon={<FaPause size={30} />}
                    color='bg-yellow-500'
                    title='Pausas este mes'
                />
                <DashBoardContainer
                    data={fails}
                    icon={<BiSolidError size={30} />}
                    color='bg-red-500'
                    title='Fallas este mes'
                />
            </div>
            <div>GRÁFICOS</div>
            <div className=' flex flex-wrap mt-16 w-full'>
                <DashboardCard title='Pruebas' subtitle='Total de pruebas realizadas' color='bg-yellow-500'>
                    <div className='flex flex-col items-center justify-center'>
                        <label htmlFor='ScrapDate' className='sr-only'>Fecha</label>
                        <input
                            type='date'
                            id='ScrapDate'
                            value={input}
                            onChange={handleInput}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
                        />
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default DashBoard;
