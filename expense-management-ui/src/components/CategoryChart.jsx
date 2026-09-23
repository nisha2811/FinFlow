import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

function CategoryChart({ data }) {
  const COLORS = [
    "#2D6A4F",
    "#52B788",
    "#74C69D",
    "#95D5B2",
    "#40916C",
    "#1B4332",
  ];

  const sortedData = [...data].sort((a, b) => b.amount - a.amount);

  return (
    <ResponsiveContainer
      width="100%"
      height={250}
    >
      <BarChart
        layout="vertical"
        data={sortedData}
        margin={{
          top: 20,
          right: 30,
          left: 100,
          bottom: 10,
        }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#e2e8f0"
        />

        <XAxis
          type="number"
          tick={{
            fill: "#64748B",
          }}
        />

        <YAxis
          dataKey="category"
          type="category"
          tick={{
            fill: "#1E293B",
            fontWeight: 600,
          }}
        />

        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "none",
            boxShadow:
              "0 8px 20px rgba(0,0,0,0.12)",
          }}
        />

        <Bar
          dataKey="amount"
          radius={[8, 8, 8, 8]}
        >
          {sortedData.map(
            (_, index) => (
              <Cell
                key={index}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            )
          )}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default CategoryChart;