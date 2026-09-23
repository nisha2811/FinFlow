import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function EmployeeChart({ data }) 
{
  return (
    <ResponsiveContainer
      width="100%"
      height={250}
    >
      <BarChart
        data={data}
        margin={{
          top: 20,
          right: 20,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
        />

        <XAxis
          dataKey="employee"
          tick={{
            fill: "#475569",
            fontSize: 12,
          }}
        />

        <YAxis
          tick={{
            fill: "#475569",
            fontSize: 12,
          }}
          allowDecimals={false}
        />

        <Tooltip />

        <Bar
          dataKey="count"
          fill="#2D6A4F"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default EmployeeChart