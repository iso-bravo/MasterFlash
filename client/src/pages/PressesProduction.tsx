
import api from '../config/axiosConfig';
import { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import '../App.css';
import MachineProduction from '../components/machineProduction';
import '../index.css';
import '../output.css';
import { useNavigate } from 'react-router-dom';
import MonthlyGoalModal from '../components/MonthlyGoalModal';
import {  ToastContainer } from 'react-toastify';
import type { MachineData } from '../types/PressProductionTypes';

const PressesProduction: React.FC = () => {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [totalPiecesProduced, setTotalPiecesProduced] = useState<number>(0);
    const [goalModalOpen, setGoalModalOpen] = useState(false);
    const [monthlyGoal, setMonthlyGoal] = useState<number | null>(null);
    const [productionTotal, setProductionTotal] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const socket = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/load_machine_data_production/`);

        socket.onopen = () => {
            console.log('WebSocket Connection opened');
            socket.send(JSON.stringify({type: "request_update"}));
        };

        socket.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                console.log('Data received:', data);

                if (data.machines_data) {
                    const updatedMachines = data.machines_data.map((machine: MachineData) => ({
                        ...machine,
                        molder_number:
                            machine.previous_molder_number !== '----'
                                ? machine.previous_molder_number
                                : machine.molder_number,
                    }));
                    setMachines(updatedMachines);
                    setTotalPiecesProduced(data.total_piecesProduced);
                    setProductionTotal(data.actual_produced);
                }
            } catch (error) {
                console.error('Error parsing JSON:', error, 'Data received:', event.data);
            }
        };

        socket.onerror = error => {
            console.error('WebSocket error: ', error);
        };

        socket.onclose = event => {
            if (event.wasClean) {
                console.log('WebSocket connection closed cleanly');
            } else {
                console.error('WebSocket connection closed with error');
            }
            console.log('WebSocket closed: ', event);
        };

        return () => {
            console.log('Closing WebSocket');
            socket.close();
        };
    }, []);

    useEffect(() => {
        const fetchMonthlyGoalAndPercentage = async () => {
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth() + 1;

            try {
                const goalResponse = await api.get(`/monthly-goal/${year}/${month}/`);
                setMonthlyGoal(goalResponse.data.target_amount);
            } catch (error) {
                console.error('Error fetching monthly goal or production percentage:', error);
            }
        };

        fetchMonthlyGoalAndPercentage();
    }, []);

    const handleMachineClick = (machineData: MachineData) => {
        navigate(`/presses_production/machine/${machineData.name}`, { state: { machineData } });
    };


    const handleSaveGoal = async (target_amount: number, month: number, year: number) => {
        try {
            await api.post(
                '/monthly-goal/',
                { year, month, target_amount },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                },
            );
            setMonthlyGoal(target_amount);
            console.log('Monthly goal saved successfully!');
        } catch (error) {
            console.error('Error saving monthly goal: ', error);
        }
    };

    return (
        <div className='lg:p-2'>
            <ToastContainer />
            <header className='flex flex-wrap items-center justify-between mt-3 mb-10 bg-orange-500 text-white p-4 w-full '>
                <section>
                    <IoIosArrowRoundBack
                        size={65}
                        className='cursor-pointer text-black'
                        onClick={() => navigate('/')}
                    />
                    <div className='flex flex-col md:flex-row md:items-center gap-3'>
                        <h1 className='font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl'>Producido en turno:</h1>
                        <h1 className='font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl'>
                            {totalPiecesProduced}
                        </h1>
                    </div>
                </section>
                <section className='flex flex-col items-start'>
                    <div className='flex flex-row mt-3 ml-2'>
                        <h1 className='font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl '>Actual:</h1>
                        <h1 className='font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl'>
                            {productionTotal}
                        </h1>
                    </div>
                    <div className='flex flex-col md:flex-row md:items-center gap-3 p-2'>
                        <h1 className='font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl'>Meta:</h1>
                        <h1 className='font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl'>{monthlyGoal}</h1>
                        <button
                            type='button'
                            className='text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900 cursor-pointer'
                            onClick={() => setGoalModalOpen(true)}
                        >
                            Agregar meta
                        </button>
                    </div>
                </section>
            </header>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-2 gap-y-4 justify-items-center'>
                {machines?.map((machine, index) => (
                        <MachineProduction
                            key={`${index}-${machine.name}`}
                            machineData={machine}
                            onClick={() => handleMachineClick(machine)}
                        />
                    ))}
            </div>

            <MonthlyGoalModal isOpen={goalModalOpen} onClose={() => setGoalModalOpen(false)} onSave={handleSaveGoal} />
        </div>
    );
};

export default PressesProduction;
