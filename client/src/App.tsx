import React, { useState } from 'react';
import './App.css';
import './output.css';
import './index.css';
import Machine from './components/machine';
import Popup from './components/popUpMachine';
import { IoIosArrowRoundBack } from 'react-icons/io';

interface MachineData {
  name: string;
  state: string;
  employee_number: number;
}

const App: React.FC = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);

  const handleMachineClick = (machineData: MachineData) => {
    setPopupOpen(true);
    setSelectedMachine(machineData);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedMachine(null);
  };

  const handleSave = (newState: string) => {
    if (selectedMachine) {
      const updatedMachine: MachineData = {
        ...selectedMachine,
        state: newState,
      };
      setSelectedMachine(updatedMachine);
    }

    setPopupOpen(false);
  };

  const datos: MachineData[] = [
    { name: 'MP-01', state: 'Inactive', employee_number: 0 },
    { name: 'MP-02', state: 'Inactive', employee_number: 0 },
    { name: 'MP-03', state: 'Inactive', employee_number: 0 },
    { name: 'MP-04', state: 'Inactive', employee_number: 0 },
    { name: 'MP-05', state: 'Inactive', employee_number: 0 },
    { name: 'MP-07', state: 'Inactive', employee_number: 0 },
    { name: 'MP-08', state: 'Inactive', employee_number: 0 },
    { name: 'MP-09', state: 'Inactive', employee_number: 0 },
    { name: 'MP-10', state: 'Inactive', employee_number: 0 },
    { name: 'MP-11', state: 'Inactive', employee_number: 0 },
    { name: 'MP-12', state: 'Inactive', employee_number: 0 },
    { name: 'MP-13', state: 'Inactive', employee_number: 0 },
    { name: 'MP-15', state: 'Inactive', employee_number: 0 },
    { name: 'MP-16', state: 'Inactive', employee_number: 0 },
    { name: 'MP-17', state: 'Inactive', employee_number: 0 },
    { name: 'MP-18', state: 'Inactive', employee_number: 0 },
    { name: 'MP-22', state: 'Inactive', employee_number: 0 },
    { name: 'MP-23', state: 'Inactive', employee_number: 0 },
    { name: 'MP-24', state: 'Inactive', employee_number: 0 },
    { name: 'MP-25', state: 'Inactive', employee_number: 0 },
    { name: 'MP-26', state: 'Inactive', employee_number: 0 },
  ];

  return (
    <div className=' lg:p-2'>
      <div className='flex flex-wrap items-center justify-center'>
        <IoIosArrowRoundBack size={65} className='cursor-pointer absolute left-0' />
        <div className='text-center'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl xl:text-5xl'>PRENSAS</h1>
        </div>
      </div>
      <div className='flex flex-wrap justify-center'>
        {datos.map((dato, index) => (
          <Machine
            key={index}
            {...dato}
            onClick={() => handleMachineClick(dato)}
            selectedState={selectedMachine ? selectedMachine.state : ''}
          />
        ))}
      </div>

      {isPopupOpen && selectedMachine && (
        <Popup machineData={selectedMachine} onClose={handleClosePopup}/>
      )}
    </div>
  );
};

export default App;
