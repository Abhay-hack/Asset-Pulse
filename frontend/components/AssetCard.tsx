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
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-700 shadow-lg rounded-xl p-5 flex flex-col justify-between relative overflow-hidden border border-gray-200 dark:border-gray-600"
    >
      {/* Asset info */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{name}</h2>
        <p className="text-gray-500 dark:text-gray-300 uppercase tracking-wider">{symbol}</p>
        <p className="mt-3 text-green-600 dark:text-green-400 font-semibold text-lg">
          ₹{price.toFixed(2)}
        </p>
      </div>

      {/* Favorite button with pop and color animation */}
      <motion.button
        onClick={() => onToggleFavorite(id)}
        animate={{
          scale: is_favorite ? 1.3 : 1,
          color: is_favorite ? "#facc15" : "#9ca3af", // yellow-400 vs gray-400
        }}
        transition={{ type: "spring", stiffness: 300 }}
        className="absolute top-4 right-4 text-2xl cursor-pointer"
        aria-label={is_favorite ? "Remove from favorites" : "Add to favorites"}
      >
        ⭐
      </motion.button>

      {/* Decorative gradient line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-b-xl"></div>
    </motion.div>
  );
};

export default AssetCard;
