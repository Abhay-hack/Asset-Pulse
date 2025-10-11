import React from "react";
import Link from "next/link";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12 border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        {/* About */}
        <div>
          <h3 className="text-white text-lg font-bold mb-3">About</h3>
          <p className="text-gray-400 text-sm">
            Asset Tracker helps you monitor financial and digital assets, mark favorites, and stay up-to-date with prices.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-bold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-gray-400">
            <li>
              <Link href="/" className="hover:text-yellow-400 transition-colors">Dashboard</Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:text-yellow-400 transition-colors">Favorites</Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-yellow-400 transition-colors">Contact</Link>
            </li>
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white text-lg font-bold mb-3">Follow Me</h3>
          <div className="flex space-x-4 text-gray-400">
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors text-2xl"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors text-2xl"
              aria-label="Twitter"
            >
              <FaTwitter />
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors text-2xl"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white text-lg font-bold mb-3">Contact</h3>
          <p className="text-gray-400 text-sm mb-2">Email: <a href="mailto:guptaabhay@tutamail.com" className="hover:text-yellow-400">guptaabhay@tutamail.com</a></p>
        </div>
      </div>

      <div className="text-center text-gray-500 text-sm py-4 border-t border-gray-700">
        © {currentYear} Asset Tracker. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
