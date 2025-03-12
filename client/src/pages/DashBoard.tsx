import { useCallback, useEffect, useState } from 'react';
import DashBoardContainer from '../components/DashBoardContainer';
import Header from '../components/Header';
import api from '../config/axiosConfig';
import { LuGoal } from 'react-icons/lu';
import { FaPause } from 'react-icons/fa';
import { BiSolidError } from 'react-icons/bi';
import DashboardCard from '../components/DashboardCard';
import { useDebounce } from '../utils/useDebounce';
import DynamicTable from '../components/DynamicTable';
import WeekProductionChart from '../components/WeekProductionChart';
import type { AnualProduction, TotalScrapData, WeekProduction } from '../types/DashBoardTypes';
import { formatDate } from '../utils/formatDate';
import AnualProductionChart from '../components/AnualProductionChart';

const DashBoard = () => {
    const [productionSummary, setProductionSummary] = useState<string>('');
    const [pauses, setPauses] = useState<string>('');
    const [fails, setFails] = useState<string>('');
    const [scrapResults, setScrapResults] = useState<TotalScrapData>({ data: [], general_total: 0 });
    const [weekProduction, setWeekProduction] = useState<WeekProduction[]>([]);
    const [anualProduction, setAnualProduction] = useState<AnualProduction[]>([]);

    //! change this to the current date
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    const [scrapDateInput, setScrapDateInput] = useState<string>('');
    const debouncedScrapInput = useDebounce(scrapDateInput, 1000);
    const [weekProductionDateInput, setWeekProductionDateInput] = useState<string>('');
    const debouncedWeekProductionInput = useDebounce(weekProductionDateInput, 1000);
    const [anualProductionDateInput, setAnualProductionDateInput] = useState<string>(year.toString());
    const debouncedAnualProductionInput = useDebounce(anualProductionDateInput.toString(), 1000);

    const fetchWeekProduction = useCallback(async (date: string) => {
        try {
            const response = await api.get(`/dashboard/week-production/?date=${date}`);
            console.log(response.data);
            setWeekProduction(response.data);
        } catch (error) {
            console.error('Error fetching week production:', error);
        }
    }, []);

    const fetchProductionSummary = useCallback(async () => {
        try {
            const response = await api.get(`/dashboard/production/?month=${month}&year=${year}`);
            const productionData: string =
                `${response.data.pieces_ok_total}/${response.data.target_amount} piezas`;
            setProductionSummary(productionData);
        } catch (error) {
            console.error('Error fetching production summary:', error);
        }
    }, [month, year]);

    const fetchAnualProduction = useCallback(async (year: string) => {
        try {
            const response = await api.get(`/dashboard/anual-production/?year=${year}`);
            console.log(response.data);
            setAnualProduction(response.data);
        } catch (error) {
            console.error('Error fetching anual production', error);
        }
    }, []);

    const fetchFailsAndPauses = useCallback(async () => {
        try {
            const response = await api.get(`/dashboard/mps-fails-and-pauses/?month=${month}&year=${year}`);
            setPauses(response.data.pause_count);
            setFails(response.data.failure_count);
        } catch (error) {
            console.error('Error fetching fails and pauses:', error);
        }
    }, [month, year]);

    const fetchScrapPerEmployee = useCallback(async (date: string) => {
        try {
            const response = await api.get(`/dashboard/scrap-per-employee/?date=${date}`);
            console.log('total per employee: ', response.data);
            setScrapResults(response.data);
        } catch (error) {
            console.error('Error fetching scrap per employee:', error);
        }
    }, []);

    useEffect(() => {
        if (debouncedScrapInput) {
            fetchScrapPerEmployee(debouncedScrapInput);
        }
        if (debouncedWeekProductionInput) {
            fetchWeekProduction(debouncedWeekProductionInput);
        }
        if (debouncedAnualProductionInput) {
            fetchAnualProduction(debouncedAnualProductionInput);
        }
    }, [
        debouncedScrapInput,
        fetchScrapPerEmployee,
        debouncedWeekProductionInput,
        fetchWeekProduction,
        debouncedAnualProductionInput,
        fetchAnualProduction,
    ]);

    useEffect(() => {
        fetchProductionSummary();
        fetchFailsAndPauses();
        fetchWeekProduction(formatDate(currentDate));
        fetchScrapPerEmployee(formatDate(currentDate));
    }, [fetchProductionSummary, fetchFailsAndPauses, fetchWeekProduction, fetchScrapPerEmployee]);

    const handleScrapDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setScrapDateInput(e.target.value);
    };

    const handleWeekProductionDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setWeekProductionDateInput(e.target.value);
    };

    const handleAnualProductionDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAnualProductionDateInput(e.target.value);
    };

    return (
        <div className='flex flex-col px-7 py-4 md:px-10 md:py-6 bg-[#d7d7d7] h-screen overflow-y-auto overflow-x-hidden'>
            <Header title='Dashboard' />
            <div className='mt-12 mb-4 grid grid-cols-3 gap-4 md:flex-row'>
                <DashBoardContainer
                    data={productionSummary}
                    icon={<LuGoal size={30} />}
                    color='bg-orange-500'
                    title='Meta mensual'
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
            <div className='mt-8 '>
                <DashboardCard title='Producción semanal' subtitle='Total de piezas producidas' color='bg-green-500'>
                    <div className='flex flex-col items-center justify-center'>
                        <label htmlFor='weekProductionDate' className='sr-only'>
                            Fecha
                        </label>
                        <input
                            type='date'
                            id='weekProductionDate'
                            value={weekProductionDateInput}
                            onChange={handleWeekProductionDateInput}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
                        />
                    </div>
                    <WeekProductionChart data={weekProduction} />
                </DashboardCard>
            </div>
            <div className='mt-16 w-full'>
                <DashboardCard title='Producción del año' subtitle='Producción anual' color='bg-orange-500'>
                    <div className='flex flex-col items-center justify-center'>
                        <label htmlFor='yearDate' className='sr-only'>
                            Año
                        </label>
                        <input
                            type='number'
                            id='yearDate'
                            min={1900}
                            max={2099}
                            step={1}
                            value={anualProductionDateInput}
                            onChange={handleAnualProductionDateInput}
                            className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
                        />
                    </div>
                    <AnualProductionChart data={anualProduction} />
                </DashboardCard>
            </div>
            <div className='  mt-16 w-full'>
                <DashboardCard title='Scrap' subtitle='Total de scrap realizadas' color='bg-yellow-500'>
                    <div>
                        <div className='flex flex-col items-center justify-center'>
                            <label htmlFor='ScrapDate' className='sr-only'>
                                Fecha
                            </label>
                            <input
                                type='date'
                                id='ScrapDate'
                                value={scrapDateInput}
                                onChange={handleScrapDateInput}
                                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5'
                            />
                        </div>
                        <DynamicTable incoming_data={scrapResults} />
                    </div>
                </DashboardCard>
            </div>
        </div>
    );
};

export default DashBoard;
