'use client';
import { motion } from 'framer-motion';

interface StemProps {
  isVisible: boolean;
}

export function Stem({ isVisible }: StemProps) {
  if (!isVisible) return null;
  
  return (
    <motion.path
      d="M200,200 Q195,250 200,300"
      stroke="#7B9E89"
      strokeWidth="5"
      fill="transparent"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
    />
  );
}
