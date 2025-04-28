import {
	BarChart,
	Bar,
	ResponsiveContainer,
	CartesianGrid,
	Legend,
	Rectangle,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import { TopDefectsByMolderNumberResponse } from "../types/ScrapDashboardTypes";

interface MachineDefectsChartProps {
	data: TopDefectsByMolderNumberResponse;
}

const MachineDefectsChart: React.FC<MachineDefectsChartProps> = ({ data }) => {
	return (
		<ResponsiveContainer width="100%" height={300}>
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
				<CartesianGrid strokeDasharray="3 3" />
				<XAxis dataKey={"molder_number"} />
				<YAxis />
				<Tooltip />
				<Legend />
				<Bar
					dataKey={"total_defects"}
					fill="#82ca9d"
					activeBar={<Rectangle fill="#82ca9d" />}
				/>
			</BarChart>
		</ResponsiveContainer>
	);
};

export default MachineDefectsChart;
