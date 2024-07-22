import React from 'react';
import { SlEnergy } from "react-icons/sl";
import { IoIosFlashOff, IoIosWarning } from "react-icons/io";
import { IoPause } from "react-icons/io5";

interface MachineProps {
    machineData: {
        name: string;
        state: string;
        employee_number: string;
        pieces_ok: string;
        pieces_rework: string;
        part_number: string;
        total_ok: string;

    };
    onClick: () => void;
    selectedState: string;
}

const MachineProduction: React.FC<MachineProps> = ({ machineData, onClick, selectedState }) => {
    let icon;
    let backgroundColorClass;

    switch (machineData.state) {
        case 'Running':
            icon = <SlEnergy size={30} color="white" />;
            backgroundColorClass = 'bg-[#34C34B]';
            break;
        case 'Inactive':
            icon = <IoIosFlashOff size={30} color="white" />;
            backgroundColorClass = 'bg-[#959494]';
            break;
        case 'Pause':
            icon = <IoPause size={30} color="white" />;
            backgroundColorClass = 'bg-[#E1CD1C]';
            break;
        case 'Failure':
            icon = <IoIosWarning size={30} color="white" />;
            backgroundColorClass = 'bg-[#EF3333]';
            break;
        default:
            icon = null;
    }

    return (
        <div className={`flex flex-row p-4 m-2 gap-2 rounded-md text-white ${backgroundColorClass} w-4/5 min-w-[16rem] max-w-[20rem] sm:max-w-[20rem] md:max-w-[23rem] lg:min-w-[20rem] lg:max-w-[24rem] xl:max-w-[27rem] cursor-pointer`} onClick={onClick}>
            <div className=' w-2/3'>
                <h1 className=' text-start text-xl md:text-xl lg:text-2xl '>{machineData.part_number}</h1>
                <div className='flex gap-2 text-md items-center'>
                    <p className='mt-3 text-lg sm:text-lg md:text-lg lg:text-xl xl:text-xl'>Actual:</p>
                    <p className='mt-3 text-xl sm:text-xl md:text-2xl lg:text-2xl font-semibold'>{machineData.pieces_ok}</p>
                </div>  
                <div className='flex gap-2 items-center'>
                    <p className='mt-3 text-lg sm:text-lg md:text-lg lg:text-xl'>Total Producido:</p>
                    <p className='mt-3 text-xl sm:text-xl md:text-2xl lg:text-2xl font-semibold'>{machineData.total_ok}</p>
                </div> 
            </div>
            <div className=' flex flex-col '>
            <h1 className='text-center text-md 685:text-lg lg:text-xl font-semibold'>{machineData.name}</h1>
            {icon && <div className='flex my-3 justify-center'>{icon}</div>}
            <h2 className='flex justify-center text-lg md:text-xl lg:text-xl'>{machineData.employee_number}</h2>
            </div>
        </div>
    );
};

export default MachineProduction;
