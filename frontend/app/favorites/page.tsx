"use client";

import React, { useCallback, useEffect, useState } from "react";
import AssetCard from "../../components/AssetCard";
import toast from "react-hot-toast";

type Asset = {
  id: number;
  name: string;
  symbol: string;
  price: number;
  is_favorite: boolean;
  created_at: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const FavoritesPage: React.FC = () => {
  const [favorites, setFavorites] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/favorites`);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error("Fetch favorites error:", error);
      toast.error("Failed to fetch favorites");
    }
    setLoading(false);
  };

  // Refresh handler for live prices
  const refreshFavorites = useCallback(async () => {
    await fetchFavorites();
    toast.success("Favorites refreshed with latest prices!");
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleToggleFavorite = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/assets/${id}/favorite`, {
        method: "PATCH",
      });
      if (res.ok) {
        setFavorites((prev) => prev.filter((asset) => asset.id !== id));
        toast.success("Removed from favorites!");
      } else {
        const errorData = await res.json();
        toast.error(errorData.detail || "Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      toast.error("Failed to toggle favorite");
    }
  };

  return (
    <>
      <div className="min-h-screen p-6 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Background subtle pattern or shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-shimmer"></div>

        <div className="relative z-10">
          {/* Header + Refresh */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 animate-fade-in">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
              Favorites
            </h1>
            <button
              onClick={refreshFavorites}
              disabled={loading}
              className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300 text-white text-sm font-medium disabled:opacity-50"
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
          </div>

          {favorites.length === 0 ? (
            <div className="relative z-10 flex items-center justify-center min-h-[400px] animate-slide-up">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 text-center shadow-2xl">
                <p className="text-gray-400 text-lg">No favorites yet.</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-slide-up">
              {favorites.map((asset, idx) => (
                <div key={asset.id} className="animate-slide-up-delay" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <AssetCard
                    {...asset}
                    onToggleFavorite={handleToggleFavorite}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
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

export default FavoritesPage;