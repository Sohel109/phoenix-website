import { useState } from 'react';
import { Users } from 'lucide-react';
import { setNewsPublisherApi } from '../../data/planningData';
import type { NewsMember } from '../../data/news';
import { cardClass } from './childrenStyles';

interface NewsPublishersPanelProps {
    members: NewsMember[];
    requesterId: string;
    token: string;
    onChanged: () => void | Promise<void>;
}

/** Réservé au Bureau : les membres autorisés à publier des actualités (le Bureau l'est toujours). */
export function NewsPublishersPanel({ members, requesterId, token, onChanged }: NewsPublishersPanelProps) {
    const [overrides, setOverrides] = useState<Record<string, boolean>>({});
    const [pending, setPending] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const others = members.filter((m) => m.role !== 'bureau').sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    const toggle = async (member: NewsMember, allowed: boolean) => {
        setError(null);
        setPending(member.id);
        setOverrides((current) => ({ ...current, [member.id]: allowed }));
        const result = await setNewsPublisherApi(requesterId, member.id, allowed, token);
        if (!result.success) {
            // La case revient à son état réel.
            setOverrides((current) => {
                const next = { ...current };
                delete next[member.id];
                return next;
            });
            setError(result.message);
        } else {
            await onChanged();
            setOverrides((current) => {
                const next = { ...current };
                delete next[member.id];
                return next;
            });
        }
        setPending(null);
    };

    return (
        <section className={`${cardClass} mt-10`} aria-labelledby="publishers-title">
            <h2 id="publishers-title" className="flex items-center gap-2 text-white font-bold">
                <Users size={16} className="text-[#EC602B]" />
                Qui peut publier
            </h2>
            <p className="mt-1 text-sm text-[#ECDDFD]/70">Le Bureau publie toujours. Cochez les autres membres autorisés, par exemple le pôle com.</p>
            {error && <p className="mt-3 text-sm text-[#FF7E2E]" role="alert">{error}</p>}
            <ul className="mt-4 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                {others.map((member) => {
                    const checked = overrides[member.id] ?? member.canPublish;
                    return (
                        <li key={member.id}>
                            <label className="flex items-center gap-3 py-1.5 text-sm text-[#ECDDFD]/85 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={pending !== null}
                                    onChange={(e) => void toggle(member, e.target.checked)}
                                    className="w-4 h-4 rounded border-[#6F2B75] bg-[#1F0422] text-[#EC602B] focus:ring-[#EC602B]"
                                />
                                {member.name}
                            </label>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
