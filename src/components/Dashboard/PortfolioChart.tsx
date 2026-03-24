import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

const PIE_DATA = [
  { name: 'Stocks', value: 55, color: '#2563eb' },
  { name: 'ETFs', value: 25, color: '#4f46e5' },
  { name: 'Bonds', value: 10, color: '#0891b2' },
  { name: 'Cash', value: 10, color: '#10b981' },
];

const LINE_DATA = [
  { time: '09:00', value: 42000 },
  { time: '10:00', value: 42500 },
  { time: '11:00', value: 41800 },
  { time: '12:00', value: 43200 },
  { time: '13:00', value: 44100 },
  { time: '14:00', value: 43800 },
  { time: '15:00', value: 45000 },
];

export const PortfolioChart: React.FC<{ data?: any[] }> = ({ data = PIE_DATA }) => {
  const isEmpty = !data || data.length === 0 || data.every(item => item.value === 0);

  return (
    <div className="h-full flex flex-col space-y-4 min-h-[250px]">
      <div className="h-48 relative">
        {isEmpty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-surface/50 rounded-xl border border-dashed border-border">
            <Activity size={32} className="text-brand/20 mb-2" />
            <p className="text-xs font-bold text-ink-muted">No Assets Found</p>
            <p className="text-[10px] text-ink-muted mt-1">Start trading to see your allocation</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                itemStyle={{ color: '#0f172a' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
      {!isEmpty && (
        <div className="grid grid-cols-2 gap-2">
          {data.map((item) => (
            <div key={item.name} className="flex items-center space-x-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-ink-muted">{item.name}</span>
              <span className="text-ink font-bold">{item.value}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const PnLChart: React.FC<{ data?: any[] }> = ({ data = LINE_DATA }) => {
  const isEmpty = !data || data.length === 0;

  return (
    <div className="h-full w-full min-h-[200px] relative">
      {isEmpty ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-surface/50 rounded-xl border border-dashed border-border">
          <TrendingUp size={32} className="text-brand/20 mb-2" />
          <p className="text-xs font-bold text-ink-muted">No Performance Data</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="time" 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              itemStyle={{ color: '#0f172a' }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={2} 
              dot={false}
              animationDuration={2000}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};
