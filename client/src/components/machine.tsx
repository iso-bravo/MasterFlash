import React from 'react';
import { SlEnergy } from "react-icons/sl";
import { IoIosFlashOff, IoIosWarning } from "react-icons/io";
import { IoPause } from "react-icons/io5";

interface MachineProps {
    machineData: {
        name: string;
        state: string;
        employee_number: string;
    };
    onClick: () => void;
    selectedState: string;
}

const Machine: React.FC<MachineProps> = ({ machineData, onClick, selectedState }) => {
    let icon;
    let backgroundColorClass;

    switch (machineData.state) {
        case 'Running':
            icon = <SlEnergy size={48} color="white"/>;
            backgroundColorClass = 'bg-[#34C34B]';
            break;
        case 'Inactive':
            icon = <IoIosFlashOff size={48} color="white"/>;
            backgroundColorClass = 'bg-[#959494]';
            break;
        case 'Pause':
            icon = <IoPause size={48} color="white"/>;
            backgroundColorClass = 'bg-[#E1CD1C]';
            break;
        case 'Failure':
            icon = <IoIosWarning size={48} color="white"/>;
            backgroundColorClass = 'bg-[#EF3333]';
            break;
        default:
            icon = null;
    }

    return (
        <div className={`flex flex-col items-center justify-center m-2 rounded p-4 ${backgroundColorClass} md:w-24 lg:w-28 cursor-pointer`} onClick={onClick}>
            <h1 className='text-center text-white text-lg lg:text-2xl font-semibold'>{machineData.name}</h1>
            {icon && <div className='my-2'>{icon}</div>}
            <h2 className='text-center text-white text-md lg:text-xl font-semibold'>{machineData.employee_number}</h2>
        </div>
    );
};

export default Machine;
