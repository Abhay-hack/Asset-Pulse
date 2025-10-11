"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  const [darkMode, setDarkMode] = useState(true); // Default to dark for glassmorphism

  // Fetch assets from DB only (no live API update)
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/assets?refresh=false`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAssets(data);
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error("Failed to fetch assets");
    }
    setLoading(false);
  };

  // Refresh handler: Fetch with live API updates
  const refreshAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/assets?refresh=true`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setAssets(data);
      toast.success("Assets refreshed with latest prices!");
    } catch (error) {
      console.error("Refresh error:", error);
      toast.error("Failed to refresh prices");
    }
    setLoading(false);
  }, []);

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
        // Optional: Auto-refresh after add to check live price
        // refreshAssets();
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Failed to add asset");
      }
    } catch (error) {
      console.error("Add asset error:", error);
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
        toast.success("Favorite toggled!");
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Failed to update favorite");
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
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
    if (sort === "price") return a.price - b.price;
    if (sort === "favorites") return b.is_favorite === a.is_favorite ? 0 : b.is_favorite ? -1 : 1;
    return 0;
  });

  return (
    <>
      <div className="min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Background subtle pattern or shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-shimmer"></div>

        <Toaster position="top-right" />

        {/* Header */}
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
            Dashboard
          </h1>
        </div>

        {/* Search & Sort + Refresh */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 mb-6 animate-slide-up">
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 w-full sm:w-1/2 text-white placeholder-gray-400"
          />
          <select
            value={sort}
            onChange={e => setSort(e.target.value as any)}
            className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 w-full sm:w-1/4 text-white"
          >
            <option value="" className="bg-slate-800 text-white">Sort By</option>
            <option value="name" className="bg-slate-800 text-white">Name</option>
            <option value="price" className="bg-slate-800 text-white">Price</option>
            <option value="favorites" className="bg-slate-800 text-white">Favorites</option>
          </select>
          <button
            onClick={refreshAssets}
            disabled={loading}
            className="px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 text-white sm:w-auto w-full sm:w-1/4 disabled:opacity-50"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {/* Asset cards */}
        <div className={`relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${showForm ? "blur-sm" : ""} animate-slide-up`}>
          {loading
            ? Array(6).fill(0).map((_, idx) => (
                <div key={idx} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl animate-pulse h-48" />
              ))
            : sortedAssets.map((asset, idx) => (
                <div key={asset.id} className="animate-slide-up-delay" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <AssetCard {...asset} onToggleFavorite={handleToggleFavorite} />
                </div>
              ))}
        </div>

        {/* Add Asset Button */}
        <div className="relative z-10 p-6 mb-6 flex justify-center animate-slide-up">
          <button
            onClick={() => setShowForm(true)}
            className="px-8 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl hover:bg-white/20 hover:border-cyan-400/50 hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 text-white font-medium relative group overflow-hidden"
          >
            <span className="relative z-10">Add Asset</span>
            <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}></div>
            <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
              <AddAssetForm
                onAddAsset={handleAddAsset}
                showForm={showForm}
                onClose={() => setShowForm(false)}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out;
        }
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up-delay {
          animation: slide-up-delay 0.6s ease-out;
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 20s linear infinite;
        }
      `}</style>
    </>
  );
};

export default DashboardPage;