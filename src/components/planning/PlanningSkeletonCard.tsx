/**
 * PlanningSkeletonCard — Skeleton loader animé pour les cartes du recap planning
 * Utilise un dégradé aubergine → orange cohérent avec le design intranet Phoenix.
 */
export function PlanningSkeletonCard() {
    return (
        <div className="p-5 rounded-[2rem] bg-[#2D0A32]/80 border border-[#6F2B75]/30 animate-pulse space-y-3">
            {/* Ligne nom + avatar */}
            <div className="flex items-center gap-3.5">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-[#6F2B75]/40 shrink-0" />
                <div className="flex-1 space-y-2">
                    {/* Nom */}
                    <div className="h-3.5 w-32 rounded-full bg-[#6F2B75]/40" />
                    {/* Badge statut */}
                    <div className="h-2.5 w-48 rounded-full bg-[#6F2B75]/25" />
                </div>
                {/* Compteur d'heures */}
                <div className="h-7 w-16 rounded-full bg-[#6F2B75]/30 ml-auto" />
            </div>

            {/* Barre de progression */}
            <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-[#6F2B75]/20 overflow-hidden">
                    <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-[#6F2B75]/50 to-[#EC602B]/30" />
                </div>
            </div>
        </div>
    );
}

/**
 * PlanningSkeletonList — n cartes squelettes empilées verticalement
 */
export function PlanningSkeletonList({ count = 6 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <PlanningSkeletonCard key={i} />
            ))}
        </div>
    );
}
