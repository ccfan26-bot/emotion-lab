"use client";

import { useState } from "react";

type Step = "input" | "clarify" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("input");

  const [context, setContext] = useState("");
  const [currentInput, setCurrentInput] = useState("");

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const runAnalysis = async (fullText: string) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: fullText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "请求失败");
        setLoading(false);
        return;
      }

      const text: string = data.result;

      if (text.includes("【需要澄清】")) {
        const qs = text
          .split("\n")
          .filter((line: string) => line.includes("问题"))
          .map((q) =>
            q.replace(/-?\s*问题\d+：?/, "").trim()
          );

        setQuestions(qs);
        setAnswers(new Array(qs.length).fill(""));
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

  const handleInitialSubmit = () => {
    if (!currentInput.trim()) return;

    const newContext = `
用户描述：
${currentInput}
`;

    setContext(newContext);
    setCurrentInput("");
    runAnalysis(newContext);
  };

  const handleClarifySubmit = () => {
    const clarificationBlock = `
澄清回答：
${questions
  .map((q, i) => `问题：${q}\n回答：${answers[i] || ""}`)
  .join("\n\n")}
`;

    const newContext = context + "\n" + clarificationBlock;

    setContext(newContext);
    runAnalysis(newContext);
  };

  const handleRefineSubmit = () => {
    if (!currentInput.trim()) return;

    const refineBlock = `
用户补充：
${currentInput}
`;

    const newContext = context + "\n" + refineBlock;

    setContext(newContext);
    setCurrentInput("");
    runAnalysis(newContext);
  };

  const renderStructuredResult = () => {
    const sections = result.split(/\n(?=\d+\.)/);

    return sections.map((section, index) => (
      <div
        key={index}
        className="bg-white border border-neutral-200 rounded-2xl p-6 text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap"
      >
        {section}
      </div>
    ));
  };

  return (
    <main className="min-h-screen bg-neutral-100 flex justify-center px-4 py-28">
      <div className="w-full max-w-2xl space-y-16">

        {/* 品牌区 */}
        <div className="text-center space-y-6">

          <div className="flex justify-center">
            <img
              src="/logo.svg"
              alt="情绪结构 Logo"
              className="w-16 h-auto"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-wide text-neutral-900">
              情绪结构
            </h1>

            <p className="text-sm text-neutral-500 tracking-wide">
              把混乱变成结构
            </p>
          </div>

        </div>

        {/* 输入阶段 */}
        {step === "input" && (
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-6">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="描述正在困扰你的事情..."
              className="w-full h-40 resize-none rounded-lg border border-neutral-200 p-4 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
            />

            <button
              onClick={handleInitialSubmit}
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 rounded-lg text-sm font-medium tracking-wide hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "分析中..." : "开始分析"}
            </button>
          </section>
        )}

        {/* 澄清阶段 */}
        {step === "clarify" && (
          <section className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-8">
            <div className="text-sm text-neutral-500">
              为了更准确理解，请补充以下信息：
            </div>

            {questions.map((q, i) => (
              <div key={i} className="space-y-2">
                <label className="text-sm font-medium text-neutral-800">
                  {q}
                </label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                  className="w-full h-24 resize-none rounded-lg border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
              </div>
            ))}

            <button
              onClick={handleClarifySubmit}
              disabled={loading}
              className="w-full bg-neutral-900 text-white py-3 rounded-lg text-sm font-medium tracking-wide"
            >
              {loading ? "分析中..." : "继续分析"}
            </button>
          </section>
        )}

        {/* 结果阶段 */}
        {step === "result" && (
          <section className="space-y-6">

            {renderStructuredResult()}

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 space-y-4">
              <div className="text-sm text-neutral-500">
                还有需要补充的信息吗？
              </div>

              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="补充新的背景、感受或细节..."
                className="w-full h-24 resize-none rounded-lg border border-neutral-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              />

              <button
                onClick={handleRefineSubmit}
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-3 rounded-lg text-sm font-medium tracking-wide"
              >
                {loading ? "更新中..." : "更新分析"}
              </button>
            </div>

          </section>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

      </div>
    </main>
  );
}
