'use client';
import { motion } from 'framer-motion';

interface LeavesProps {
  isVisible: boolean;
}

export function Leaves({ isVisible }: LeavesProps) {
  if (!isVisible) return null;
  
  return (
    <g>
      <motion.path
        d="M200,260 Q160,240 140,220 Q160,280 200,260"
        fill="#7B9E89"
        initial={{ scale: 0, opacity: 0, originX: '200px', originY: '260px' }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
      />
      <motion.path
        d="M200,280 Q240,260 260,240 Q250,300 200,280"
        fill="#7B9E89"
        initial={{ scale: 0, opacity: 0, originX: '200px', originY: '280px' }}
        animate={{ scale: 1, opacity: 0.8 }}
        transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
      />
    </g>
  );
}
