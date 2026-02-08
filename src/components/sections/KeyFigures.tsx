import { motion, useSpring, useTransform, useInView } from 'framer-motion';
import { useEffect, useRef } from 'react';

// --- DATA ---
const stats = [
    { value: 300, suffix: "+", label: "Jeunes accompagnés", color: "from-orange-500 to-orange-600" },      // Start: Pure Orange
    { value: 150, suffix: "", label: "Étudiants bénévoles", color: "from-orange-600 to-pink-600" },       // Step 1: Orange to Pink
    { value: 9, suffix: "", label: "Projets actifs", color: "from-pink-600 to-purple-600" },              // Step 2: Pink to Purple
    { value: 2011, suffix: "", label: "Date de création", color: "from-purple-600 to-violet-600" },       // End: Purple to Violet
];

// --- COUNTER COMPONENT ---
function AnimatedCounter({ value, suffix }: { value: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    const spring = useSpring(0, { mass: 1, stiffness: 50, damping: 20 });
    const displayValue = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return (
        <span ref={ref} className="flex items-center">
            <motion.span>{displayValue}</motion.span>
            <span>{suffix}</span>
        </span>
    );
}

// --- MAIN SECTION ---
export function KeyFigures() {
    return (
        <section className="relative w-full py-32 md:py-48 px-6 overflow-hidden">
            {/* Background Decor - Removed, aurora provides the background */}

            <div className="max-w-[90rem] mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="text-center mb-24 md:mb-32"
                >
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-6">
                        Notre Impact sous <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-600 to-violet-600">toutes ses formes</span>
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 60, rotateX: 5 }}
                            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{
                                duration: 0.9,
                                delay: i * 0.15,
                                ease: [0.2, 0.65, 0.3, 0.9]
                            }}
                            className="group relative p-10 lg:p-12 rounded-[2rem] bg-gray-50 dark:bg-current-card border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3 overflow-hidden"
                        >
                            {/* Card Content */}
                            <div className="flex flex-col items-center text-center relative z-10">
                                {/* Number - Uses individual card gradient */}
                                <div className={`text-5xl md:text-6xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-br ${stat.color}`}>
                                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                                </div>

                                {/* Decor Line - Matching specific gradient */}
                                <div className={`w-12 h-1 rounded-full bg-gradient-to-r ${stat.color} mb-4 opacity-50`} />

                                {/* Label */}
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wide">
                                    {stat.label}
                                </h3>
                            </div>

                            {/* Hover Glow Effect - Specific to card part of spectrum */}
                            <div className={`absolute inset-0 rounded-[2rem] opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${stat.color} blur-2xl -z-0`} />

                            {/* Subtle Border Hover */}
                            <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent group-hover:border-purple-200/50 transition-colors duration-500 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
