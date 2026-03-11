"use client";

import { useState } from "react";

type Step = "input" | "clarify" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("input");

  const [event, setEvent] = useState("");
  const [originalEvent, setOriginalEvent] = useState("");

  const [question1, setQuestion1] = useState("");
  const [question2, setQuestion2] = useState("");

  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 第一次分析
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
        setLoading(false);
        return;
      }

      const text: string = data.result;

      // ✅ 检测是否需要澄清
      if (text.includes("【需要澄清】")) {
        const questions = text
          .split("\n")
          .filter((line: string) => line.includes("问题"));

        setQuestion1(questions[0]?.replace(/-?\s*问题1：?/, "").trim() || "");
        setQuestion2(questions[1]?.replace(/-?\s*问题2：?/, "").trim() || "");

        setOriginalEvent(event);
        setStep("clarify");
      } else {
        setResult(text);
        setStep("result");
      }
    } catch {
      setError("网络错误");
    }

    setLoading(false);
  };

  // ✅ 提交澄清回答
  const submitClarification = async () => {
    if (!answer1.trim() && !answer2.trim()) return;

    setLoading(true);
    setError("");

    try {
      const mergedPrompt = `
用户原始描述：
${originalEvent}

针对澄清问题的回答：
问题1：${answer1}
问题2：${answer2}

请基于完整信息，输出最终结构化分析。
`;

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: mergedPrompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "请求失败");
      } else {
        setResult(data.result);
        setStep("result");
      }
    } catch {
      setError("网络错误");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-8">

        {/* 标题 */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            情绪结构实验室
          </h1>
          <p className="mt-3 text-neutral-500 text-sm">
            用结构化方式理解情绪，而不是被情绪控制
          </p>
        </div>

        {/* STEP 1 输入 */}
        {step === "input" && (
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
        )}

        {/* STEP 2 澄清 */}
        {step === "clarify" && (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 space-y-6">
            <div className="text-sm text-neutral-600">
              为了更准确理解，请补充以下信息：
            </div>

            <div>
              <label className="text-sm font-medium">{question1}</label>
              <textarea
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
                className="w-full mt-2 h-24 resize-none rounded-lg border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium">{question2}</label>
              <textarea
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
                className="w-full mt-2 h-24 resize-none rounded-lg border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <button
              onClick={submitClarification}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "分析中..." : "继续分析"}
            </button>
          </div>
        )}

        {/* STEP 3 结果 */}
        {step === "result" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </div>

            <div className="text-center">
              <button
                onClick={() => {
                  setStep("input");
                  setEvent("");
                  setResult("");
                }}
                className="text-sm text-neutral-500 hover:text-black underline"
              >
                重新开始
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
