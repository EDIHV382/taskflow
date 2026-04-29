import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface StatusData {
  PENDING: number;
  IN_PROGRESS: number;
  COMPLETED: number;
}

interface StatusChartProps {
  data: StatusData;
}

const COLORS = {
  PENDING: '#9CA3AF',
  IN_PROGRESS: '#3B82F6',
  COMPLETED: '#8B5CF6',
};

const LABELS = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En progreso',
  COMPLETED: 'Completada',
};

export const StatusChart = ({ data }: StatusChartProps) => {
  const chartData = Object.entries(data).map(([key, value]) => ({
    name: LABELS[key as keyof StatusData],
    value,
    key,
  }));

  const total = Object.values(data).reduce((a, b) => a + b, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No hay datos disponibles
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-64"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.key as keyof StatusData]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value: number) => [`${value} tareas`, '']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string, _entry: any) => (
              <span className="text-gray-700 dark:text-gray-300">
                {value}: {chartData.find((d) => d.name === value)?.value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};
