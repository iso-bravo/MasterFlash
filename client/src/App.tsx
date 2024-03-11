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
    { name: 'MP-01', state: 'Running', employee_number: 1 },
    { name: 'MP-02', state: 'Inactive', employee_number: 2 },
    { name: 'MP-03', state: 'Pause', employee_number: 3 },
    { name: 'MP-04', state: 'Failure', employee_number: 4 },
    { name: 'MP-05', state: 'Running', employee_number: 5 },
    { name: 'MP-06', state: 'Inactive', employee_number: 6 },
    { name: 'MP-07', state: 'Pause', employee_number: 7 },
    { name: 'MP-08', state: 'Failure', employee_number: 8 },
    { name: 'MP-09', state: 'Running', employee_number: 9 },
    { name: 'MP-01', state: 'Inactive', employee_number: 10 },
    { name: 'MP-01', state: 'Pause', employee_number: 11 },
    { name: 'MP-01', state: 'Failure', employee_number: 12 },
    { name: 'MP-01', state: 'Running', employee_number: 13 },
    { name: 'MP-01', state: 'Inactive', employee_number: 14 },
    { name: 'MP-01', state: 'Pause', employee_number: 15 },
    { name: 'MP-01', state: 'Failure', employee_number: 16 },
    { name: 'MP-01', state: 'Running', employee_number: 17 },
    { name: 'MP-01', state: 'Inactive', employee_number: 18 },
    { name: 'MP-01', state: 'Pause', employee_number: 19 },
    { name: 'MP-01', state: 'Failure', employee_number: 20 },
    { name: 'MP-01', state: 'Running', employee_number: 21 },
    { name: 'MP-01', state: 'Inactive', employee_number: 22 },
    { name: 'MP-01', state: 'Pause', employee_number: 23 },
    { name: 'MP-01', state: 'Failure', employee_number: 24 },
    { name: 'MP-01', state: 'Running', employee_number: 25 },
    { name: 'MP-01', state: 'Inactive', employee_number: 26 },
    { name: 'MP-01', state: 'Pause', employee_number: 27 },
  ];

  return (
    <div className=' lg:p-9'>
      <div className='flex flex-wrap items-center'>
        <IoIosArrowRoundBack size={65} className=' cursor-pointer' />
        <h1 className='text-3xl md:text-4xl lg:text-5xl'>Prensas</h1>
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
