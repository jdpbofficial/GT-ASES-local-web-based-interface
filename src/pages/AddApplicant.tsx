import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  GraduationCap, 
  Calendar,
  CheckCircle2,
  Trash2,
  Plus
} from 'lucide-react';
import { AppConfig, Applicant } from '../types';
import { toast } from 'sonner';

export default function AddApplicant() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [formData, setFormData] = useState<Partial<Applicant>>({
    firstName: '',
    lastName: '',
    age: 20,
    gender: 'Male',
    contact: '',
    email: '',
    position: '',
    education: '',
    experience: '',
    skills: [],
    certifications: []
  });

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        if (!id) setFormData(prev => ({ 
          ...prev, 
          position: data.POSITIONS[0],
          education: Object.keys(data.EDU_SCORES)[0],
          experience: Object.keys(data.EXP_SCORES)[0]
        }));
      });

    if (id) {
      fetch('/api/applicants')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const app = data.find((a: any) => a.applicantID === parseInt(id));
            if (app) {
              setFormData(app);
            } else {
              toast.error('Applicant not found');
              navigate('/applicants');
            }
          }
        })
        .catch(err => {
          console.error('Error fetching applicant:', err);
          toast.error('Failed to load applicant data');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/applicants/${id}` : '/api/applicants';
    
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      toast.success(id ? 'Applicant record updated successfully.' : 'New application submitted successfully.');
      navigate('/applicants');
    } else {
      const data = await res.json();
      toast.error(data.error || 'Failed to save applicant data.');
    }
  };

  const toggleItem = (listName: 'skills' | 'certifications', item: string) => {
    const list = formData[listName] as string[];
    if (list.includes(item)) {
      setFormData({ ...formData, [listName]: list.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [listName]: [...list, item] });
    }
  };

  const calculateCompleteness = () => {
    const fields = ['firstName', 'lastName', 'age', 'contact', 'email', 'position', 'education', 'experience'];
    const filledFields = fields.filter(f => !!formData[f as keyof Applicant]);
    let percentage = (filledFields.length / fields.length) * 80;
    if (formData.skills && formData.skills.length > 0) percentage += 10;
    if (formData.certifications && formData.certifications.length > 0) percentage += 10;
    return Math.round(percentage);
  };

  const calculatePreviewScore = () => {
    if (!config || !formData.position) return { score: 0, status: 'Draft' };
    const eduScores = config.EDU_SCORES;
    const expScores = config.EXP_SCORES;
    const skillPts = config.SKILL_PTS;
    const certPts = config.CERT_PTS;

    let score = (eduScores[formData.education as string] || 0) + (expScores[formData.experience as string] || 0);

    const relevance = config.POSITION_RELEVANCE[formData.position as string] || { relevant_skills: [], relevant_certs: [] };
    const relSkills = new Set(relevance.relevant_skills || []);
    const relCerts = new Set(relevance.relevant_certs || []);

    (formData.skills || []).forEach((skill: string) => {
      score += relSkills.has(skill) ? skillPts * 2 : skillPts;
    });

    (formData.certifications || []).forEach((cert: string) => {
      score += relCerts.has(cert) ? certPts * 2 : certPts;
    });

    let status = "Disqualified";
    if (score >= config.QUALIFIED_MIN) status = "Qualified";
    else if (score >= config.FOR_REVIEW_MIN) status = "For Review";

    return { score, status };
  };

  const completeness = calculateCompleteness();
  const preview = calculatePreviewScore();

  const getMissingFields = () => {
    const fields = [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'contact', label: 'Contact' },
      { key: 'email', label: 'Email' }
    ];
    return fields.filter(f => !formData[f.key as keyof Applicant]).map(f => f.label);
  };

  const missing = getMissingFields();

  if (loading || !config) return <div>Loading Profile...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <header className="flex items-center gap-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {id ? 'Edit Applicant' : 'New Application'}
          </h1>
          <p className="text-slate-500 font-medium tracking-tight">
            {id ? `Updating records for Application #${id}` : 'Create a new applicant profile for screening.'}
          </p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <User size={18} className="text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">First Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Age</label>
                <input 
                  required
                  type="number" 
                  min="18"
                  max="70"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Gender</label>
                <select 
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium appearance-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Contact No.</label>
                <div className="relative">
                  <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    required
                    type="text" 
                    value={formData.contact}
                    onChange={(e) => setFormData({...formData, contact: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 pl-11 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                    placeholder="09xx xxx xxxx"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Briefcase size={18} className="text-blue-600" />
              Professional Background
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Applying for Position</label>
                <select 
                  value={formData.position}
                  onChange={(e) => setFormData({...formData, position: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                >
                  {config.POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Education Level</label>
                  <select 
                    value={formData.education}
                    onChange={(e) => setFormData({...formData, education: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                  >
                    {Object.keys(config.EDU_SCORES).map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Work Experience</label>
                  <select 
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none focus:border-blue-500 transition-all font-medium"
                  >
                    {Object.keys(config.EXP_SCORES).map(ex => <option key={ex} value={ex}>{ex}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" />
              Technical Qualifications
            </h2>
            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Skills & Tools</label>
                <div className="flex flex-wrap gap-2">
                  {config.SKILLS_LIST.map(skill => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleItem('skills', skill)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        formData.skills?.includes(skill)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Certifications</label>
                <div className="flex flex-wrap gap-2">
                  {config.CERTS_LIST.map(cert => (
                    <button
                      key={cert}
                      type="button"
                      onClick={() => toggleItem('certifications', cert)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        formData.certifications?.includes(cert)
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="sticky top-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl mb-6">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-6">Action Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center text-sm font-medium text-slate-400">
                    <span>Profile Completeness</span>
                    <span className="text-blue-400 font-bold">{completeness}%</span>
                  </div>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      key={completeness}
                      initial={{ width: 0 }}
                      animate={{ width: `${completeness}%` }}
                      className="h-full bg-blue-500" 
                    />
                  </div>
                  {missing.length > 0 && (
                    <p className="text-[10px] text-rose-400/80 font-medium italic">
                      Missing: {missing.join(', ')}
                    </p>
                  )}
                </div>

                <div className="p-5 bg-slate-800/80 rounded-2xl border border-slate-700/50 mb-8">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Live Prediction</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-300">Potential Status</p>
                      <p className={`text-lg font-black uppercase tracking-tight ${
                        preview.status === 'Qualified' ? 'text-emerald-400' : 
                        preview.status === 'For Review' ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {preview.status} (Score: {preview.score})
                      </p>
                    </div>
                    <CheckCircle2 size={32} className={preview.status === 'Qualified' ? 'text-emerald-500/20' : 'text-slate-700'} />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center gap-3 py-4 bg-white text-slate-900 font-black rounded-2xl shadow-xl hover:bg-slate-50 active:scale-95 transition-all text-sm uppercase tracking-widest"
                >
                  <Save size={20} />
                  {id ? 'Update Record' : 'Submit Application'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Quick Insights</p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Plus size={16} />
                  </div>
                  <p className="text-xs font-bold text-slate-600 italic">Position relevance enabled</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Plus size={16} />
                  </div>
                  <p className="text-xs font-bold text-slate-600 italic">Score-based auto-ranking</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </motion.div>
  );
}
