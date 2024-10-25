interface ProgressBarProps {
    progress: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    return (
        <div className='w-full bg-gray-400 rounded-full h-2.5 mb-6 mt-6' >
            <div className='bg-blue-600 h-2.5 rounded-full' style={{ width: `${progress}%` }}></div>
        </div>
    );
};

export default ProgressBar;
