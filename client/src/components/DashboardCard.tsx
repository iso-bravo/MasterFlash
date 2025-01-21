interface DashboardCardProps {
    title: string;
    subtitle?: string;
    color: string;
    children: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, color, subtitle, children }) => {
    return (
        <div className='relative bg-white shadow-lg rounded-lg p-6 overflow-visible '>
            <div
                className={`absolute -top-6 inset-x-0 mx-auto rounded-md p-4 text-white flex flex-col items-center justify-center shadow-md ${color} w-[calc(100%+30px)]`}
            >
                <h2 className='text-lg font-semibold'>{title}</h2>
                {subtitle && <h3 className='text-sm font-medium mt-1'>{subtitle}</h3>}
            </div>
            <div className='pt-10'>{children}</div>
        </div>
    );
};

export default DashboardCard;
