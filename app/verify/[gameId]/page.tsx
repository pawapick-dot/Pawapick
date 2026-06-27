// app/verify/[gameId]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function VerifyGame({ params }: { params: { gameId: string } }) {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // In production, build an API route for this. For MVP, we mock the fetch from our result state or build a quick fetcher.
    // Assuming you build an /api/games/receipt?id= endpoint to fetch the played game doc.
    fetch(`/api/games/receipt?id=${params.gameId}`)
      .then(res => res.json())
      .then(resData => setData(resData.game));
  }, [params.gameId]);

  if (!data) return <div className="p-8 text-center text-gray-400">Loading receipt...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 mt-4 pb-12">
      <button onClick={() => router.push("/dashboard")} className="text-sm font-semibold text-gray-500 px-2">← Dashboard</button>

      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="text-center border-b border-gray-100 pb-4">
          <h2 className="text-xl font-bold">Immutable Receipt</h2>
          <p className="text-xs text-gray-400 font-mono mt-1">ID: {data.id}</p>
        </div>

        <div className="space-y-4 text-sm">
          <div className="space-y-1">
            <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Public SHA-256 Hash (Pre-Game)</span>
            <p className="font-mono text-xs bg-gray-50 p-2 rounded-lg break-all">{data.publicHash}</p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Revealed Server Seed</span>
            <p className="font-mono text-xs bg-gray-50 p-2 rounded-lg break-all">{data.serverSeed}</p>
          </div>

          <div className="space-y-1">
            <span className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Hidden Choice</span>
            <p className="font-mono font-bold uppercase">{data.creatorChoice}</p>
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500">
            Hash the <strong>Hidden Choice</strong> and <strong>Server Seed</strong> together using standard SHA-256 to independently verify this match was not altered.
          </p>
        </div>
      </div>
    </div>
  );
}
