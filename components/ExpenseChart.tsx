import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DrillDownFilter } from '../types';

interface ExpenseChartProps {
    data: { name: string; value: number }[];
    onDrillDown: (filter: DrillDownFilter) => void;
}

const COLORS = ['#38bdf8', '#f472b6', '#fbbf24', '#a3e635', '#818cf8', '#d946ef', '#f43f5e', '#34d399'];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/70 backdrop-blur-sm p-2 border border-white/30 rounded-lg shadow-lg">
                <p className="font-semibold text-text-primary">{`${payload[0].name}`}</p>
                <p className="text-sm text-text-secondary">{`$${payload[0].value.toFixed(2)} (${(payload[0].percent * 100).toFixed(0)}%)`}</p>
            </div>
        );
    }
    return null;
};

const ExpenseChart: React.FC<ExpenseChartProps> = ({ data, onDrillDown }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">No expense data to display.</div>;
    }

    const handlePieClick = (payload: any) => {
        if (payload && payload.name) {
            onDrillDown({ type: 'category', value: payload.name });
        }
    };

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
                    onClick={handlePieClick}
                    cursor="pointer"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} verticalAlign="bottom" wrapperStyle={{color: '#6b7280', fontSize: '12px'}} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default ExpenseChart;