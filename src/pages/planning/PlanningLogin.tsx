import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Eye, EyeOff, LogIn, Lock, User, Loader2 } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';

export function PlanningLogin() {
    const { login } = usePlanning();
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const success = await login(loginId.trim(), password);
            if (success) {
                navigate('/planning');
            } else {
                setError('Identifiant ou mot de passe incorrect.');
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 500);
            }
        } catch (err) {
            setError('Une erreur est survenue lors de la connexion.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#07071a] flex flex-col items-center justify-center px-4">
            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-orange-500/10 rounded-full blur-[80px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative w-full max-w-sm"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-violet-600 mb-4 shadow-2xl shadow-orange-500/30">
                        <CalendarCheck size={30} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600">
                        Phoenix Planning
                    </h1>
                    <p className="text-white/40 mt-2 text-sm">Connectez-vous à votre espace membre</p>
                </div>

                {/* Card */}
                <motion.div
                    animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Identifiant */}
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                                Identifiant
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={e => { setLoginId(e.target.value); setError(''); }}
                                    placeholder="prenom.nom"
                                    autoComplete="username"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-white/10 border border-white/20 rounded-xl pl-9 pr-10 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error message */}
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-violet-600 text-white font-bold shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.97 } : {}}
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <LogIn size={18} />
                            )}
                            {isLoading ? 'Connexion...' : 'Se connecter'}
                        </motion.button>
                    </form>
                </motion.div>

                <p className="text-center text-white/20 text-xs mt-6">
                    Espace réservé aux membres Phoenix · Identifiants fournis par l'administration
                </p>
            </motion.div>
        </div>
    );
}
