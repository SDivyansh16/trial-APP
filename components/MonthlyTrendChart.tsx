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
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(107, 114, 128, 0.3)" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <YAxis tickFormatter={(value) => `$${Number(value) / 1000}k`} tick={{ fontSize: 12, fill: '#9ca3af' }} />
        <Tooltip
          formatter={(value: number) => `$${value.toFixed(2)}`}
          contentStyle={{
            backgroundColor: 'rgba(31, 41, 55, 0.8)',
            border: '1px solid #4b5563',
            borderRadius: '0.5rem',
            color: '#f9fafb'
          }}
        />
        <Legend wrapperStyle={{color: '#f9fafb'}} />
        <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} activeDot={{ r: 8 }} name="Income" fill="url(#colorIncome)" />
        <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} activeDot={{ r: 8 }} name="Expenses" fill="url(#colorExpenses)" />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default MonthlyTrendChart;