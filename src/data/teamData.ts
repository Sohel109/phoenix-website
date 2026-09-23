import bureauMembersRaw from './bureauMembers.json';
import polesRaw from './poles.json';

export interface BureauMember {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    photo?: string;
    linkedin?: string;
}

export interface PoleMember {
    id: string;
    name: string;
    photo?: string;
    linkedin?: string;
}

export interface PoleTeam {
    id: string;
    title: string;
    lead: PoleMember;
    members: PoleMember[];
    description: string;
}

export const defaultBureauMembers: BureauMember[] = bureauMembersRaw as BureauMember[];

export function getBureauPresident(): { name: string; role: string } {
    try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem('phoenix_bureau_members_v1') : null;
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) {
                const pres = parsed.find(
                    (m: BureauMember) =>
                        m.role &&
                        (m.role.toLowerCase().trim() === 'président' ||
                         m.role.toLowerCase().trim() === 'présidente' ||
                         (m.role.toLowerCase().includes('président') && !m.role.toLowerCase().includes('vice')))
                );
                if (pres) {
                    const fullName = `${pres.firstName || ''} ${pres.lastName || ''}`.trim();
                    return {
                        name: fullName || 'Président(e)',
                        role: pres.role || 'Président(e)'
                    };
                }
            }
        }
    } catch {
        /* fallback */
    }

    const pres = defaultBureauMembers.find(
        m =>
            m.role &&
            (m.role.toLowerCase().trim() === 'président' ||
             m.role.toLowerCase().trim() === 'présidente' ||
             (m.role.toLowerCase().includes('président') && !m.role.toLowerCase().includes('vice')))
    );
    if (pres) {
        const fullName = `${pres.firstName || ''} ${pres.lastName || ''}`.trim();
        return {
            name: fullName || 'Samy Rabhi',
            role: pres.role || 'Président'
        };
    }

    return { name: 'Le Bureau Phoenix EDC', role: 'Présidence' };
}

export const defaultPoles: PoleTeam[] = polesRaw as PoleTeam[];
