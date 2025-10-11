"use client";

import Link from "next/link";
import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Title */}
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold tracking-wide">Asset Pulse</h1>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-8">
            <Link
              href="/"
              className="relative group font-medium transition-colors duration-300 hover:text-gray-200"
            >
              Dashboard
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
            <Link
              href="/favorites"
              className="relative group font-medium transition-colors duration-300 hover:text-gray-200"
            >
              Favorites
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-white transition-all group-hover:w-full"></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none text-2xl"
            >
              {isOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700/90 backdrop-blur-sm transition-all">
          <Link
            href="/"
            className="block px-4 py-2 text-white font-medium hover:bg-blue-500 transition"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/favorites"
            className="block px-4 py-2 text-white font-medium hover:bg-blue-500 transition"
            onClick={() => setIsOpen(false)}
          >
            Favourites
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
