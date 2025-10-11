"use client";

import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

const ContactUsPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Please fill all fields!");
      return;
    }

    setLoading(true);
    try {
      // Example: send to your backend API
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        toast.success("Message sent successfully!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        toast.error("Failed to send message.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        {/* Background subtle pattern or shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 animate-shimmer"></div>

        <Toaster position="top-right" />

        <div className="relative z-10 max-w-3xl mx-auto animate-fade-in">
          <div className="bg-white/10 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20 p-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4 tracking-wide">
              Contact Us
            </h2>
            <p className="text-gray-300 mb-6">
              Have questions or feedback? Fill out the form below and we’ll get back to you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-400"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-400 resize-none"
                  placeholder="Your message..."
                  rows={5}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl hover:bg-white/20 hover:border-cyan-400/50 hover:shadow-cyan-500/25 transition-all duration-300 hover:scale-105 text-white font-medium relative group overflow-hidden w-full"
              >
                <span className="relative z-10">{loading ? "Sending..." : "Send Message"}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></span>
              </button>
            </form>

            <div className="mt-6 text-gray-400 text-sm text-center">
              Or reach us directly at{" "}
              <a href="mailto:guptaabhay@tutamail.com" className="hover:text-cyan-300 transition-colors duration-300 underline decoration-cyan-400/50">
                guptaabhay@tutamail.com
              </a>
            </div>
          </div>
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

export default ContactUsPage;