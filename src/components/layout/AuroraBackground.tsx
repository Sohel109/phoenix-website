import { motion } from 'framer-motion';

export function AuroraBackground() {
    // Skip expensive aurora animations on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base Gradient — neutre, sans teinte violette envahissante */}
            <div className="absolute inset-0 bg-gray-950" />

            {/* Animated Aurora Blobs - Only on desktop, opacités et tailles réduites */}
            {!isMobile && (
                <>
                    <motion.div
                        animate={{
                            x: [0, 100, 0],
                            y: [0, -100, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/10 rounded-full blur-[120px]"
                    />

                    <motion.div
                        animate={{
                            x: [0, -150, 0],
                            y: [0, 100, 0],
                            scale: [1, 1.3, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                        className="absolute bottom-0 right-1/4 w-[450px] h-[450px] bg-orange-500/8 rounded-full blur-[100px]"
                    />

                    <motion.div
                        animate={{
                            x: [0, 80, 0],
                            y: [0, -80, 0],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 18,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 5
                        }}
                        className="absolute top-1/2 left-1/2 w-[550px] h-[550px] bg-purple-400/8 rounded-full blur-[110px]"
                    />
                </>
            )}
        </div>
    );
}
