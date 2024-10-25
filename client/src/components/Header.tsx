import { IoIosArrowBack } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';

interface headerProps {
    title: string;
    goto?: string;
}

const Header: React.FC<headerProps> = ({ title, goto = '/' }) => {
    const navigate = useNavigate();

    return (
        <header className='flex items-start gap-3'>
            <IoIosArrowBack size={30} className='cursor-pointer' onClick={() => navigate(goto)} />
            <h1 className='text-xl'>{title}</h1>
        </header>
    );
};

export default Header;
