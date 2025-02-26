interface DashBoardContainerProps {
    title: string;
    icon: JSX.Element;
    data: string;
    color: string;
}

const DashBoardContainer: React.FC<DashBoardContainerProps> = ({ title, icon, color, data }) => {
    return (
        <div className='relative bg-white shadow-lg rounded-lg p-4 overflow-visible'>
            <div
                className={`absolute -top-6 left-6 ${color} text-white w-12 h-12 flex items-center justify-center rounded-full shadow-md`}
            >
                <i className='material-icons text-xl'>{icon}</i>
            </div>
            <div className='ml-14'>
                <p className='text-gray-500 text-sm'> {title}</p>
                <h3 className='text-gray-800 text-xl font-semibold'>{data}</h3>
            </div>
        </div>
    );
};

export default DashBoardContainer;
