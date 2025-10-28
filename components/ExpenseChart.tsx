import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ExpenseChartProps {
    data: { name: string; value: number }[];
}

const COLORS = ['#818cf8', '#4ade80', '#fbbf24', '#f472b6', '#38bdf8', '#a78bfa', '#e879f9', '#fb923c', '#c084fc', '#a3e635'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface p-2 border border-border-color rounded shadow-lg">
                <p className="font-semibold text-text-primary">{`${payload[0].name}`}</p>
                <p className="text-sm text-text-secondary">{`$${payload[0].value.toFixed(2)} (${(payload[0].percent * 100).toFixed(0)}%)`}</p>
            </div>
        );
    }
    return null;
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No expense data to display.</div>;
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={5}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} verticalAlign="bottom" wrapperStyle={{color: '#f9fafb'}} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpenseChart;