"use client";

import React from "react";
import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-900 text-gray-300 mt-12 border-t border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-shimmer"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* About */}
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              About
            </h3>
            <p className="text-gray-400 text-sm relative z-10">
              Asset Tracker helps you monitor financial and digital assets, mark favorites, and stay up-to-date with prices.
            </p>
          </div>

          {/* Quick Links */}
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Quick Links
            </h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link 
                  href="/" 
                  className="hover:text-cyan-300 transition-all duration-300 hover:translate-x-2 relative group"
                >
                  Dashboard
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/favorites" 
                  className="hover:text-cyan-300 transition-all duration-300 hover:translate-x-2 relative group"
                >
                  Favorites
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="hover:text-cyan-300 transition-all duration-300 hover:translate-x-2 relative group"
                >
                  Contact
                  <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Follow Me
            </h3>
            <div className="flex space-x-4 text-gray-400">
              <a
                href="https://github.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-all duration-300 hover:scale-110 hover:rotate-12 text-2xl relative group"
                aria-label="GitHub"
              >
                <FaGithub />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></span>
              </a>
              <a
                href="https://twitter.com/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-all duration-300 hover:scale-110 hover:rotate-12 text-2xl relative group"
                aria-label="Twitter"
              >
                <FaTwitter />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></span>
              </a>
              <a
                href="https://linkedin.com/in/yourusername"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-all duration-300 hover:scale-110 hover:rotate-12 text-2xl relative group"
                aria-label="LinkedIn"
              >
                <FaLinkedin />
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-all duration-300 -z-10"></span>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="relative z-10">
            <h3 className="text-white text-lg font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Contact
            </h3>
            <p className="text-gray-400 text-sm mb-2 relative z-10">
              Email: <a href="mailto:guptaabhay@tutamail.com" className="hover:text-cyan-300 transition-all duration-300 underline decoration-cyan-400/50">guptaabhay@tutamail.com</a>
            </p>
          </div>
        </div>

        <div className="relative z-10 text-center text-gray-500 text-sm py-4 border-t border-slate-700/50">
          © {currentYear} Asset Tracker. All rights reserved.
        </div>
      </footer>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Footer;