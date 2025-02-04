import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AnualProduction } from '../types/DashBoardTypes';

interface AnualProductionChartProps {
  data: AnualProduction[];
}

const AnualProductionChart: React.FC<AnualProductionChartProps> = ({ data }) => {

  const months: { [key: number]: string } = {
    1: "Enero",
    2: "Febrero",
    3: "Marzo",
    4: "Abril",
    5: "Mayo",
    6: "Junio",
    7: "Julio",
    8: "Agosto",
    9: "Septiembre",
    10: "Octubre",
    11: "Noviembre",
    12: "Diciembre"
  }

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
        barCategoryGap={30}
        barGap={10}
      >
        <CartesianGrid stroke='#f5f5f5' />
        <XAxis dataKey='month' scale={'band'} tickFormatter={(month: number) => months[month]}
          padding={{ left: 10, right: 10, }}
        />
        <YAxis />
        <Tooltip labelFormatter={(month) => months[month]} />
        <Legend />
        <Bar dataKey={'Producción'} fill='#82ca9d' />
        <Line type={'monotone'} dataKey={'Goal'} stroke='#F97316' />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default AnualProductionChart;
