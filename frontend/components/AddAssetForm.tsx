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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0  bg-opacity-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md z-10 animate-fadeIn"
      >
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">Add New Asset</h2>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Apple Inc."
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="AAPL"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-1">Price(₹)</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="145.50"
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
            required
          />
        </div>

        <div className="mb-4 flex items-center">
          <input
            type="checkbox"
            checked={isFavorite}
            onChange={(e) => setIsFavorite(e.target.checked)}
            className="h-5 w-5 text-yellow-400 focus:ring-yellow-300 rounded"
          />
          <label className="ml-2 text-gray-700 font-medium">Mark as Favorite</label>
        </div>

        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Add Asset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg hover:bg-gray-400 transition shadow-md"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAssetForm;
