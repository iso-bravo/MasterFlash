import axios from "axios";
import React, { ChangeEvent, useState } from "react";
import { Toaster } from "react-hot-toast";
import { IoIosFlashOff, IoIosWarning } from "react-icons/io";
import { IoClose, IoPause } from "react-icons/io5";
import { SlEnergy } from "react-icons/sl";
import "react-toastify/dist/ReactToastify.css";

interface PopupProps {
  machineData: {
    name: string;
    state: string;
    employee_number: number;
  };
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ machineData, onClose }) => {
  const [employeeNumber, setEmployeeNumber] = useState("");
  const [selectedComment, setSelectedComment] = useState("");
  const [otherComment, setOtherComment] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmployeeNumber(event.target.value);
  };

  const handleSelectComment = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedComment(event.target.value);
  };

  const handleOtherComment = (event: ChangeEvent<HTMLInputElement>) => {
    setOtherComment(event.target.value);
  };

  const handleSelectState = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(event.target.value);
  };

  if (selectedComment && otherComment) {
    var comments = selectedComment + ", " + otherComment;
  } else if (selectedComment) {
    comments = selectedComment;
  } else if (otherComment) {
    comments = otherComment;
  } else {
    comments = "";
  }

  const handlePostRequest = async () => {
    try {
      const data = {
        name: machineData.name,
        state: selectedState,
        employeeNumber: employeeNumber,
        comments: comments,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/client_data/",
        data,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );

      console.log("Respuesta del servidor:", response.data);
    } catch (error) {
      console.error("Error al realizar la solicitud POST:", error);
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-40">
      <Toaster />
      <div className="bg-[#E4E3E3] px-7 py-5 rounded-md w-auto max-w-md md:max-w-2xl lg:max-w-2xl xl:max-w-3xl h-auto sm:h-auto flex flex-col">
        <div className="flex justify-end">
          <IoClose size={40} className="cursor-pointer" onClick={onClose} />
        </div>
        <div className="flex flex-col items-center justify-center gap-y-3">
          <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">
            {machineData.name}
          </h1>
          <div className="flex flex-col md:flex-row gap-y-4 md:gap-x-5">
            <label htmlFor="miInput" className="text-xl">
              Número de empleado
            </label>
            <input
              type="text"
              id="miInput"
              value={employeeNumber}
              onChange={handleChange}
              className="bg-white rounded-sm w-full md:w-64 px-2"
              placeholder={`${machineData.employee_number}`}
            />
          </div>
          <div className="flex flex-row gap-x-4">
            <div
              className="flex flex-col items-center justify-center
              focus:outline-none"
            >
              <p>Activo</p>
              <button
                className={`flex flex-col items-center justify-center
              focus:ring focus:ring-[#2eaa43]`}
                onClick={() => setSelectedState("Running")}
              >
                <SlEnergy
                  size={65}
                  color="white"
                  className=" bg-[#34C34B] p-3
                                cursor-pointer rounded-sm hover:bg-[#38d652]"
                />
              </button>
            </div>
            <div
              className="flex flex-col items-center justify-center
              focus:outline-none"
            >
              <p className="text-lg">Inactivo</p>
              <button
                className={`flex flex-col items-center justify-center focus:ring focus:ring-[#838383]`}
                onClick={() => setSelectedState("Inactive")}
              >
                <IoIosFlashOff
                  size={65}
                  color="white"
                  className="bg-[#959494] p-3
                                cursor-pointer rounded-sm hover:bg-[#a2a1a1]"
                />
              </button>
            </div>
            <div
              className="flex flex-col items-center justify-center
              focus:outline-none"
            >
              <p className="text-lg">Pausa</p>
              <button
                className={`flex flex-col items-center justify-center focus:ring focus:ring-[#cebc1a]`}
                onClick={() => setSelectedState("Pause")}
              >
                <IoPause
                  size={65}
                  color="white"
                  className="bg-[#E1CD1C] p-3
                                cursor-pointer rounded-sm hover:bg-[#e9d520]"
                />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center">
              <p className="text-lg">Falla</p>
              <button
                className={`flex flex-col items-center justify-center focus:outline-none focus:ring focus:ring-[#cf2626]`}
                onClick={() => setSelectedState("Failure")}
              >
                <IoIosWarning
                  size={65}
                  color="white"
                  className="bg-[#EF3333] p-3
                                cursor-pointer rounded-sm hover:bg-[#ff3838]"
                />
              </button>
            </div>
          </div>
          <p className="flex justify-end text-xl">Comentario</p>
          <select
            id="selectComment"
            value={selectedComment}
            onChange={handleSelectComment}
            className="bg-white rounded-sm w-full h-9 p-2"
          >
            <option value="" disabled>
              Seleccionar
            </option>
            <option value="option1">Opción 1</option>
            <option value="option2">Opción 2</option>
            <option value="option3">Opción 3</option>
          </select>
          <input
            type="text"
            placeholder="Otro comentario:"
            value={otherComment}
            onChange={handleOtherComment}
            className="bg-white rounded-sm w-full h-9 p-2"
          />
          <button
            onClick={() => {
              handlePostRequest();
              onClose();
            }}
            className="bg-[#00C7F3] px-6 py-3 text-xl rounded-md hover:bg-[#0cd3ff] focus:outline-none focus:ring focus:ring-[#22b2d2]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
