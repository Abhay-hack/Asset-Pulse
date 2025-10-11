"use client";

import React from "react";
import { motion } from "framer-motion";

type AssetCardProps = {
  id: number;
  name: string;
  symbol: string;
  price: number;
  is_favorite: boolean;
  onToggleFavorite: (id: number) => void;
};

const AssetCard: React.FC<AssetCardProps> = ({
  id,
  name,
  symbol,
  price,
  is_favorite,
  onToggleFavorite,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -2,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" 
      }}
      whileTap={{ scale: 0.98 }}
      className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden group"
      style={{
        background: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
      }}
    >
      {/* Subtle shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 opacity-0 group-hover:opacity-100"></div>

      {/* Asset info */}
      <div className="relative z-10">
        <h2 className="text-xl font-bold bg-gradient-to-r from-white to-cyan-300 bg-clip-text text-transparent tracking-wide">
          {name}
        </h2>
        <p className="text-cyan-200/80 uppercase tracking-wider text-sm mt-1 font-medium">
          {symbol}
        </p>
        <p className="mt-4 text-green-400 font-semibold text-lg bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          ₹{price.toFixed(2)}
        </p>
      </div>

      {/* Favorite button with pop and color animation */}
      <motion.button
        onClick={() => onToggleFavorite(id)}
        initial={{ scale: 1 }}
        animate={{
          scale: is_favorite ? 1.2 : 1,
          rotate: is_favorite ? 10 : 0,
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 10 
        }}
        className="absolute top-4 right-4 text-2xl cursor-pointer z-10 bg-white/10 rounded-full p-2 backdrop-blur-sm border border-white/20 hover:bg-yellow-400/20 transition-colors duration-300"
        aria-label={is_favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <motion.span
          animate={{ 
            color: is_favorite ? "#fbbf24" : "#6b7280" 
          }}
          transition={{ duration: 0.2 }}
        >
          ⭐
        </motion.span>
      </motion.button>

      {/* Decorative gradient border bottom */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400/50 to-blue-400/50 rounded-b-2xl"></div>
    </motion.div>
  );
};

export default AssetCard;