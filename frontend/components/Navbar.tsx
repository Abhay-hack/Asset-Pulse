"use client";

import Link from "next/link";
import React, { useState } from "react";
import { FiMenu, FiX } from "react-icons/fi";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <nav className="bg-gradient-to-r from-slate-800 via-slate-900 to-indigo-900 text-white shadow-2xl fixed w-full z-50 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Title */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold tracking-wide bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent animate-pulse-slow">
                Asset Pulse
              </h1>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="relative group font-medium transition-all duration-500 hover:text-cyan-300 cursor-pointer"
              >
                <span className="relative z-10">Dashboard</span>
                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-500 group-hover:w-full"></span>
              </Link>
              <Link
                href="/favorites"
                className="relative group font-medium transition-all duration-500 hover:text-cyan-300 cursor-pointer"
              >
                <span className="relative z-10">Favorites</span>
                <span className="absolute inset-0 -z-10 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-500 group-hover:w-full"></span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-white focus:outline-none text-2xl transition-transform duration-300 hover:scale-110"
              >
                {isOpen ? <FiX className="animate-spin-once" /> : <FiMenu />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-gradient-to-b from-slate-800/95 to-indigo-900/95 backdrop-blur-lg flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-md px-6 space-y-6">
              <Link
                href="/"
                className="block py-4 text-2xl font-bold text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 rounded-xl text-center hover:pl-0"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/favorites"
                className="block py-4 text-2xl font-bold text-white hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300 rounded-xl text-center hover:pl-0"
                onClick={() => setIsOpen(false)}
              >
                Favorites
              </Link>
            </div>
          </div>
          {/* Close button overlay */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-white text-3xl p-2 rounded-full hover:bg-white/10 transition-colors duration-300"
          >
            <FiX />
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation: spin-once 0.5s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Navbar;