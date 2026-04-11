import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Trash2, History } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function AssessmentHistoryTable({ history, onDelete }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-12 text-center shadow-sm">
        <History className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900 mb-1">No Historical Data</h2>
        <p className="text-sm text-slate-500">Run simulations to begin tracking risk metrics over time.</p>
      </div>
    );
  }

  // Sort history chronologically for the chart
  const sortedHistory = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const chartData = {
    labels: sortedHistory.map(item => {
      const d = new Date(item.createdAt);
      return `${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
    }),
    datasets: [
      {
        label: 'Overall Risk Score',
        data: sortedHistory.map(item => item.riskScore),
        borderColor: 'rgba(15, 23, 42, 0.9)', // slate-900
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        tension: 0.4,
        borderWidth: 2,
        pointBackgroundColor: 'rgba(56, 189, 248, 1)', // Light blue point
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12,
        titleFont: { family: 'Inter', size: 13 },
        bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(241, 245, 249, 1)' }, // slate-100
        border: { dash: [4, 4] }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Line Chart Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner"><History className="w-5 h-5" /></div>
          <h2 className="text-xl font-extrabold text-slate-900 heading-font">Risk Score Trajectory</h2>
        </div>
        <div className="h-64 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Table Section */}
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Overall Score</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Risk Level</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Weather</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Flood</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Seismic</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100/80">
              {history.map((item) => {
                const isHigh = item.riskLevel === "HIGH";
                const isMed = item.riskLevel === "MEDIUM";
                const badgeStyle = isHigh ? "bg-rose-50 text-rose-700 border-rose-200" : isMed ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

                return (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 text-sm font-medium text-slate-600 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 text-lg">
                      {item.riskScore}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest border shadow-sm ${badgeStyle}`}>
                        {item.riskLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{item.weatherScore}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{item.floodScore}</td>
                    <td className="px-6 py-4 font-semibold text-slate-600">{item.earthquakeScore}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDelete(item._id)}
                          className="p-2 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-100 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
