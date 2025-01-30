import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnualProduction } from '../types/DashBoardTypes';

interface AnualProductionChartProps {
    data: AnualProduction[];
}

const AnualProductionChart: React.FC<AnualProductionChartProps> = ({ data }) => {
    return (
        <ResponsiveContainer width='100%' height={300}>
            <ComposedChart
                width={500}
                height={400}
                data={data}
                margin={{
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 20,
                }}
            >
                <CartesianGrid stroke='#f5f5f5' />
                <XAxis dataKey='month' scale={'band'}/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={'pieces_ok'} fill='#82ca9d' />
                <Line type={'monotone'} dataKey={'goal'} stroke='#F97316' />
            </ComposedChart>
        </ResponsiveContainer>
    );
};

export default AnualProductionChart;
