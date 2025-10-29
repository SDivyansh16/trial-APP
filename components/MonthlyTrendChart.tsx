import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MonthlyTrendChartProps {
  data: { month: string; income: number; expenses: number }[];
}

const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="flex items-center justify-center h-full text-text-secondary">Not enough data for a monthly trend.</div>;
    }
    
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f472b6" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#f472b6" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 0, 0, 0.05)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
        <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fontSize: 12, fill: '#6b7280' }} />
        <Tooltip
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '0.75rem',
            color: '#1f2937',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
          }}
        />
        <Legend wrapperStyle={{color: '#4b5563', fontSize: '12px'}} />
        <Area type="monotone" dataKey="income" stroke="#38bdf8" strokeWidth={2} activeDot={{ r: 8 }} name="Income" fill="url(#colorIncome)" />
        <Area type="monotone" dataKey="expenses" stroke="#f472b6" strokeWidth={2} activeDot={{ r: 8 }} name="Expenses" fill="url(#colorExpenses)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendChart;