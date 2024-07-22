import api from "../config/axiosConfig";
import React, { useEffect, useState } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import "../App.css";
import MachineProduction from "../components/machineProduction";
import Popup from "../components/popUpProduction";
import "../index.css";
import "../output.css";
import { useNavigate } from "react-router-dom";

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
  const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(
    null
  );
  const navigate = useNavigate();

  const fetchMachineData = () => {
    api
      .get("/load_machine_data_production/", {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((response) => {
        setMachines(response.data.machines_data);
        setTotalPiecesProduced(response.data.total_piecesProduced);
      })
      .catch((error) => {
        console.error("Error fetching machines:", error);
      });
  };

  useEffect(() => {
    fetchMachineData();
  })

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
    let pieces_okAdd: number;
    let pieces_reworkAdd: number;
    let produced: number;
    let total_okAdd: number;
    setMachines(
      machines.map((machine) => {
        if (machine.name === updatedMachine.name) {
          if (
            updatedMachine.part_number == null ||
            updatedMachine.part_number == "" ||
            updatedMachine.part_number == machine.part_number
          ) {
            updatedMachine.part_number = machine.part_number;
          } else {
            updatedMachine.total_ok = '0';
          }

          if (
            updatedMachine.work_order == null ||
            updatedMachine.work_order == ""
          ) {
            updatedMachine.work_order = machine.work_order;
            if (updatedMachine.total_ok != '0') {
              total_okAdd =
              parseInt(machine.total_ok) + parseInt(updatedMachine.pieces_ok);
              updatedMachine.total_ok = total_okAdd.toString();
            }
          } else {
            updatedMachine.total_ok = '0';
          }

          if (
            updatedMachine.employee_number == null ||
            updatedMachine.employee_number == ""
          ) {
            updatedMachine.employee_number = machine.employee_number;
          }

          if (
            updatedMachine.pieces_ok == null ||
            updatedMachine.pieces_ok == ""
          ) {
            updatedMachine.pieces_ok = machine.pieces_ok;
          } else {
            if (updatedMachine.total_ok != '0') {
              total_okAdd =
              parseInt(machine.total_ok) + parseInt(updatedMachine.pieces_ok);
              updatedMachine.total_ok = total_okAdd.toString();
            }
            pieces_okAdd =
              parseInt(machine.pieces_ok) + parseInt(updatedMachine.pieces_ok);
            updatedMachine.pieces_ok = pieces_okAdd.toString();
            produced = parseInt(updatedMachine.pieces_ok)
            updateTotalProduced(produced);
          }
          if (
            updatedMachine.pieces_rework == null ||
            updatedMachine.pieces_rework == ""
          ) {
            updatedMachine.pieces_rework = machine.pieces_rework;
          } else {
            pieces_reworkAdd =
              parseInt(machine.pieces_rework) +
              parseInt(updatedMachine.pieces_rework);
            updatedMachine.pieces_rework = pieces_reworkAdd.toString();
          }

          if (updatedMachine.molder_number == null ||
            updatedMachine.molder_number == ""){
              updatedMachine.molder_number = machine.molder_number;
            }
          return updatedMachine;
        } else {
          return machine;
        }
      })
    );
  };

  const handleSave = async (
    newEmployeeNumber: string,
    newPiecesOK: string,
    newPiecesRework: string,
    newPartNumber: string,
    newWork_order: string,
    newMolderNumber: string
  ) => {
    if (!selectedMachine) return;
    // Optimistic update
    const updatedMachine: MachineData = {
      ...selectedMachine,
      state: selectedMachine.state,
      employee_number: newEmployeeNumber,
      pieces_ok: newPiecesOK,
      pieces_rework: newPiecesRework,
      part_number: newPartNumber,
      work_order: newWork_order,
      molder_number: newMolderNumber
    };
    setSelectedMachine(updatedMachine);

    try {
      await api.post(
          'register_data_production/',
          {
              name: selectedMachine.name,
              state: selectedMachine.state,
              employee_number: newEmployeeNumber,
              pieces_ok: newPiecesOK,
              pieces_rework: newPiecesRework,
              part_number: newPartNumber,
              work_order: newWork_order,
              molder_number: newMolderNumber,
          },
          {
              headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
              },
          },
      );
      console.log("Machine state updated successfully!");
    } catch (error) {
      console.error("Error updating machine state:", error);

      setSelectedMachine((machineData) => {
        if (machineData) return machineData;
        return null;
      });
    }

    setPopUpOpen(false);
  };

  return (
    <div className="lg:p-2">
      <div className="flex flex-wrap items-center justify-center">
        <IoIosArrowRoundBack
          size={65}
          className="cursor-pointer absolute left-0"
          onClick={() => navigate('/')}
        />
        <div className="flex flex-col md:flex-row text-center gap-3 items-center">
          <h1 className="font-semibold text-2xl md:text-3xl lg:text-3xl xl:text-4xl">
            Producción de Prensas:
          </h1>
          <h1 className="font-semibold text-3xl md:text-4xl lg:text-4xl xl:text-4xl">
            {totalPiecesProduced}
          </h1>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-x-2 gap-y-4 justify-items-center">
        {machines.map((machine, index) => (
          <MachineProduction
            key={index}
            machineData={machine}
            onClick={() => handleMachineClick(machine)}
            selectedState={selectedMachine ? selectedMachine.state : ""}
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
