import { useEffect, useState } from 'react';
import { IoClose } from 'react-icons/io5';

interface MonthlyGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (target_amount: number, month: number, year: number) => Promise<void>;
}

const MonthlyGoalModal: React.FC<MonthlyGoalModalProps> = ({ isOpen, onClose, onSave }) => {
    const [goal, setGoal] = useState('');
    const [monthYear, setMonthYear] = useState('');

    useEffect(() => {
        if (isOpen) {
            setGoal('');
            setMonthYear('');
        }
    }, [isOpen]);

    const handleSubmit = () => {
        const numGoal = parseInt(goal);
        const [year, month] = monthYear.split('-').map(num => parseInt(num));
        onSave(numGoal, month, year);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50'>
            <div className='bg-white rounded-lg shadow-lg p-6 w-3/4 md:w-1/2 lg:w-1/3'>
                <header className='flex flex-row justify-between'>
                    <h2 className='text-xl font-semibold mb-4'>Agregar Meta Mensual</h2>
                    <IoClose size={40} className='cursor-pointer' onClick={onClose} />
                </header>
                <input
                    type='month'
                    value={monthYear}
                    onChange={e => setMonthYear(e.target.value)}
                    placeholder='Mes'
                    className='border p-2 rounded w-full mb-4'
                />
                <input
                    type='number'
                    value={goal}
                    onChange={e => setGoal(e.target.value)}
                    placeholder='Meta mensual'
                    className='border p-2 rounded w-full mb-4'
                />
                <div className='flex justify-end gap-4'>
                    <button
                        onClick={handleSubmit}
                        className='bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 cursor-pointer'
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MonthlyGoalModal;
