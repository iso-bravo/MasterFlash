import { Bar, BarChart, CartesianGrid, Legend, Rectangle, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const WeekProductionChart = () => {
    const fakeData = [
        { day: 'Monday', production: 120 },
        { day: 'Tuesday', production: 150 },
        { day: 'Wednesday', production: 130 },
        { day: 'Thursday', production: 170 },
        { day: 'Friday', production: 160 },
        { day: 'Saturday', production: 110 },
        { day: 'Sunday', production: 90 },
    ];

    return (
            <ResponsiveContainer width='100%' height={300}>
                <BarChart
                    width={500}
                    height={300}
                    data={fakeData}
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
                    <Bar dataKey={'production'} fill='#82ca9d' activeBar={<Rectangle fill='#82ca9d' />} />
                </BarChart>
            </ResponsiveContainer>
    );
};

export default WeekProductionChart;
