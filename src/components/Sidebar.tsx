import { NavLink, useNavigate } from 'react-router-dom';
import { 
  History, 
  Users, 
  UserPlus, 
  LayoutDashboard, 
  LogOut, 
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useAuth } from '../App';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out.');
    navigate('/login');
  };

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/applicants', icon: Users, label: 'Applicants' },
    { to: '/applicants/add', icon: UserPlus, label: 'Add Applicant' },
  ];

  if (user?.role === 'Admin') {
    navItems.push({ to: '/users', icon: ShieldCheck, label: 'User Management' });
  }

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/20">
            GT
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight uppercase tracking-tight">GT-ASES</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Applicant System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon size={18} className="transition-transform group-hover:scale-110" />
            <span className="font-medium text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 mb-4 border border-slate-700/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {user?.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate leading-none mb-1">{user?.fullName}</p>
              <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 text-sm font-medium transition-all group"
          >
            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
