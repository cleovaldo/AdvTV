import { motion } from 'motion/react';
import Logo from './Logo';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#081425]"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
        className="flex flex-col items-center gap-8"
      >
        <Logo size={80} showText={true} />
        
        <div className="flex flex-col items-center gap-4">
          <div className="w-48 h-1 bg-[#1a2b45] rounded-full overflow-hidden">
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ 
                repeat: Infinity, 
                duration: 1.5, 
                ease: "linear" 
              }}
              className="w-full h-full bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent"
            />
          </div>
          <p className="text-[#64748b] text-sm font-medium tracking-widest uppercase animate-pulse">
            Iniciando Sistema...
          </p>
        </div>
      </motion.div>

      <div className="absolute bottom-12 text-[#334155] text-xs font-medium">
        © 2026 Batista & Saraiva TV • Batista & Saraiva
      </div>
    </motion.div>
  );
}
