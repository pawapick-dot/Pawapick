"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Mail, MessageSquare, Send, AlertCircle, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const { user, openAuthModal } = useAuth();
  
  const [subject, setSubject] = useState("General Inquiry");
  const [gameId, setGameId] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return openAuthModal();
    if (!message.trim()) return toast.error("Please enter a message.");

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message, gameId: gameId.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsSuccess(true);
      toast.success("Support ticket submitted successfully!");
      setSubject("General Inquiry");
      setMessage("");
      setGameId("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column: Info & FAQs */}
        <div className="md:col-span-1 space-y-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Get in touch</h1>
            <p className="text-slate-500 font-medium text-sm leading-relaxed">
              Have a question, disputing a game result, or facing a wallet issue? Our team is here to help.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><HelpCircle size={18} /></div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Response Time</h3>
                <p className="text-xs text-slate-500 mt-0.5">We typically respond to all tickets within 2-4 hours during business days.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg shrink-0"><AlertCircle size={18} /></div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Disputing a Match?</h3>
                <p className="text-xs text-slate-500 mt-0.5">Please ensure you provide the exact Game ID found in your Match Ledger so we can investigate.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
            {isSuccess ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail size={32} className="text-emerald-500" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Ticket Received!</h2>
                <p className="text-slate-500 mb-6">Our support team is on it. We will reach out to you soon regarding your issue.</p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Topic</label>
                    <select 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Deposit Issue">Deposit Issue</option>
                      <option value="Withdrawal Issue">Withdrawal Issue</option>
                      <option value="Game Dispute">Game Dispute</option>
                      <option value="Bug Report">Report a Bug</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                      Game ID <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 5xY8pQw..."
                      value={gameId}
                      onChange={(e) => setGameId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Your Message</label>
                  <textarea 
                    rows={5}
                    placeholder="Describe your issue in detail..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder:text-slate-400 resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSubmitting ? "Submitting..." : (
                    <>
                      <Send size={18} /> Submit Ticket
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
