import { motion } from 'framer-motion';

export function AuroraBackground() {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base Gradient - Lighter with orange touches */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-violet-900/15 to-gray-900" />

            {/* Animated Aurora Blobs */}
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
                className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-violet-500/25 rounded-full blur-[120px]"
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
                className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-orange-500/15 rounded-full blur-[100px]"
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
                className="absolute top-1/2 left-1/2 w-[700px] h-[700px] bg-purple-400/20 rounded-full blur-[110px]"
            />
        </div>
    );
}
