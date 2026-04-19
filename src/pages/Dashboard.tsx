import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  TrendingUp, 
  Calendar,
  ArrowUpRight,
  UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Applicant } from '../types';
import SystemGuide from '../components/SystemGuide';

interface Stats {
  total: number;
  qualified: number;
  forReview: number;
  disqualified: number;
}

export default function Dashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/stats').then(res => res.json()),
      fetch('/api/applicants').then(res => res.json())
    ]).then(([statsData, applicantsData]) => {
      setStats(statsData);
      if (Array.isArray(applicantsData)) {
        setApplicants(applicantsData.slice(-5).reverse());
      }
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  const statCards = [
    { label: 'Total Applicants', value: stats?.total, icon: Users, color: 'blue' },
    { label: 'Qualified', value: stats?.qualified, icon: CheckCircle2, color: 'emerald' },
    { label: 'For Review', value: stats?.forReview, icon: AlertCircle, color: 'amber' },
    { label: 'Disqualified', value: stats?.disqualified, icon: XCircle, color: 'rose' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <SystemGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Overview Dashboard</h1>
          <p className="text-slate-500 font-medium">Monitoring the recruitment funnel and screening status.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 text-sm font-semibold shadow-sm">
            <Calendar size={16} />
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <Link 
            to="/applicants/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            New Applicant
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group"
          >
            <Link 
              to={card.label === 'Total Applicants' ? '/applicants' : `/applicants?status=${card.label}`}
              className="block h-full bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className={`absolute -right-4 -top-4 w-24 h-24 bg-${card.color}-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl bg-${card.color}-50 text-${card.color}-600`}>
                  <card.icon size={24} />
                </div>
                <div className="flex items-center gap-1 text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded-lg text-xs">
                  <TrendingUp size={12} />
                  <span>+12%</span>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-1">{card.label}</h3>
                <p className="text-4xl font-black text-slate-900 tracking-tight">{card.value}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                <span className="group-hover:text-blue-600 transition-colors">View Report</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-blue-600 transition-all" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Applications</h2>
            <Link to="/applicants" className="text-sm font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4">View All</Link>
          </div>
          <div className="p-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50">
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Position</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applicants.length > 0 ? applicants.map((app) => (
                    <tr key={app.applicantID} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                            {app.firstName.charAt(0)}{app.lastName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{app.firstName} {app.lastName}</p>
                            <p className="text-slate-500 text-xs">{app.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-600">{app.position}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'Qualified' ? 'bg-emerald-50 text-emerald-600' : 
                          app.status === 'For Review' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900">{app.score}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-medium">No recent applications found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-4">Ported Version 1.0</h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Welcome to the web-based interface of GT-ASES. We have successfully ported the desktop logic to this modern, cloud-native platform.
              </p>
              <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 flex items-center justify-between mb-6">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Current Environment</p>
                  <p className="text-sm font-bold">Production Preview</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <button 
                onClick={() => setShowGuide(true)}
                className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-indigo-50 transition-colors shadow-lg active:scale-95"
              >
                System Guide
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              Screening Insights
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Qualified Rate</span>
                  <span>45%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="h-full bg-emerald-500" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Avg Score</span>
                  <span>72</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '72%' }} className="h-full bg-blue-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
