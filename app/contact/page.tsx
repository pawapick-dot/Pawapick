// app/contact/page.tsx
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="w-full min-h-screen bg-slate-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-900 transition-colors font-semibold text-sm bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* Contact Info */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">Get in touch</h1>
          <p className="text-slate-500 font-medium mb-8 leading-relaxed">
            Have a question, partnership proposal, or feedback regarding the platform? We'd love to hear from you.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Us</p>
                <p className="font-bold text-slate-900 mt-0.5">hello@pawapick.com</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center shrink-0">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headquarters</p>
                <p className="font-bold text-slate-900 mt-0.5">Kabale, Uganda</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <form className="space-y-5">
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 block">Your Name</label>
              <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="John Doe" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 block">Email Address</label>
              <input type="email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" placeholder="john@example.com" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2 block">Message</label>
              <textarea rows={4} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none" placeholder="How can we help?"></textarea>
            </div>
            <button type="button" className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center gap-2">
              <MessageSquare size={18} /> Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
