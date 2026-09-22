import { ArrowRight, Users, GraduationCap, Briefcase } from 'lucide-react';
import { MaskingTape, HandDrawnCircle } from '../common/HandDrawnElements';
import { useDrawnOnInteract } from '../../hooks/useDrawnOnInteract';

export function Recruitment() {
    return (
        <section className="pt-14 pb-10 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-8 sm:mb-12">
                        <div className="flex justify-center items-center gap-3 mb-4">
                            <span className="h-px w-8 bg-[#EC602B]"></span>
                            <span className="text-xs uppercase tracking-widest font-semibold text-[#904990]">
                                Étudiants KEDGE · On recrute !
                            </span>
                            <span className="h-px w-8 bg-[#EC602B]"></span>
                        </div>
                        <h2 className="text-3xl sm:text-5xl font-display text-phoenix-dark mb-3">
                            Rejoignez{' '}
                            <span className="marker-highlight text-[#EC602B]">
                                <span>l'Aventure</span>
                            </span>
                        </h2>
                        <p className="text-slate-600 font-sans text-base max-w-2xl mx-auto leading-relaxed">
                            Vous êtes étudiant à KEDGE Business School et vous souhaitez vous engager concrètement pour l'égalité des chances ?
                            Phœnix recrute ses nouveaux tuteurs et membres actifs !
                        </p>
                    </div>

                    {/* Cards Grid — fiches de recrutement façon carnet, légèrement désalignées */}
                    <div className="grid md:grid-cols-3 gap-x-6 gap-y-10 mb-12 sm:mb-14 pt-3">
                        <Card icon={Users} title="Esprit d'Équipe" description="Intégrez une famille soudée et passionnée par l'impact social." tape="warm" angle="left" rotation="-rotate-1" />
                        <Card icon={Briefcase} title="Compétences" description="Développez des soft skills, le sens des responsabilités et une expérience humaine valorisante." tape="lilac" angle="center" rotation="rotate-[0.5deg]" />
                        <Card icon={GraduationCap} title="Engagement" description="Participez concrètement à la réussite scolaire et culturelle de jeunes marseillais." tape="warm" angle="right" rotation="rotate-1" />
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <a
                            href="https://m.facebook.com/groups/1045459488302373/?ref=share"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 px-8 py-3.5 btn-phoenix-orange btn-glow-orange text-white rounded-lg font-school uppercase tracking-wider text-xs shadow-glow-orange hover:-translate-y-0.5 active:scale-95 transition-all duration-200 touch-tactile"
                        >
                            <span>Postuler Maintenant</span>
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </a>
                        <div className="mt-5 inline-flex">
                            <span className="badge-stamp text-[9px] -rotate-2">
                                <span className="text-[#6F2B75] font-extrabold text-[8px]">PROCHAINE SESSION</span>
                                <span className="text-[#EC602B] font-black text-[10px]">OCTOBRE 2026</span>
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}

function Card({ icon: Icon, title, description, tape, angle, rotation }: { icon: any, title: string, description: string, tape: 'warm' | 'lilac', angle: 'left' | 'right' | 'center', rotation: string }) {
    // Seule animation : le cercle au feutre qui se dessine autour de l'icône (survol desktop / tap mobile).
    const { isDrawn, interactionProps } = useDrawnOnInteract();

    return (
        <div className={`relative ${rotation}`} {...interactionProps}>
            <MaskingTape variant={tape} angle={angle} className="-top-3 left-1/2 -translate-x-1/2 z-30" />
            <div className="bg-white border border-[#6F2B75]/15 p-8 rounded-organic-sm card-polaroid text-center flex flex-col items-center will-change-transform h-full">
                <div className="relative w-14 h-14 mx-auto flex items-center justify-center mb-6">
                    <HandDrawnCircle stroke="#EC602B" strokeWidth={2.2} className="inset-0 w-full h-full" animated drawn={isDrawn} />
                    <div className="w-11 h-11 rounded-full bg-white text-[#2A082D] flex items-center justify-center border border-[#2A082D]/10 shadow-soft">
                        <Icon size={20} strokeWidth={1.8} />
                    </div>
                </div>
                <h3 className="text-base font-school font-bold text-phoenix-dark mb-2 uppercase tracking-wide">{title}</h3>
                <p className="text-sm font-sans text-slate-600 leading-relaxed font-normal">{description}</p>
            </div>
        </div>
    );
}
