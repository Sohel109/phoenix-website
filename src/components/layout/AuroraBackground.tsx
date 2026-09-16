export function AuroraBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#F8FAFC]">
            {/* Arrière-plan épuré et lumineux sans orbes floues artificielles */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/20 via-white/80 to-slate-50" />
        </div>
    );
}
