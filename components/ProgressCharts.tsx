import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { WorkoutSession, ExerciseStat } from '../types';

interface Props {
  exerciseId: string;
  history: WorkoutSession[];
}

const ProgressCharts: React.FC<Props> = ({ exerciseId, history }) => {
  // Transform history into chart data
  const data: ExerciseStat[] = history
    .filter(session => session.logs.some(l => l.exerciseId === exerciseId))
    .map(session => {
      const log = session.logs.find(l => l.exerciseId === exerciseId);
      if (!log) return { date: '', topWeight: 0, volumeLoad: 0 };

      // Calculate Top Weight (Max weight lifted in a non-drop set)
      const topWeight = Math.max(...log.sets.filter(s => !s.isDropSet).map(s => s.weight));

      // Calculate Volume Load (Sum of all weight * reps)
      const volumeLoad = log.sets.reduce((acc, curr) => {
        const reps = typeof curr.reps === 'number' ? curr.reps : 0;
        return acc + (curr.weight * reps);
      }, 0);

      return {
        date: new Date(session.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        topWeight: topWeight > 0 ? topWeight : 0,
        volumeLoad
      };
    })
    // Sort by date ascending
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500 bg-zinc-900/50 rounded-lg border border-zinc-800 border-dashed">
        Not enough data to display progress charts yet.
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6">
      <div className="w-full">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Strength Progression (Top Weight)
        </h4>
        <div className="h-64 w-full bg-zinc-900/20 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} domain={['auto', 'auto']} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                    wrapperStyle={{ zIndex: 100 }}
                    cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                />
                <Line 
                    type="monotone" 
                    dataKey="topWeight" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#000', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#3b82f6' }} 
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>

      <div className="w-full">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Work Capacity (Volume Load)
        </h4>
        <div className="h-64 w-full bg-zinc-900/20 rounded-lg">
            <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#52525b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#6366f1' }}
                    wrapperStyle={{ zIndex: 100 }}
                    cursor={{ stroke: '#3f3f46', strokeWidth: 1 }}
                />
                <Line 
                    type="monotone" 
                    dataKey="volumeLoad" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    dot={{ fill: '#000', stroke: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#6366f1' }} 
                />
            </LineChart>
            </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-zinc-500 mt-2 leading-relaxed">
            *Volume Load includes main sets + drop sets. This line increasing means hypertrophy is occurring even if Top Weight stalls.
        </p>
      </div>
    </div>
  );
};

export default ProgressCharts;