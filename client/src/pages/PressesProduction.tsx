import api from '../config/axiosConfig';
import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import '../App.css';
import MachineProduction from '../components/machineProduction';
import Popup from '../components/popUpProduction';
import '../index.css';
import '../output.css';
import { useNavigate } from 'react-router-dom';

interface MachineData {
    name: string;
    state: string;
    employee_number: string;
    pieces_ok: string;
    pieces_rework: string;
    part_number: string;
    work_order: string;
    total_ok: string;
    molder_number: string;
}

const PressesProduction: React.FC = () => {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [totalPiecesProduced, setTotalPiecesProduced] = useState<number>(0);
    const [popUpOpen, setPopUpOpen] = useState(false);
    const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const socket = new WebSocket(`${import.meta.env.VITE_WEBSOCKET_BASE_URL}/ws/load_machine_data_production/`);

        socket.onopen = () => {
            console.log('WebSocket Connection opened');
        };

        socket.onmessage = event => {
            try {
                const data = JSON.parse(event.data);
                console.log('Data received:', data);
                if (data['type']) {
                    console.log(data['type']);
                } else if (Array.isArray(data.machines_data)) {
                    setMachines(data.machines_data);
                    setTotalPiecesProduced(data.total_piecesProduced);
                } else {
                    console.error('machines_data is not an array:', data.machines_data);
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
            console.log('WebSocket clsoed: ', event);
        };

        return () => {
            console.log('Closing WebSocket');
            socket.close();
        };
    }, []);

    const handleMachineClick = (machineData: MachineData) => {
        setPopUpOpen(true);
        setSelectedMachine(machineData);
    };

    const handleClosePopup = () => {
        setPopUpOpen(false);
        setSelectedMachine(null);
    };

    const updateTotalProduced = (pieces_ok: number) => {
        let total;
        // eslint-disable-next-line prefer-const
        total = totalPiecesProduced + pieces_ok;
        setTotalPiecesProduced(total);
    };

    const handleUpdateMachine = (updatedMachine: MachineData) => {
        setMachines(prevMachines =>
            prevMachines.map(machine => {
                if (machine.name === updatedMachine.name) {
                    const total_okAdd = parseInt(machine.total_ok) + parseInt(updatedMachine.pieces_ok);
                    const pieces_okAdd = parseInt(machine.pieces_ok) + parseInt(updatedMachine.pieces_ok);
                    const pieces_reworkAdd = parseInt(machine.pieces_rework) + parseInt(updatedMachine.pieces_rework);
                    return {
                        ...updatedMachine,
                        total_ok: updatedMachine.part_number === machine.part_number ? total_okAdd.toString() : '0',
                        pieces_ok: pieces_okAdd.toString(),
                        pieces_rework: pieces_reworkAdd.toString(),
                    };
                }
                return machine;
            }),
        );
        updateTotalProduced(parseInt(updatedMachine.pieces_ok));
    };

    const handleSave = async (
        newEmployeeNumber: string,
        newPiecesOK: string,
        newPiecesRework: string,
        newPartNumber: string,
        newWork_order: string,
        newMolderNumber: string,
    ) => {
        if (!selectedMachine) return;

        // Actualiza los campos si están vacíos con los valores anteriores
        const updatedMachine: MachineData = {
            ...selectedMachine,
            state: selectedMachine.state,
            employee_number: newEmployeeNumber || selectedMachine.employee_number,
            pieces_ok: newPiecesOK || selectedMachine.pieces_ok,
            pieces_rework: newPiecesRework || selectedMachine.pieces_rework,
            part_number: newPartNumber || selectedMachine.part_number,
            work_order: newWork_order || selectedMachine.work_order,
            molder_number: newMolderNumber || selectedMachine.molder_number,
        };

        setSelectedMachine(updatedMachine);

        try {
            await api.post('/register_data_production/', updatedMachine, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log('Machine state updated successfully!');
        } catch (error) {
            console.error('Error updating machine state:', error);
        }

        setPopUpOpen(false);
    };

    return (
        <div className='lg:p-2'>
            <header className='flex flex-wrap items-center justify-between mt-3 mb-10 bg-orange-500 text-white p-4 w-full '>
                <section>
                    <IoIosArrowRoundBack
                        size={65}
                        className='cursor-pointer text-black'
                        onClick={() => navigate('/')}
                    />
                    <div className='flex flex-col md:flex-row md:items-center gap-3'>
                        <h1 className='font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl'>Producido hoy:</h1>
                        <h1 className='font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl'>
                            {totalPiecesProduced}
                        </h1>
                    </div>
                </section>
                <section className='flex flex-col items-start'>
                    <div className='flex flex-row mt-3 ml-2'>
                        <h1 className='font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl '>Actual:</h1>
                        <h1 className='font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl'>
                            {totalPiecesProduced}
                        </h1>
                    </div>
                    <div className='flex flex-col md:flex-row md:items-center gap-3 p-2'>
                        <h1 className='font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl'>Meta mensual:</h1>
                        <h1 className='font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl'>{'80000'}</h1>
                        <button
                            type='button'
                            className='text-yellow-400 hover:text-white border border-yellow-400 hover:bg-yellow-500 focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 dark:border-yellow-300 dark:text-yellow-300 dark:hover:text-white dark:hover:bg-yellow-400 dark:focus:ring-yellow-900'
                        >
                            Agregar meta
                        </button>
                    </div>
                </section>
            </header>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-2 gap-y-4 justify-items-center'>
                {machines &&
                    machines.map((machine, index) => (
                        <MachineProduction
                            key={index}
                            machineData={machine}
                            onClick={() => handleMachineClick(machine)}
                            selectedState={selectedMachine ? selectedMachine.state : ''}
                        />
                    ))}
            </div>

            {popUpOpen && selectedMachine && (
                <Popup
                    machineData={selectedMachine}
                    onClose={handleClosePopup}
                    onSave={handleSave}
                    onUpdate={handleUpdateMachine}
                />
            )}
        </div>
    );
};

export default PressesProduction;
