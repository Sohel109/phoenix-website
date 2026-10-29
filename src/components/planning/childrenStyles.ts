export const cardClass = 'p-6 rounded-xl bg-[#2D0A32]/90 border border-[#6F2B75]/40 backdrop-blur-md shadow-soft-lg';
export const buttonClass = 'px-5 py-2.5 rounded-full font-school text-xs uppercase tracking-wider transition-all border disabled:opacity-60';
export const primaryButtonClass = `${buttonClass} btn-phoenix-gradient text-white border-transparent`;
export const secondaryButtonClass = `${buttonClass} bg-[#1F0422]/70 text-[#ECDDFD]/80 hover:bg-[#6F2B75]/40 hover:text-white border-[#6F2B75]/40`;

export function formatRate(rate: number | null): string {
    return rate === null ? '-' : `${rate} %`;
}
