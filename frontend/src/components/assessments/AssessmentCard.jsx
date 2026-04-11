import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AssessmentCard({ latest }) {
  if (!latest) {
    return (
      <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-12 text-center shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Awaiting Assessment</h2>
        <p className="text-sm text-slate-500">Run a simulation to generate the latest risk score.</p>
      </div>
    );
  }

  const isHigh = latest.riskLevel === "HIGH";
  const isMed = latest.riskLevel === "MEDIUM";

  const levelStyle = isHigh
    ? "bg-rose-50 border-rose-200 text-rose-700"
    : isMed
    ? "bg-amber-50 border-amber-200 text-amber-700"
    : "bg-emerald-50 border-emerald-200 text-emerald-700";

  const Icon = isHigh ? AlertTriangle : isMed ? ShieldAlert : ShieldCheck;

  const chartData = {
    labels: ['Weather Risk', 'Flood Risk', 'Seismic Risk'],
    datasets: [
      {
        data: [latest.weatherScore || 0, latest.floodScore || 0, latest.earthquakeScore || 0],
        backgroundColor: [
          'rgba(14, 165, 233, 0.8)', // Sky
          'rgba(59, 130, 246, 0.8)', // Blue
          'rgba(245, 158, 11, 0.8)'  // Amber
        ],
        borderColor: [
          'rgba(14, 165, 233, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 'bold'
          },
          color: '#64748b'
        }
      }
    },
    cutout: '75%'
  };

  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white/90 glass-panel p-6 sm:p-8 shadow-md">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Metric Overview */}
        <div className="md:w-1/3 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 heading-font">Latest Assessment</h2>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest border shadow-sm ${levelStyle}`}>
              <Icon className="w-3.5 h-3.5" />
              {latest.riskLevel}
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 shadow-inner text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Overall composite Score</p>
            <p className="text-6xl font-extrabold text-slate-900 heading-font">{latest.riskScore}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 font-medium">
              <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span>Weather</span>
                <span className="font-bold text-sky-600">{latest.weatherScore}</span>
              </div>
              <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span>Flood</span>
                <span className="font-bold text-blue-600">{latest.floodScore}</span>
              </div>
              <div className="flex justify-between items-center bg-white px-3 py-2 rounded-xl border border-slate-100 shadow-sm">
                <span>Earthquake</span>
                <span className="font-bold text-amber-600">{latest.earthquakeScore}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Chart Setup */}
        <div className="md:w-2/3 h-64 md:h-80 relative flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
           <Doughnut data={chartData} options={chartOptions} />
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:-ml-[120px]">
             <div className="text-center">
                <span className="block text-3xl font-extrabold text-slate-800">{latest.riskScore}</span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">TOTAL</span>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
