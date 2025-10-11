"use client";

import React, { useState } from "react";

type AddAssetFormProps = {
  onAddAsset: (name: string, symbol: string, price: number, is_favorite: boolean) => void;
  showForm: boolean;
  onClose: () => void;
};

const AddAssetForm: React.FC<AddAssetFormProps> = ({ onAddAsset, showForm, onClose }) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [price, setPrice] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !symbol || !price) return;
    onAddAsset(name, symbol, parseFloat(price), isFavorite);
    setName("");
    setSymbol("");
    setPrice("");
    setIsFavorite(false);
  };

  if (!showForm) return null;

  return (
    <>
      <div className="inset-0 z-50 flex items-center p-4 animate-fade-in">
        <div
          className="inset-0 bg-white/60 backdrop-blur-md"
          onClick={onClose}
        ></div>

        {/* Form container */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 p-8 w-full max-w-md z-30 animate-scale-in"
        >
          <h2 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Add New Asset
          </h2>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Reliance Industries"
              className="w-full px-4 py-3 rounded-xl border border-transparent bg-white/5 backdrop-blur-xl focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/50 transition-all duration-300 text-white placeholder-gray-400 relative z-20 "
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="RELIANCE"
              className="w-full px-4 py-3 rounded-xl border border-transparent bg-white/5  focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/50 transition-all duration-300 text-white placeholder-gray-400 relative z-20 outline-none"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-white font-medium mb-2">Price(₹)</label>
            <input
              type="number"
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1380"
              className="w-full px-4 py-3 rounded-xl border border-transparent bg-white/5 backdrop-blur-xl focus:ring-2 focus:ring-violet-400/30 focus:border-violet-400/50 transition-all duration-300 text-white placeholder-gray-400 relative z-20"
              required
            />
          </div>

          <div className="mb-6 flex items-center">
            <input
              type="checkbox"
              id="favorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="h-5 w-5 text-amber-400 focus:ring-amber-300 rounded border-white/30 bg-transparent relative z-20"
            />
            <label htmlFor="favorite" className="ml-2 text-gray-300 font-medium cursor-pointer select-none">
              Mark as Favorite
            </label>
          </div>

          <div className="flex justify-between space-x-4">
            <button
              type="submit"
              className="flex-1 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl hover:bg-white/15 hover:border-violet-400/50 hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105 text-white font-medium relative group overflow-hidden z-20"
            >
              <span className="relative z-10">Add Asset</span>
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800/30 text-gray-300 rounded-xl hover:bg-gray-700/40 transition-all duration-300 hover:scale-105 font-medium backdrop-blur-xl border border-white/10 z-20"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default AddAssetForm;