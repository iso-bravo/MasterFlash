import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { IoIosArrowRoundBack } from 'react-icons/io';
import Machine from '../components/machine';
import Popup from '../components/popUpStates';
import '../App.css';
import '../index.css';
import '../output.css';
import { useNavigate } from "react-router-dom";

interface MachineData {
  name: string;
  state: string;
  employee_number: string;
}

const PressesStates: React.FC = () => {
  const [machines, setMachines] = useState<MachineData[]>([]);
  const [isPopupOpen, setPopupOpen] = useState(false);
  const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://192.168.10.7:8001/load_machine_data/',
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
    )
      .then(response => {
        setMachines(response.data);
      })
      .catch(error => {
        console.error('Error fetching machines:', error);
      });
  }, []);

  /*useEffect(() => {
    const ws = new WebSocket('ws://192.168.10.7:8001/ws/arduino_data/');
    
    ws.onopen = () => {
        console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
        handleUpdateMachine(data);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
  };
    
    ws.onclose = () => {
        console.log('WebSocket disconnected');
    };

    return () => {
        ws.close();
    };
}, []);
*/

  const handleMachineClick = (machineData: MachineData) => {
    setPopupOpen(true);
    setSelectedMachine(machineData);
  };

  const handleClosePopup = () => {
    setPopupOpen(false);
    setSelectedMachine(null);
  };

  const handleUpdateMachine = (updatedMachine: MachineData) => {
    console.log(updatedMachine.name);
    console.log(updatedMachine.employee_number);
    console.log(updatedMachine.state);
    setMachines(machines.map(machine => {
      if (machine.name === updatedMachine.name) {
        if(updatedMachine.state == null || updatedMachine.state == '') {
          updatedMachine.state = machine.state;
        }
        if (updatedMachine.employee_number == null || updatedMachine.employee_number == '') {
          updatedMachine.employee_number = machine.employee_number;
        }
        console.log(updatedMachine.name);
        console.log(updatedMachine.employee_number);
        console.log(updatedMachine.state);
        return updatedMachine;
      } else {
          return machine;
      }
  }));
  };

  const handleSave = async (newState: string, newEmployeeNumber: string, newComments: string) => {
    if (!selectedMachine) return;
    // Optimistic update
    const updatedMachine: MachineData = {
      ...selectedMachine,
      state: newState,
      employee_number: newEmployeeNumber,
    };
    setSelectedMachine(updatedMachine);

    try {
      await axios.post(
        "http://192.168.10.7:8001/client_data/",
        {
          name: selectedMachine.name,
          state: newState,
          employeeNumber: newEmployeeNumber,
          comments: newComments,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log("Machine state updated successfully!");
    } catch (error) {
      console.error("Error updating machine state:", error);
      
      setSelectedMachine(machineData => {
        if (machineData) return machineData;
        return null;
      });
    }

    setPopupOpen(false);
  };

  const generalPause = () => {
    handleGeneralPause();
    axios
      .post("http://192.168.10.7:8001/presses_general_pause/")
      .catch((error) => {
        console.error("Error pausing machines:", error);
      });
  };

  const generalFailure = () => {
    handleGeneralFailure();
    axios
      .post("http://192.168.10.7:8001/presses_general_failure/")
      .catch((error) => {
        console.error("Error failure machines:", error);
      });
  };

  const handleGeneralPause = () => {
    setMachines(machines.map(machine => {
      if (machine.state === 'Running') {
        return {
          ...machine,
          state: 'Pause'
        };
      }
      return machine;
    }));
  };
  
  const handleGeneralFailure = () => {
    setMachines(machines.map(machine => {
      if (machine.state === 'Running' || machine.state === 'Pause') {
        return {
          ...machine,
          state: 'Failure'
        };
      }
      return machine;
    }));
  };

  return (
    <div className=' lg:p-2'>
      <div className='flex flex-wrap items-center justify-center'>
        <IoIosArrowRoundBack size={65} className='cursor-pointer absolute left-0' 
          onClick={() => navigate('/')}/>
        <div className='text-center'>
          <h1 className='text-2xl md:text-3xl lg:text-4xl xl:text-5xl'>PRENSAS</h1>
        </div>
        <div className="flex items-end gap-1 absolute right-0 mr-2">
          <button className="rounded-sm text-white p-2 bg-[#E1CD1C] text-xs sm:text-sm md:text-base md:text-md lg:text-xl xl:text-xl"
            onClick={generalPause}>
            <span className="block custom:hidden">Pausa</span>
            <span className="hidden custom:block">Pausa General</span>
          </button>
          <button className="rounded-sm text-white p-2 bg-[#EF3333] text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl"
            onClick={generalFailure}>
            <span className="block custom:hidden">Falla</span>
            <span className="hidden custom:block">Falla General</span>
          </button>
        </div>
      </div>
      <div className='flex flex-wrap justify-center'>
        {machines.map((machine, index) => (
          <Machine
            key={index}
            machineData={machine}
            onClick={() => handleMachineClick(machine)}
            selectedState={selectedMachine ? selectedMachine.state : ''}
          />
        ))}
      </div>

      {isPopupOpen && selectedMachine && (
        <Popup machineData={selectedMachine}
        onClose={handleClosePopup}
        onSave={handleSave}
        onUpdate={handleUpdateMachine}/>
      )}
    </div>
  );
};

export default PressesStates;