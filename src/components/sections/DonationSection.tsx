import { useState } from 'react';
import { Heart, ShieldCheck, Sparkles, ArrowRight, CheckCircle2, Receipt } from 'lucide-react';

interface DonationTier {
    amount: number;
    afterTax: string;
    impact: string;
    popular?: boolean;
}

const DONATION_TIERS: DonationTier[] = [
    {
        amount: 20,
        afterTax: '6,80 €',
        impact: "Finance les fournitures scolaires et le matériel pédagogique d'un élève pour un trimestre.",
    },
    {
        amount: 50,
        afterTax: '17,00 €',
        impact: 'Finance une sortie culturelle complète (transport en car, musée, théâtre) pour un groupe de tutorés.',
        popular: true,
    },
    {
        amount: 100,
        afterTax: '34,00 €',
        impact: "Assure l'accompagnement individualisé et le mentorat d'un binôme tuteur/élève sur une année entière.",
    },
];

const HELLOASSO_URL = 'https://www.helloasso.com/associations/egalite-des-chances-phoenix/collectes/a';

export function DonationSection() {
    const [selectedAmount, setSelectedAmount] = useState<number>(50);

    return (
        <section className="relative py-20 md:py-28 overflow-hidden bg-[#ECDDFD]/35">
            {/* Trame filigrane Phœnix officielle */}
            <div className="pattern-watermark" aria-hidden="true" />

            <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
                {/* En-tête de section */}
                <div className="text-center max-w-3xl mx-auto mb-14 md:mb-18">
                    <div className="flex justify-center items-center gap-3 mb-4">
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                        <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                            Faire un don · Soutenir la jeunesse
                        </span>
                        <span className="h-px w-8 bg-[#EC602B]"></span>
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-6xl font-display text-[#2A082D] tracking-tight leading-[1.12] mb-5">
                        Donner pour créer le déclic.
                    </h2>

                    <p className="text-[#2A082D]/80 font-medium text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                        Votre générosité finance directement les sorties culturelles, le matériel pédagogique et les projets d'avenir de 300 jeunes marseillais.
                    </p>

                    {/* Mention fiscale officielle */}
                    <div className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-lg bg-white/95 border border-[#6F2B75]/20 text-[#2A082D] text-xs sm:text-sm font-semibold shadow-soft">
                        <Receipt size={16} className="text-[#6F2B75] shrink-0" />
                        <span>
                            <strong className="text-[#6F2B75]">Association d'intérêt général</strong> : 66% du montant de votre don est déductible de vos impôts.
                        </span>
                    </div>
                </div>

                {/* Grille concrète des 3 paliers d'action */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-12">
                    {DONATION_TIERS.map((tier) => {
                        const isSelected = selectedAmount === tier.amount;
                        return (
                            <div
                                key={tier.amount}
                                onClick={() => setSelectedAmount(tier.amount)}
                                className={`rounded-xl p-7 sm:p-8 transition-all duration-300 cursor-pointer flex flex-col justify-between relative overflow-hidden border ${
                                    isSelected
                                        ? 'bg-white border-[#EC602B] shadow-soft-lg ring-2 ring-[#EC602B]/40 -translate-y-1'
                                        : 'bg-white/90 hover:bg-white border-[#ECDDFD] shadow-soft hover:-translate-y-0.5'
                                }`}
                            >
                                {tier.popular && (
                                    <div className="absolute top-4 right-4">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EC602B] text-white text-[10px] font-school font-bold uppercase tracking-wider">
                                            <Sparkles size={11} />
                                            Impact Majeur
                                        </span>
                                    </div>
                                )}

                                <div>
                                    {/* Montant & déduction */}
                                    <div className="mb-4">
                                        <span className="text-4xl sm:text-5xl font-black text-[#EC602B] tabular-nums leading-none">
                                            {tier.amount} €
                                        </span>
                                        <p className="text-xs text-[#2A082D] font-bold mt-1.5">
                                            Soit <span className="text-[#6F2B75] font-black">{tier.afterTax}</span> après déduction fiscale
                                        </p>
                                    </div>

                                    {/* Description de l'impact */}
                                    <p className="text-sm text-slate-700 leading-relaxed font-normal mb-6">
                                        {tier.impact}
                                    </p>
                                </div>

                                {/* Indicateur de sélection */}
                                <div className="pt-4 border-t border-[#ECDDFD] flex items-center justify-between">
                                    <span className="text-xs font-school font-bold uppercase tracking-wider text-[#2A082D]">
                                        {isSelected ? 'Palier sélectionné' : 'Sélectionner ce palier'}
                                    </span>
                                    <div
                                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                                            isSelected
                                                ? 'bg-[#EC602B] text-white'
                                                : 'border-2 border-[#ECDDFD] text-transparent'
                                        }`}
                                    >
                                        <CheckCircle2 size={16} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bloc d'action centralisé */}
                <div className="bg-white rounded-xl border border-[#ECDDFD] p-8 sm:p-10 text-center max-w-3xl mx-auto shadow-soft-lg">
                    <p className="text-[#2A082D] text-sm sm:text-base font-semibold mb-6">
                        Vous avez choisi de soutenir Phœnix avec un don de{' '}
                        <strong className="text-[#EC602B] font-black text-xl tabular-nums">{selectedAmount} €</strong>{' '}
                        (coût réel de{' '}
                        <strong className="text-[#6F2B75] font-black tabular-nums">
                            {DONATION_TIERS.find((t) => t.amount === selectedAmount)?.afterTax || `${(selectedAmount * 0.34).toFixed(2)} €`}
                        </strong>{' '}
                        après réduction fiscale de 66%).
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href={HELLOASSO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto btn-phoenix-orange px-8 py-3.5 text-sm uppercase tracking-wider text-white shadow-glow-orange inline-flex items-center justify-center gap-2.5 active:scale-95 transition-all"
                        >
                            <Heart size={18} fill="currentColor" />
                            <span>Finaliser mon don ({selectedAmount} €)</span>
                            <ArrowRight size={18} />
                        </a>

                        <a
                            href={HELLOASSO_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-6 py-3.5 rounded-lg border border-[#6F2B75]/25 hover:border-[#6F2B75] text-[#2A082D] hover:bg-[#ECDDFD]/40 text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center"
                        >
                            Montant libre
                        </a>
                    </div>

                    {/* Réassurance de sécurité */}
                    <div className="mt-6 pt-5 border-t border-[#ECDDFD]/70 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1.5">
                            <ShieldCheck size={16} className="text-emerald-600" />
                            Paiement 100% sécurisé via HelloAsso
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>Reçu fiscal immédiat par email</span>
                        <span className="text-slate-300">·</span>
                        <span>Organisme agréé d'intérêt général</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
