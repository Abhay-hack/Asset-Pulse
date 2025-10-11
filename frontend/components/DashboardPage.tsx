"use client";

import React, { useEffect, useState } from "react";
import AssetCard from "./AssetCard";
import AddAssetForm from "./AddAssetForm";
import toast, { Toaster } from "react-hot-toast";

type Asset = {
  id: number;
  name: string;
  symbol: string;
  price: number;
  is_favorite: boolean;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const DashboardPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"" | "name" | "price" | "favorites">("");
  const [darkMode, setDarkMode] = useState(false);

  // Fetch assets
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/assets`);
      const data = await res.json();
      setAssets(data);
    } catch (error) {
      toast.error("Failed to fetch assets");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (name: string, symbol: string, price: number, is_favorite: boolean) => {
    try {
      const res = await fetch(`${API_URL}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, symbol, price, is_favorite }),
      });
      if (res.ok) {
        const newAsset = await res.json();
        setAssets(prev => [newAsset, ...prev]);
        setShowForm(false);
        toast.success("Asset added successfully!");
      }
    } catch {
      toast.error("Failed to add asset");
    }
  };

  const handleToggleFavorite = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/assets/${id}/favorite`, { method: "PATCH" });
      if (res.ok) {
        setAssets(prev =>
          prev.map(asset =>
            asset.id === id ? { ...asset, is_favorite: !asset.is_favorite } : asset
          )
        );
      }
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  // Filter & sort
  const filteredAssets = assets.filter(
    a =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.symbol.toLowerCase().includes(search.toLowerCase())
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "price") return b.price - a.price;
    if (sort === "favorites") return b.is_favorite === a.is_favorite ? 0 : b.is_favorite ? -1 : 1;
    return 0;
  });

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"} min-h-screen p-6`}>
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Search & Sort */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name or symbol..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg border focus:ring focus:ring-blue-200 focus:border-blue-500 transition w-full sm:w-1/2"
        />
        <select
          value={sort}
          onChange={e => setSort(e.target.value as any)}
          className="px-4 py-2 rounded-lg border focus:ring focus:ring-blue-200 focus:border-blue-500 transition w-full sm:w-1/4"
        >
          <option value="">Sort By</option>
          <option value="name">Name</option>
          <option value="price">Price</option>
          <option value="favorites">Favorites</option>
        </select>
      </div>

      {/* Asset cards */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 ${showForm ? "blur-sm" : ""}`}>
        {loading
          ? Array(6).fill(0).map((_, idx) => (
              <div key={idx} className="bg-gray-300 dark:bg-gray-700 animate-pulse h-44 rounded-xl" />
            ))
          : sortedAssets.map(asset => (
              <AssetCard key={asset.id} {...asset} onToggleFavorite={handleToggleFavorite} />
            ))}
      </div>

      {/* Add Asset Button */}
      <div className="p-6 mb-6 flex justify-center">
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Add Asset
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <AddAssetForm
          onAddAsset={handleAddAsset}
          showForm={showForm}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
