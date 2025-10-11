"use client";

import React, { useEffect, useState } from "react";
import AssetCard from "../../components/AssetCard";

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

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`${API_URL}/favorites`);
      const data = await res.json();
      setFavorites(data);
    } catch (error) {
      console.error("Failed to fetch favorites", error);
    }
  };

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
      }
    } catch (error) {
      console.error("Failed to toggle favorite", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6">Favorites</h1>
      {favorites.length === 0 ? (
        <p className="text-gray-600">No favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {favorites.map((asset) => (
            <AssetCard
              key={asset.id}
              {...asset}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
