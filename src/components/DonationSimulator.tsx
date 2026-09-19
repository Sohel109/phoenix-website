import { useState } from 'react';
import { Calculator } from 'lucide-react';

/**
 * DonationSimulator — Calculateur fiscal interactif pour les dons
 * Association reconnue d'intérêt général : déduction de 66% pour les particuliers.
 */
export function DonationSimulator() {
    const [amount, setAmount] = useState(50);
    const DEDUCTION_RATE = 0.66; // 66% pour une association reconnue d'intérêt général


    const deduction = Math.round(amount * DEDUCTION_RATE * 100) / 100;
    const netCost = Math.round((amount - deduction) * 100) / 100;

    const QUICK_AMOUNTS = [25, 50, 100, 200, 500];

    return (
        <div className="bg-white/15 border border-white/25 backdrop-blur-sm rounded-2xl p-6 mb-4 text-left max-w-lg mx-auto">
            <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-white" />
                <span className="text-white font-bold text-sm uppercase tracking-wider">Simulateur fiscal</span>
                <span className="text-white/70 text-xs ml-auto">Particuliers · Association d'intérêt général</span>
            </div>

            {/* Sélection rapide du montant */}
            <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_AMOUNTS.map(amt => (
                    <button
                        key={amt}
                        type="button"
                        onClick={() => setAmount(amt)}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                            amount === amt
                                ? 'bg-white text-orange-600 shadow-md'
                                : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                        }`}
                    >
                        {amt}€
                    </button>
                ))}
            </div>

            {/* Slider de montant */}
            <div className="mb-4">
                <div className="flex justify-between text-white/70 text-xs mb-1">
                    <span>Montant de votre don</span>
                    <span className="font-bold text-white text-base">{amount} €</span>
                </div>
                <input
                    type="range"
                    min={5}
                    max={1000}
                    step={5}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full accent-white cursor-pointer"
                    aria-label="Montant du don"
                />
                <div className="flex justify-between text-white/50 text-xs mt-0.5">
                    <span>5€</span>
                    <span>1 000€</span>
                </div>
            </div>

            {/* Saisie manuelle */}
            <div className="flex items-center gap-2 mb-5">
                <input
                    type="number"
                    min={1}
                    max={10000}
                    value={amount}
                    onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                    className="w-28 bg-white/20 border border-white/30 rounded-xl px-3 py-2 text-white text-sm font-bold outline-none focus:ring-2 focus:ring-white/60 text-center"
                    aria-label="Saisir le montant manuellement"
                />
                <span className="text-white/70 text-sm">€ — ou saisissez un montant</span>
            </div>

            {/* Résultats du calcul */}
            <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-white/20 rounded-xl p-3">
                    <p className="text-white/70 text-xs mb-1">Don total</p>
                    <p className="text-white font-black text-xl">{amount}€</p>
                </div>
                <div className="bg-emerald-500/30 border border-emerald-300/40 rounded-xl p-3">
                    <p className="text-emerald-200 text-xs mb-1">Économie d'impôts</p>
                    <p className="text-emerald-100 font-black text-xl">−{deduction}€</p>
                    <p className="text-emerald-200/70 text-[10px]">66% déduits</p>
                </div>
                <div className="bg-white/25 border border-white/40 rounded-xl p-3">
                    <p className="text-white/80 text-xs mb-1">Coût réel</p>
                    <p className="text-white font-black text-xl">{netCost}€</p>
                    <p className="text-white/60 text-[10px]">pour vous</p>
                </div>
            </div>

            <p className="text-white/60 text-[11px] mt-3 text-center leading-relaxed">
                * Calcul indicatif. Déductible à 66% dans la limite de 20% du revenu imposable (art. 200 CGI).
                Reçu fiscal émis automatiquement par HelloAsso.
            </p>
        </div>
    );
}
