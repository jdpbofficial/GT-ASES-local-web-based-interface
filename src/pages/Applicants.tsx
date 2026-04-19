import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Download,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  ChevronDown,
  UserPlus
} from 'lucide-react';
import { Applicant } from '../types';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export default function Applicants() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'All');

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) {
      setStatusFilter(status);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchApplicants();
  }, []);

  const fetchApplicants = () => {
    setLoading(true);
    fetch('/api/applicants')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setApplicants(data);
        } else {
          console.error('Expected array of applicants, got:', data);
          setApplicants([]);
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setApplicants([]);
      })
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this applicant?')) return;
    
    const res = await fetch(`/api/applicants/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setApplicants(applicants.filter(a => a.applicantID !== id));
      toast.success('Applicant record has been permanently removed.');
    } else {
      toast.error('Failed to delete applicant record.');
    }
  };

  const filteredApplicants = applicants.filter(app => {
    const matchesSearch = 
      `${app.firstName} ${app.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Qualified': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'For Review': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Disqualified': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    if (status === 'All') {
      setSearchParams({});
    } else {
      setSearchParams({ status });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-slate-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Applicants Directory</h1>
          <p className="text-slate-500 font-medium">Manage and review all incoming applications.</p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <button 
            onClick={() => toast.info('Export functionality is being prepared...')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 transition-all font-sans"
          >
            <Download size={18} />
            Export CSV
          </button>
          <Link 
            to="/applicants/add"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95"
          >
            <UserPlus size={18} />
            Add New
          </Link>
        </div>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email, or position..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 text-slate-900 pl-11 pr-4 py-3.5 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Qualified', 'For Review', 'Disqualified'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-6 py-3.5 rounded-2xl font-bold text-sm transition-all border whitespace-nowrap ${
                statusFilter === status 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <div className="col-span-full py-20 text-center font-bold text-slate-400 uppercase tracking-widest">
              Processing data...
            </div>
          ) : filteredApplicants.length > 0 ? (
            filteredApplicants.map((app, idx) => (
              <motion.div
                key={app.applicantID}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-2xl border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                      {app.firstName.charAt(0)}{app.lastName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 leading-tight">
                        {app.firstName} {app.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-black uppercase tracking-wider ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 text-xs font-semibold">ID: #{app.applicantID}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link 
                      to={`/applicants/edit/${app.applicantID}`}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                    >
                      <Edit2 size={16} />
                    </Link>
                    <button 
                      onClick={() => handleDelete(app.applicantID)}
                      className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6 mb-6">
                  <div className="flex items-center gap-3 group/item">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                      <Briefcase size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Position</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{app.position}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group/item">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                      <GraduationCap size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Education</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{app.education}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group/item">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                      <Mail size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Email</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{app.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group/item">
                    <div className="p-2 rounded-lg bg-slate-50 text-slate-400 group-hover/item:text-blue-500 transition-colors">
                      <Phone size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Contact</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{app.contact}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                  <div className="flex -space-x-2">
                    {app.skills.slice(0, 3).map((skill, i) => (
                      <div key={i} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 shadow-sm relative z-10 hover:z-20 hover:scale-110 transition-transform cursor-default">
                        {skill}
                      </div>
                    ))}
                    {app.skills.length > 3 && (
                      <div className="px-2 py-1 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-bold text-slate-500 shadow-sm relative z-0">
                        +{app.skills.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Screening Score</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${app.score >= 80 ? 'bg-emerald-500' : app.score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <span className="text-lg font-black text-slate-900 font-mono tracking-tighter">{app.score}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-[2rem] border border-slate-200 border-dashed text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 mx-auto mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No matching applicants</h3>
              <p className="text-slate-500 max-w-sm mx-auto">
                We couldn't find any applicants matching your current search or filter criteria.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                className="mt-6 text-blue-600 font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
