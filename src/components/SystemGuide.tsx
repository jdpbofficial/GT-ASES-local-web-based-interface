import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, GraduationCap, Briefcase, Award, ShieldCheck, HelpCircle } from 'lucide-react';

interface SystemGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SystemGuide({ isOpen, onClose }: SystemGuideProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-lg shadow-indigo-600/20">
                  <BookOpen size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Guide</h2>
                  <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Operations & Scoring Manual</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8 custom-scrollbar">
              <section className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-widest text-xs">
                  <Award size={14} />
                  Scoring Model
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-900 text-sm mb-2">Education Points</p>
                    <ul className="text-xs text-slate-500 space-y-1 font-medium">
                      <li>• High School: 10 pts</li>
                      <li>• Vocational: 20 pts</li>
                      <li>• Bachelor's: 40 pts</li>
                      <li>• Master's: 55 pts</li>
                      <li>• Doctorate: 70 pts</li>
                    </ul>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="font-bold text-slate-900 text-sm mb-2">Experience Points</p>
                    <ul className="text-xs text-slate-500 space-y-1 font-medium">
                      <li>• 0 years: 0 pts</li>
                      <li>• 1-2 years: 10 pts</li>
                      <li>• 3-5 years: 20 pts</li>
                      <li>• 6-10 years: 30 pts</li>
                      <li>• 10+ years: 40 pts</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600 font-bold uppercase tracking-widest text-xs">
                  <ShieldCheck size={14} />
                  Screening Status
                </div>
                <div className="space-y-3">
                  <div className="flex gap-4 p-4 rounded-2xl border border-emerald-100 bg-emerald-50/30">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-emerald-900">Qualified (80+ Points)</p>
                      <p className="text-xs text-emerald-700/70 font-medium">High matching profile. Ready for final interview phase.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl border border-amber-100 bg-amber-50/30">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">For Review (50-79 Points)</p>
                      <p className="text-xs text-amber-700/70 font-medium">Potential match. Requires manual HR verification or follow-up.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-2xl border border-rose-100 bg-rose-50/30">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-rose-900">Disqualified (Below 50)</p>
                      <p className="text-xs text-rose-700/70 font-medium">Low relevance or insufficient qualifications for the role.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 text-slate-600 font-bold uppercase tracking-widest text-xs">
                  <HelpCircle size={14} />
                  Position Relevance
                </div>
                <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-blue-600/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                  <p className="text-xs font-medium text-slate-300 relative z-10 leading-relaxed italic">
                    "Specific skills and certifications gain **2x weight** when they match the relevance matrix of the applied position. For example, 'Networking' skills yield double points for a Network Engineer role."
                  </p>
                </div>
              </section>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Application Version</p>
              <p className="text-xs font-black text-slate-600">GT-ASES Web Port v1.0.4-stable</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
