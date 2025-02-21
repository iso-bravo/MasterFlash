import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WeekProduction } from '../types/DashBoardTypes';

interface WeekProductionChartProps {
  data: WeekProduction[];
}

const WeekProductionChart: React.FC<WeekProductionChartProps> = ({ data }) => {

  return (
    <ResponsiveContainer width='100%' height={300}>
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey={'day'} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={'Producción'} fill='#82ca9d' activeBar={<Rectangle fill='#82ca9d' />} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default WeekProductionChart;
