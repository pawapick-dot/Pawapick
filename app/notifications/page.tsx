// app/notifications/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot, writeBatch, doc } from "firebase/firestore";
import { Bell, CheckCircle2, Trophy, Wallet, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type NotificationType = {
  id: string;
  title: string;
  message: string;
  type: "game_win" | "game_loss" | "deposit" | "withdrawal" | "system";
  isRead: boolean;
  createdAt: any;
};

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const alerts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as NotificationType[];
      
      setNotifications(alerts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    const batch = writeBatch(db);
    const unreadDocs = notifications.filter(n => !n.isRead);
    
    unreadDocs.forEach((notification) => {
      const ref = doc(db, "notifications", notification.id);
      batch.update(ref, { isRead: true });
    });

    await batch.commit();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "game_win": return <Trophy className="text-amber-500" size={20} />;
      case "game_loss": return <XCircle className="text-rose-500" size={20} />;
      case "deposit": return <Wallet className="text-emerald-500" size={20} />;
      default: return <Bell className="text-blue-500" size={20} />;
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-50 flex justify-center pt-20"><div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full"></div></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">You're all caught up</h3>
            <p className="text-slate-500">No new notifications right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((alert) => (
              <div 
                key={alert.id} 
                className={`bg-white rounded-xl p-4 border transition-all ${
                  alert.isRead ? "border-slate-200 opacity-75" : "border-blue-100 shadow-md ring-1 ring-blue-50"
                }`}
              >
                <div className="flex gap-4 items-start">
                  <div className={`p-2.5 rounded-full mt-1 ${alert.isRead ? "bg-slate-50" : "bg-blue-50"}`}>
                    {getIcon(alert.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-bold text-sm ${alert.isRead ? "text-slate-700" : "text-slate-900"}`}>
                        {alert.title}
                      </h4>
                      {alert.createdAt && (
                        <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <Clock size={12} />
                          {formatDistanceToNow(alert.createdAt.toDate(), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mt-1 leading-relaxed ${alert.isRead ? "text-slate-500" : "text-slate-600 font-medium"}`}>
                      {alert.message}
                    </p>
                  </div>
                  {!alert.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 shrink-0"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
