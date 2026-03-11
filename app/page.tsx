"use client";

import { useState } from "react";

export default function Home() {
  const [event, setEvent] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setResult("");

    if (event.length < 5) {
      setError("请描述得更具体一些");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "请求失败");
      } else {
        setResult(data.result);
      }
    } catch (err) {
      setError("网络错误");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-4">
          情绪结构实验室
        </h1>

        <textarea
          className="w-full border rounded p-3 mb-4"
          rows={5}
          placeholder="描述最近让你情绪波动的一件事..."
          value={event}
          onChange={(e) => setEvent(e.target.value)}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded w-full"
        >
          {loading ? "分析中..." : "开始分析"}
        </button>

        {error && (
          <div className="text-red-500 mt-4">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 whitespace-pre-wrap border p-4 rounded bg-gray-100">
            {result}
          </div>
        )}
      </div>
    </main>
  );
}