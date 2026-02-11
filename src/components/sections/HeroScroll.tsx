import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const heroImages = [
    '/images/projects/hero-1.png',  // Groupe devant La Base
    '/images/projects/hero-2.png',  // Conférence
    '/images/projects/hero-3.png',  // Présentation orientation
    '/images/projects/hero-4.png'   // Groupe en gare
];

export function HeroScroll() {
    const targetRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"]
    });

    // --- SCROLL TRANSFORMS ---
    // Text Parallax: Moves up faster than scroll to start, then fades out
    const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "-100%"]);
    const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

    // Image Frame Transforms
    const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.1]);
    const borderRadius = useTransform(scrollYProgress, [0, 0.5], ["3rem", "0rem"]);
    // Zoom effect ONLY on the last image (starts when opacity4 fade-in begins around 0.7)
    const imageZoom = useTransform(scrollYProgress, [0.7, 1], [1, 1.25]);
    const overlayOpacity = useTransform(scrollYProgress, [0.3, 0.8], [0, 0.6]);

    // --- MIRROR IMAGE SEQUENCE ---
    // We want to flip through images as we scroll.
    // Length is 4. Ranges: 0-0.25, 0.25-0.5, 0.5-0.75, 0.75-1.0
    // We'll use opacity keyframes to smooth blend them
    const opacity1 = useTransform(scrollYProgress, [0, 0.2, 0.25], [1, 1, 0]);
    const opacity2 = useTransform(scrollYProgress, [0.2, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
    const opacity3 = useTransform(scrollYProgress, [0.45, 0.5, 0.7, 0.75], [0, 1, 1, 0]);
    const opacity4 = useTransform(scrollYProgress, [0.7, 0.75, 1], [0, 1, 1]);

    return (
        // TALL CONTAINER FOR SCROLL TRAVEL
        <div ref={targetRef} className="relative h-[300vh]">

            {/* STICKY VIEWPORT */}
            <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">

                {/* --- BACKGROUND IMAGE FRAME --- */}
                <motion.div
                    style={{ scale, borderRadius }}
                    className="absolute inset-0 z-0 overflow-hidden shadow-2xl border border-white/10"
                >
                    {/* STACKED IMAGES FOR SEQUENCE - Fill entire frame */}
                    {/* All images share the same zoom effect but cross-fade via opacity */}
                    <motion.div style={{ scale: imageZoom }} className="absolute inset-0">
                        <motion.img
                            style={{ opacity: opacity1 }}
                            src={heroImages[0]}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <motion.img
                            style={{ opacity: opacity2 }}
                            src={heroImages[1]}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <motion.img
                            style={{ opacity: opacity3 }}
                            src={heroImages[2]}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <motion.img
                            style={{ opacity: opacity4 }}
                            src={heroImages[3]}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Dynamic Overlay */}
                    <motion.div
                        style={{ opacity: overlayOpacity }}
                        className="absolute inset-0 bg-black pointer-events-none"
                    />

                    {/* Fixed Gradient for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
                </motion.div>

                {/* --- CONTENT LAYER --- */}
                <div className="relative z-10 container mx-auto px-6 h-full flex flex-col items-center text-center pb-20 pt-32">
                    <motion.div style={{ y: textY, opacity: textOpacity }} className="max-w-5xl">

                        {/* Label Badge */}
                        <div className="inline-block py-2 px-6 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm md:text-base mb-8 shadow-lg">
                            Depuis 2011 • Kedge Business School
                        </div>

                        {/* HEADLINE */}
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-white mb-12 leading-[0.9] tracking-tight uppercase drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                            <span className="drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]">L'Égalité</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-purple-500 to-violet-600 drop-shadow-[0_0_30px_rgba(124,58,237,0.8)] filter">
                                des Chances
                            </span>
                        </h1>

                        {/* CTA BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                            <Link
                                to="/projets"
                                className="group px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center gap-3"
                            >
                                Découvrir nos projets
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <Link
                                to="/contact"
                                className="px-10 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-bold text-lg hover:bg-white/20 transition-all"
                            >
                                Nous rejoindre
                            </Link>
                        </div>

                    </motion.div>
                </div>

            </div>
        </div>
    );
}
