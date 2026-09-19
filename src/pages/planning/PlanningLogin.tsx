import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarCheck, Eye, EyeOff, LogIn, Lock, User, Loader2, KeyRound, CheckCircle2, AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import { usePlanning } from '../../context/PlanningContext';
import { requestResetCodeApi, confirmResetPasswordApi } from '../../data/planningData';

export function PlanningLogin() {
    const { login } = usePlanning();
    const navigate = useNavigate();
    const [loginId, setLoginId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Mot de passe oublié (sécurisé par OTP e-mail)
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetStep, setResetStep] = useState<1 | 2>(1);
    const [resetLoginId, setResetLoginId] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [resetNewPassword, setResetNewPassword] = useState('');
    const [resetConfirmPassword, setResetConfirmPassword] = useState('');
    const [showResetNew, setShowResetNew] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [resetFeedback, setResetFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
        } catch {
            setError('Une erreur est survenue lors de la connexion.');
        } finally {
            setIsLoading(false);
        }
    };

    // Étape 1 : Demander l'envoi du code OTP par email
    const handleRequestCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetFeedback(null);

        if (!resetLoginId.trim()) {
            setResetFeedback({ type: 'error', text: 'Veuillez saisir votre identifiant.' });
            return;
        }

        setIsResetting(true);
        try {
            const res = await requestResetCodeApi(resetLoginId.trim());
            if (res.success) {
                setMaskedEmail(res.maskedEmail || '');
                setResetStep(2);
                setResetFeedback({ type: 'success', text: res.message || 'Code envoyé par e-mail !' });
            } else {
                setResetFeedback({ type: 'error', text: res.message || 'Impossible d’envoyer le code.' });
            }
        } catch {
            setResetFeedback({ type: 'error', text: 'Une erreur réseau est survenue.' });
        } finally {
            setIsResetting(false);
        }
    };

    // Étape 2 : Valider le code OTP et réinitialiser le mot de passe
    const handleConfirmReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetFeedback(null);

        if (!otpCode.trim() || !resetNewPassword.trim() || !resetConfirmPassword.trim()) {
            setResetFeedback({ type: 'error', text: 'Veuillez remplir tous les champs.' });
            return;
        }

        if (resetNewPassword.length < 4) {
            setResetFeedback({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 4 caractères.' });
            return;
        }

        if (resetNewPassword !== resetConfirmPassword) {
            setResetFeedback({ type: 'error', text: 'Les deux nouveaux mots de passe ne correspondent pas.' });
            return;
        }

        setIsResetting(true);
        try {
            const res = await confirmResetPasswordApi(resetLoginId.trim(), otpCode.trim(), resetNewPassword.trim());
            if (res.success) {
                setResetFeedback({ type: 'success', text: res.message || 'Mot de passe réinitialisé avec succès !' });
                // Pré-remplir la connexion principale
                setLoginId(resetLoginId.trim());
                setPassword(resetNewPassword.trim());
                setTimeout(() => {
                    closeResetModal();
                }, 1800);
            } else {
                setResetFeedback({ type: 'error', text: res.message || 'Code incorrect ou expiré.' });
            }
        } catch {
            setResetFeedback({ type: 'error', text: 'Une erreur réseau est survenue.' });
        } finally {
            setIsResetting(false);
        }
    };

    const closeResetModal = () => {
        setShowForgotPassword(false);
        setResetStep(1);
        setResetFeedback(null);
        setResetLoginId('');
        setMaskedEmail('');
        setOtpCode('');
        setResetNewPassword('');
        setResetConfirmPassword('');
    };

    return (
        <div className="min-h-screen bg-[#1F0422] text-[#FFFBF4] bg-bird-pattern-dark flex flex-col items-center justify-center px-4 relative py-12 selection:bg-[#EC602B]/30 selection:text-white">
            {/* Bouton retour au site public */}
            <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-20">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] hover:text-white text-xs font-school uppercase tracking-wider backdrop-blur-md border border-[#ECDDFD]/20 transition-all shadow-md group cursor-pointer"
                    title="Retourner à l'accueil du site Phoenix"
                >
                    <ArrowLeft size={16} className="text-[#EC602B] group-hover:-translate-x-0.5 transition-transform" />
                    <span>Retour au site</span>
                </Link>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative w-full max-w-md"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#EC602B] text-white shadow-soft mb-4 border-2 border-white/20">
                        <CalendarCheck size={36} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-display text-white tracking-wide">
                        Phoenix <span className="text-[#EC602B]">Planning</span>
                    </h1>
                    <p className="font-script text-2xl text-[#ECDDFD] mt-1">
                        Espace Membre &amp; Bénévoles
                    </p>
                    <p className="text-[#ECDDFD]/70 mt-1 text-xs font-sans">
                        Connectez-vous à votre espace associatif
                    </p>
                </div>

                {/* Card */}
                <motion.div
                    animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-[#2D0A32]/90 backdrop-blur-md border border-[#6F2B75]/50 rounded-xl p-8 sm:p-10 shadow-soft-lg"
                >
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Identifiant */}
                        <div>
                            <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-2">
                                Identifiant
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 pointer-events-none" />
                                <input
                                    type="text"
                                    value={loginId}
                                    onChange={e => { setLoginId(e.target.value); setError(''); }}
                                    placeholder="prenom.nom"
                                    autoComplete="username"
                                    className="w-full bg-white/5 border border-[#6F2B75]/40 rounded-2xl pl-10 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#EC602B]/40 focus:border-[#EC602B] transition-all text-sm font-sans"
                                />
                            </div>
                        </div>

                        {/* Mot de passe */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80">
                                    Mot de passe
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResetLoginId(loginId);
                                        setShowForgotPassword(true);
                                    }}
                                    className="text-xs text-[#EC602B] hover:text-[#FF7E2E] transition-colors font-school uppercase tracking-wider font-semibold cursor-pointer"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 pointer-events-none" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••••"
                                    autoComplete="current-password"
                                    className="w-full bg-white/5 border border-[#6F2B75]/40 rounded-2xl pl-10 pr-10 py-3 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-[#EC602B]/40 focus:border-[#EC602B] transition-all text-sm font-sans"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 hover:text-white transition-colors cursor-pointer"
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
                                className="text-red-300 text-xs font-school uppercase tracking-wider text-center bg-red-500/20 border border-red-500/40 rounded-xl px-3.5 py-2.5"
                            >
                                {error}
                            </motion.p>
                        )}

                        {/* Submit */}
                        <motion.button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full btn-phoenix-gradient text-white font-school uppercase tracking-wider text-xs font-bold shadow-soft-lg transition-all mt-3 cursor-pointer ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            whileHover={!isLoading ? { scale: 1.02 } : {}}
                            whileTap={!isLoading ? { scale: 0.98 } : {}}
                        >
                            {isLoading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <LogIn size={18} />
                            )}
                            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
                        </motion.button>
                    </form>
                </motion.div>

                <div className="mt-5 text-center">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-xs font-school uppercase tracking-wider text-[#ECDDFD]/60 hover:text-[#EC602B] transition-colors py-1.5 px-4 rounded-full hover:bg-white/5"
                    >
                        <ArrowLeft size={13} />
                        <span>Quitter et retourner au site public</span>
                    </Link>
                </div>

                <p className="text-center text-[#ECDDFD]/40 text-xs mt-3 font-sans">
                    Espace réservé aux membres Phoenix · Identifiants fournis par l'administration
                </p>
            </motion.div>

            {/* Modale de réinitialisation sécurisée par e-mail (OTP) */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-[#2D0A32] border border-[#6F2B75]/60 rounded-xl p-7 sm:p-8 max-w-sm w-full shadow-2xl relative text-[#FFFBF4]"
                    >
                        <div className="flex items-center gap-3.5 mb-5">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#6F2B75] to-[#EC602B] text-white flex items-center justify-center shrink-0 shadow-soft">
                                {resetStep === 1 ? <Mail size={22} /> : <KeyRound size={22} />}
                            </div>
                            <div>
                                <h3 className="text-xl font-display text-white leading-tight">Mot de passe oublié</h3>
                                <p className="text-[#ECDDFD]/70 text-xs mt-0.5 font-sans">
                                    {resetStep === 1 ? 'Vérification par e-mail' : 'Validation du code OTP'}
                                </p>
                            </div>
                        </div>

                        {resetFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-2 p-3 rounded-2xl mb-4 text-xs font-sans border ${
                                    resetFeedback.type === 'success'
                                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                        : 'bg-red-500/15 border-red-500/30 text-red-300'
                                }`}
                            >
                                {resetFeedback.type === 'success' ? (
                                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400 mt-0.5" />
                                ) : (
                                    <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
                                )}
                                <span>{resetFeedback.text}</span>
                            </motion.div>
                        )}

                        {/* ÉTAPE 1 : Saisir l'identifiant pour envoyer le code par email */}
                        {resetStep === 1 && (
                            <form onSubmit={handleRequestCode} className="space-y-4">
                                <p className="text-[#ECDDFD]/80 text-xs leading-relaxed font-sans">
                                    Saisissez votre identifiant. Un code de sécurité à 6 chiffres sera envoyé à l'adresse e-mail enregistrée sur votre compte.
                                </p>

                                <div>
                                    <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                                        Identifiant
                                    </label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={resetLoginId}
                                            onChange={e => setResetLoginId(e.target.value)}
                                            placeholder="ex: prenom.nom"
                                            className="w-full bg-white/5 border border-[#6F2B75]/40 rounded-2xl pl-10 pr-3 py-2.5 text-white placeholder-white/25 focus:outline-none focus:border-[#EC602B] transition-all text-xs font-sans"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeResetModal}
                                        className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] font-school uppercase tracking-wider text-xs transition-colors cursor-pointer"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full btn-phoenix-gradient text-white font-school uppercase tracking-wider text-xs font-bold shadow-soft transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {isResetting ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <Mail size={15} />
                                        )}
                                        {isResetting ? 'Envoi...' : 'Envoyer'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ÉTAPE 2 : Saisir le code OTP + le nouveau mot de passe */}
                        {resetStep === 2 && (
                            <form onSubmit={handleConfirmReset} className="space-y-4">
                                {maskedEmail && (
                                    <div className="bg-white/5 border border-[#6F2B75]/40 rounded-2xl p-3 text-xs text-[#ECDDFD]/90 flex items-center gap-2 font-sans">
                                        <Mail size={14} className="text-[#EC602B] shrink-0" />
                                        <span>Code envoyé à <strong className="text-white">{maskedEmail}</strong></span>
                                    </div>
                                )}

                                {/* Code 6 chiffres */}
                                <div>
                                    <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                                        Code de vérification (6 chiffres)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Ex: 583920"
                                        className="w-full bg-white/5 border border-[#6F2B75]/40 rounded-2xl px-3 py-2.5 text-white placeholder-white/25 text-center tracking-[0.3em] font-mono text-base font-bold focus:outline-none focus:border-[#EC602B] transition-all"
                                        required
                                    />
                                </div>

                                {/* Nouveau mot de passe */}
                                <div>
                                    <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                                        Nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 pointer-events-none" />
                                        <input
                                            type={showResetNew ? 'text' : 'password'}
                                            value={resetNewPassword}
                                            onChange={e => setResetNewPassword(e.target.value)}
                                            placeholder="Au moins 4 caractères"
                                            className="w-full bg-white/5 border border-[#6F2B75]/40 rounded-2xl pl-10 pr-10 py-2.5 text-white placeholder-white/25 focus:outline-none focus:border-[#EC602B] transition-all text-xs font-sans"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowResetNew(!showResetNew)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 hover:text-white transition-colors cursor-pointer"
                                            tabIndex={-1}
                                        >
                                            {showResetNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirmation */}
                                <div>
                                    <label className="block text-xs font-school uppercase tracking-wider text-[#ECDDFD]/80 mb-1.5">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#ECDDFD]/40 pointer-events-none" />
                                        <input
                                            type={showResetNew ? 'text' : 'password'}
                                            value={resetConfirmPassword}
                                            onChange={e => setResetConfirmPassword(e.target.value)}
                                            placeholder="Répéter le mot de passe"
                                            className="w-full bg-white/5 border border-[#6F2B75]/40 rounded-2xl pl-10 pr-3 py-2.5 text-white placeholder-white/25 focus:outline-none focus:border-[#EC602B] transition-all text-xs font-sans"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2.5 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setResetStep(1);
                                            setResetFeedback(null);
                                        }}
                                        className="flex items-center justify-center p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-[#ECDDFD] transition-colors shrink-0 cursor-pointer"
                                        title="Retour"
                                    >
                                        <ArrowLeft size={16} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full btn-phoenix-gradient text-white font-school uppercase tracking-wider text-xs font-bold shadow-soft transition-all disabled:opacity-50 cursor-pointer"
                                    >
                                        {isResetting ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <KeyRound size={15} />
                                        )}
                                        {isResetting ? 'Validation...' : 'Valider'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    );
}



