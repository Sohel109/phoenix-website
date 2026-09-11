import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        } catch (err) {
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
        } catch (err) {
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
        } catch (err) {
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
        <div className="min-h-screen bg-[#07071a] flex flex-col items-center justify-center px-4">

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
                className="relative w-full max-w-sm"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                        <CalendarCheck size={30} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-violet-500">
                        Phoenix Planning
                    </h1>
                    <p className="text-white/40 mt-2 text-sm">Connectez-vous à votre espace membre</p>
                </div>

                {/* Card */}
                <motion.div
                    animate={isShaking ? { x: [-8, 8, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg"
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
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-semibold text-white/50 uppercase tracking-wide">
                                    Mot de passe
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setResetLoginId(loginId);
                                        setShowForgotPassword(true);
                                    }}
                                    className="text-xs text-orange-400/90 hover:text-orange-300 transition-colors font-medium hover:underline"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
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
                            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-violet-500 text-white font-bold shadow-md transition-all mt-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
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

            {/* Modale de réinitialisation sécurisée par e-mail (OTP) */}
            {showForgotPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="bg-[#120e2e] border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                                {resetStep === 1 ? <Mail size={22} /> : <KeyRound size={22} />}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">Mot de passe oublié</h3>
                                <p className="text-white/50 text-xs mt-0.5">
                                    {resetStep === 1 ? 'Vérification de compte par e-mail' : 'Validation du code de sécurité'}
                                </p>
                            </div>
                        </div>

                        {resetFeedback && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start gap-2 p-3 rounded-xl mb-4 text-xs border ${
                                    resetFeedback.type === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                                        : 'bg-red-500/10 border-red-500/20 text-red-300'
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
                            <form onSubmit={handleRequestCode} className="space-y-3.5">
                                <p className="text-white/70 text-xs leading-relaxed">
                                    Saisissez votre identifiant. Un code de sécurité à 6 chiffres sera envoyé à l'adresse e-mail enregistrée sur votre compte.
                                </p>

                                <div>
                                    <label className="block text-xs font-medium text-white/70 mb-1">
                                        Identifiant
                                    </label>
                                    <div className="relative">
                                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                        <input
                                            type="text"
                                            value={resetLoginId}
                                            onChange={e => setResetLoginId(e.target.value)}
                                            placeholder="ex: prenom.nom"
                                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-all text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeResetModal}
                                        className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-violet-500 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                                    >
                                        {isResetting ? (
                                            <Loader2 size={15} className="animate-spin" />
                                        ) : (
                                            <Mail size={15} />
                                        )}
                                        {isResetting ? 'Envoi...' : 'Envoyer le code'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* ÉTAPE 2 : Saisir le code OTP + le nouveau mot de passe */}
                        {resetStep === 2 && (
                            <form onSubmit={handleConfirmReset} className="space-y-3.5">
                                {maskedEmail && (
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white/70 flex items-center gap-2">
                                        <Mail size={14} className="text-orange-400 shrink-0" />
                                        <span>Code envoyé à <strong className="text-white">{maskedEmail}</strong></span>
                                    </div>
                                )}

                                {/* Code 6 chiffres */}
                                <div>
                                    <label className="block text-xs font-medium text-white/70 mb-1">
                                        Code de vérification (6 chiffres)
                                    </label>
                                    <input
                                        type="text"
                                        maxLength={6}
                                        value={otpCode}
                                        onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Ex: 583920"
                                        className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-white/20 text-center tracking-[0.3em] font-mono text-base font-bold focus:outline-none focus:border-orange-500/60 transition-all"
                                        required
                                    />
                                </div>

                                {/* Nouveau mot de passe */}
                                <div>
                                    <label className="block text-xs font-medium text-white/70 mb-1">
                                        Nouveau mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                        <input
                                            type={showResetNew ? 'text' : 'password'}
                                            value={resetNewPassword}
                                            onChange={e => setResetNewPassword(e.target.value)}
                                            placeholder="Au moins 4 caractères"
                                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-9 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-all text-xs"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowResetNew(!showResetNew)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                                            tabIndex={-1}
                                        >
                                            {showResetNew ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirmation */}
                                <div>
                                    <label className="block text-xs font-medium text-white/70 mb-1">
                                        Confirmer le mot de passe
                                    </label>
                                    <div className="relative">
                                        <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                                        <input
                                            type={showResetNew ? 'text' : 'password'}
                                            value={resetConfirmPassword}
                                            onChange={e => setResetConfirmPassword(e.target.value)}
                                            placeholder="Répéter le mot de passe"
                                            className="w-full bg-white/5 border border-white/15 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder-white/20 focus:outline-none focus:border-orange-500/60 transition-all text-xs"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setResetStep(1);
                                            setResetFeedback(null);
                                        }}
                                        className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs transition-colors shrink-0"
                                        title="Retour"
                                    >
                                        <ArrowLeft size={15} />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isResetting}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-violet-500 hover:opacity-95 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
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



