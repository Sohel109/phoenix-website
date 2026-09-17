export function AuroraBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#FFFBF4] bg-bird-pattern">
            {/* Halos doux d'ambiance conformes à la Charte 2025-2026 */}
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#ECDDFD]/30 blur-3xl" />
            <div className="absolute bottom-[-5%] left-[-8%] w-[500px] h-[500px] rounded-full bg-[#E1BBCB]/25 blur-3xl" />
        </div>
    );
}
