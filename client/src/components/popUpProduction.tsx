import React, { ChangeEvent, useRef, useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { IoClose } from "react-icons/io5";

interface PopupProps {
  machineData: {
    name: string;
    state: string;
    employee_number: string;
    pieces_ok: string;
    pieces_rework: string;
    part_number: string;
    work_order: string;
    total_ok: string;
    molder_number: string;

  };
  onClose: () => void;
  onSave: (
    newEmployeeNumber: string,
    newPiecesOK: string,
    newPiecesRework: string,
    newPartNumber: string,
    newWork_order: string,
    newMolderNumber: string
  ) => Promise<void>;
}

const Popup: React.FC<PopupProps> = ({
  machineData,
  onClose,
  onSave,
}) => {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [piecesOK, setPiecesOK] = useState("");
  const [piecesRework, setPiecesRework] = useState("");
  const [workOrder, setWorkOrder] = useState("");
  const [molderNumber, setMolderNumber] = useState("");

  // Refs for input elements
  const workOrderRef = useRef<HTMLInputElement>(null);
  const partNumberRef = useRef<HTMLInputElement>(null);
  const employeeNumberRef = useRef<HTMLInputElement>(null);
  const molderNumberRef = useRef<HTMLInputElement>(null);
  const piecesOKRef = useRef<HTMLInputElement>(null);
  const piecesReworkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (workOrderRef.current) {
      workOrderRef.current.focus();
    }
  }, []);

  useEffect(()=>{
    if (workOrder || partNumber){
      setPiecesOK("0")
      setPiecesRework("0")
    }
  },[workOrder,partNumber])

  const handleEmployeeNumber = (event: ChangeEvent<HTMLInputElement>) => {
    setEmployeeNumber(event.target.value);
  };

  const handlePartNumber = (event: ChangeEvent<HTMLInputElement>) => {
    setPartNumber(event.target.value);
  };

  const handlePiecesOk = (event: ChangeEvent<HTMLInputElement>) => {
    setPiecesOK(event.target.value);
  };

  const handlePiecesRework = (event: ChangeEvent<HTMLInputElement>) => {
    setPiecesRework(event.target.value);
  };

  const handleworkOrder = (event: ChangeEvent<HTMLInputElement>) => {
    setWorkOrder(event.target.value);
  };

  const handMolderNumber = (event: ChangeEvent<HTMLInputElement>) => {
    setMolderNumber(event.target.value);
  };


  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    nextRef: React.RefObject<HTMLInputElement> | null
  ) => {
    if (event.key === "Enter" && nextRef && nextRef.current) {
      event.preventDefault();
      nextRef.current.focus();
    }
  };

  const handleSave = async () => {
    try {
      await onSave(
        employeeNumber,
        piecesOK,
        piecesRework,
        partNumber,
        workOrder,
        molderNumber
      );
      onClose();
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40">
      <Toaster />
      <div className="bg-[#E4E3E3] px-7 py-5 pb-14 rounded-md h-auto flex flex-col sm:w-3/4 md:w-2/3 lg:w-2/4">
        <div className="flex justify-end">
          <IoClose size={40} className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-col items-center justify-center gap-y-6">
          <h1 className="text-2xl lg:text-2xl xl:text-3xl font-semibold">
            {machineData.name}
          </h1>

          <div className="flex flex-col gap-y-4 text-center sm:text-start">
            <div className="flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5">
              <label htmlFor="workOrderInput" className="text-xl w-11/12 md:w-1/2">
                Orden de Trabajo
              </label>
              <input
                type="text"
                id="workOrderInput"
                value={workOrder}
                onChange={handleworkOrder}
                ref={workOrderRef}
                onKeyDown={(e) => handleKeyDown(e, partNumberRef)}
                className="bg-white rounded-md w-full md:w-64 px-2"
                placeholder={`${machineData.work_order}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5">
              <label htmlFor="partNumberInput" className="text-xl w-11/12 md:w-1/2">
                Número de parte
              </label>
              <input
                type="text"
                id="partNumberInput"
                value={partNumber}
                onChange={handlePartNumber}
                ref={partNumberRef}
                onKeyDown={(e) => handleKeyDown(e, employeeNumberRef)}
                className="bg-white rounded-md w-full md:w-64 px-2"
                placeholder={`${machineData.part_number}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5">
              <label
                htmlFor="employeeNumberInput"
                className="text-xl w-11/12 md:w-1/2"
              >
                Empacador
              </label>
              <input
                type="number"
                id="employeeNumberInput"
                value={employeeNumber}
                onChange={handleEmployeeNumber}
                ref={employeeNumberRef}
                onKeyDown={(e) => handleKeyDown(e, molderNumberRef)}
                className="bg-white rounded-md w-full md:w-64 px-2"
                placeholder={`${machineData.employee_number}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5">
              <label
                htmlFor="molderNumberInput"
                className="text-xl w-11/12 md:w-1/2"
              >
                Moldeador
              </label>
              <input
                type="number"
                id="molderNumberInput"
                value={molderNumber}
                onChange={handMolderNumber}
                ref={molderNumberRef}
                onKeyDown={(e) => handleKeyDown(e, piecesOKRef)}
                className="bg-white rounded-md w-full md:w-64 px-2"
                placeholder={`${machineData.molder_number}`}
              />
            </div>
            <div className="flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5">
              <label htmlFor="piecesOKInput" className="text-xl w-11/12 md:w-1/2">
                Piezas Producidas
              </label>
              <input
                type="number"
                id="piecesOKInput"
                value={piecesOK}
                onChange={handlePiecesOk}
                ref={piecesOKRef}
                onKeyDown={(e) => handleKeyDown(e, piecesReworkRef)}
                placeholder={`${machineData.pieces_ok}`}
                className="bg-white rounded-md w-full md:w-64 px-2"
                min="0"
              />
            </div>
            <div className="flex flex-col sm:flex-row md:flex-row gap-y-4 md:gap-x-5">
              <label htmlFor="piecesReworkInput" className="text-xl w-11/12 md:w-1/2">
                Piezas Retrabajo
              </label>
              <input
                type="number"
                id="piecesReworkInput"
                value={piecesRework}
                onChange={handlePiecesRework}
                ref={piecesReworkRef}
                onKeyDown={(e) => handleKeyDown(e, null)}
                placeholder={`${machineData.pieces_rework}`}
                className="bg-white rounded-md w-full md:w-64 px-2"
                min="0"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            className="bg-[#73e33c] px-6 py-2 text-xl rounded-md hover:bg-[#78e741] focus:outline-none focus:ring focus:ring-[#3fd555]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
