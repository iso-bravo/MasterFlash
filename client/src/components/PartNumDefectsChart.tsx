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
import type { TopDefectsByPartNumberResponse } from "../types/ScrapDashboardTypes";

interface MachineDefectsChartProps {
	data: TopDefectsByPartNumberResponse;
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
				<XAxis dataKey={"part_number"} />
				<YAxis />
				<Tooltip
					formatter={(value, name: string) => {
						if (name === "total_defects") {
							return [value, "Total de Defectos"];
						}
						return [value, name];
					}}
				/>
				<Legend
					formatter={(value: string) => {
						if (value === "total_defects") {
							return "Total de Defectos";
						}
						return value;
					}}
				/>
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
