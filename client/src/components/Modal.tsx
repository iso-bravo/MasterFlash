import { IoClose } from 'react-icons/io5';

interface ModalProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ children, title, onClose }) => {
    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30'>
            <main className='bg-white p-6 rounded-md shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden'>
                <header className='flex flex-row justify-between items-center'>
                    {title && <h2 className='text-2xl font-bold mb-4'>{title}</h2>}
                    <IoClose size={30} className='cursor-pointer' onClick={onClose} />
                </header>
                {children}
            </main>
        </div>
    );
};

export default Modal;
