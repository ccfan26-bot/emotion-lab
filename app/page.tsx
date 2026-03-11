"use client";

import { useState } from "react";

export default function Home() {
  const [event, setEvent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!event.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "请求失败");
      } else {
        setResult(data.result);
      }
    } catch {
      setError("网络错误");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex justify-center px-4 py-16">
      <div className="w-full max-w-2xl">

        {/* 标题区域 */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            情绪结构实验室
          </h1>
          <p className="mt-3 text-neutral-500 text-sm">
            用结构化方式理解情绪，而不是被情绪控制
          </p>
        </div>

        {/* 输入卡片 */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-4">
          <textarea
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="描述最近困扰你的事情..."
            className="w-full h-40 resize-none rounded-lg border border-neutral-200 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-black transition"
          />

          <button
            onClick={analyze}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "分析中..." : "开始分析"}
          </button>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
        </div>

        {/* 结果区域 */}
        {result && (
          <div className="mt-8 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 whitespace-pre-wrap text-sm leading-relaxed">
            {result}
          </div>
        )}

      </div>
    </main>
  );
}
