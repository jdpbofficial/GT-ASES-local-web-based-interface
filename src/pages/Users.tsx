import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Edit2, 
  ShieldCheck, 
  ShieldAlert,
  Search,
  Key,
  Mail,
  MoreVertical,
  XCircle
} from 'lucide-react';
import { User } from '../types';
import { toast } from 'sonner';

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: '', username: '', password: '', role: 'Staff' });
  const [actioningUser, setActioningUser] = useState<{ id: number; type: 'delete' | 'reset' } | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/users')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else {
          console.error('Expected array of users, got:', data);
          setUsers([]);
        }
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      toast.success(`User ${newUser.fullName} has been registered successfully.`);
      setShowAdd(false);
      setNewUser({ fullName: '', username: '', password: '', role: 'Staff' });
      fetchUsers();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to register user.');
    }
  };

  const confirmDelete = async (id: number) => {
    const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      toast.success('User account removed.');
      setActioningUser(null);
      fetchUsers();
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to delete user.');
    }
  };

  const confirmReset = async (id: number) => {
    if (!resetPassword) {
      toast.error('Please enter a new password.');
      return;
    }

    const res = await fetch(`/api/users/${id}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: resetPassword }),
    });

    if (res.ok) {
      toast.success('Password updated successfully.');
      setActioningUser(null);
      setResetPassword('');
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to reset password.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 font-medium">Manage system access and permissions for HR personnel.</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 transition-all active:scale-95"
        >
          <UserPlus size={18} />
          {showAdd ? 'Cancel' : 'Register New User'}
        </button>
      </header>

      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[2rem] border-2 border-slate-200 border-dashed p-8">
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    required
                    type="text"
                    value={newUser.fullName}
                    onChange={e => setNewUser({...newUser, fullName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="e.g. Jane Smith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username</label>
                  <input
                    required
                    type="text"
                    value={newUser.username}
                    onChange={e => setNewUser({...newUser, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="janesmith"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input
                    required
                    type="password"
                    value={newUser.password}
                    onChange={e => setNewUser({...newUser, password: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">System Role</label>
                  <div className="flex gap-2">
                    <select
                      value={newUser.role}
                      onChange={e => setNewUser({...newUser, role: e.target.value})}
                      className="flex-1 bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium appearance-none"
                    >
                      <option value="Staff">HR Staff</option>
                      <option value="Admin">HR Admin</option>
                    </select>
                    <button 
                      type="submit"
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/20">
              <Shield size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Accounts</h2>
              <p className="text-sm font-semibold text-slate-400">Total authorized system users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Find user..."
                className="bg-white border border-slate-200 pl-11 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-8 py-5">System Identity</th>
                  <th className="px-8 py-5">Access Level</th>
                  <th className="px-8 py-5">User ID</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan={4} className="p-20 text-center font-bold text-slate-300">Synchronizing database...</td></tr>
                ) : users.map((u) => (
                  <tr key={u.userID} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 duration-300 ${
                          u.role === 'Admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {u.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-base leading-tight mb-0.5">{u.fullName}</p>
                          <p className="text-slate-400 text-xs font-semibold">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border flex w-fit items-center gap-2 ${
                        u.role === 'Admin' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                          : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {u.role === 'Admin' ? <ShieldCheck size={12} /> : <ShieldAlert size={12} />}
                        {u.role} Role
                      </span>
                    </td>
                    <td className="px-8 py-5 font-mono font-bold text-slate-400 text-sm tracking-tighter">
                      #ID-00{u.userID}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-end gap-2">
                        <AnimatePresence mode="wait">
                          {actioningUser?.id === u.userID ? (
                            <motion.div 
                              initial={{ opacity: 0, x: 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl shadow-xl"
                            >
                              {actioningUser.type === 'delete' ? (
                                <>
                                  <span className="text-[10px] font-bold uppercase tracking-widest mr-2">Confirm Delete?</span>
                                  <button onClick={() => confirmDelete(u.userID)} className="p-1 hover:text-rose-400 transition-colors"><ShieldCheck size={16}/></button>
                                  <button onClick={() => setActioningUser(null)} className="p-1 hover:text-slate-400 transition-colors"><XCircle size={16}/></button>
                                </>
                              ) : (
                                <>
                                  <input 
                                    autoFocus
                                    type="password" 
                                    placeholder="New Pass"
                                    value={resetPassword}
                                    onChange={(e) => setResetPassword(e.target.value)}
                                    className="bg-slate-800 border-none text-[10px] py-1 px-2 rounded-lg focus:ring-0 w-24"
                                  />
                                  <button onClick={() => confirmReset(u.userID)} className="p-1 hover:text-blue-400 transition-colors"><ShieldCheck size={16}/></button>
                                  <button onClick={() => setActioningUser(null)} className="p-1 hover:text-slate-400 transition-colors"><XCircle size={16}/></button>
                                </>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="flex items-center gap-2"
                            >
                              <button 
                                onClick={() => {
                                  setActioningUser({ id: u.userID, type: 'reset' });
                                  setResetPassword('');
                                }}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-sm transition-all"
                                title="Reset Password"
                              >
                                <Key size={16} />
                              </button>
                              <button 
                                onClick={() => {
                                  if (u.userID === 1) {
                                    toast.error('Primary administrator cannot be deleted.');
                                    return;
                                  }
                                  setActioningUser({ id: u.userID, type: 'delete' });
                                }}
                                className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-sm transition-all"
                                title="Delete User"
                              >
                                <Trash2 size={16} />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
