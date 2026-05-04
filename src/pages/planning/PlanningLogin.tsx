import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, ChevronDown, LogIn, User, ShieldCheck } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';
import { mockUsers } from '../../data/planningData';

export function PlanningLogin() {
    const { login } = usePlanning();
    const navigate = useNavigate();
    const [selectedId, setSelectedId] = useState('');
    const [error, setError] = useState('');

    const tuteurs = mockUsers.filter(u => u.role === 'tuteur');
    const chefs = mockUsers.filter(u => u.role === 'chef_projet');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedId) { setError('Veuillez sélectionner un compte.'); return; }
        login(selectedId);
        navigate('/planning');
    };

    return (
        <div className="min-h-screen bg-[#07071a] flex flex-col items-center justify-center px-4">
            {/* Glow BG */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[100px]" />
                <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 mb-4 shadow-2xl shadow-orange-500/30">
                        <CalendarCheck size={30} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600">
                        Phoenix Planning
                    </h1>
                    <p className="text-white/50 mt-2 text-sm">Connectez-vous pour accéder à votre espace</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Select */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Choisissez votre compte
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedId}
                                    onChange={e => { setSelectedId(e.target.value); setError(''); }}
                                    className="w-full appearance-none bg-white/10 border border-white/20 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all"
                                >
                                    <option value="" className="bg-[#1a1a2e]">— Sélectionner —</option>
                                    <optgroup label="👑 Chefs de Projet" className="bg-[#1a1a2e]">
                                        {chefs.map(u => (
                                            <option key={u.id} value={u.id} className="bg-[#1a1a2e]">{u.name}</option>
                                        ))}
                                    </optgroup>
                                    <optgroup label="📚 Tuteurs" className="bg-[#1a1a2e]">
                                        {tuteurs.map(u => (
                                            <option key={u.id} value={u.id} className="bg-[#1a1a2e]">{u.name}</option>
                                        ))}
                                    </optgroup>
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none" />
                            </div>
                            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
                        </div>

                        {/* Role badge preview */}
                        {selectedId && (() => {
                            const user = mockUsers.find(u => u.id === selectedId);
                            return user ? (
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                                        {user.role === 'chef_projet' ? <ShieldCheck size={16} className="text-white" /> : <User size={16} className="text-white" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{user.name}</p>
                                        <p className="text-xs text-orange-400">
                                            {user.role === 'chef_projet' ? 'Chef de Projet' : 'Tuteur'}
                                        </p>
                                    </div>
                                </div>
                            ) : null;
                        })()}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-violet-600 text-white font-bold shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-shadow"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <LogIn size={18} />
                            Se connecter
                        </motion.button>
                    </form>
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                    Espace réservé aux membres Phoenix
                </p>
            </motion.div>
        </div>
    );
}
