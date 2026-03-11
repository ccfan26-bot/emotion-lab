"use client";

import { useState } from "react";

type Step = "input" | "clarify" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("input");

  const [context, setContext] = useState(""); // ✅ 累积上下文
  const [currentInput, setCurrentInput] = useState("");

  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>(["", ""]);

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ 统一分析函数
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
        setAnswers(["", ""]);
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

  // ✅ 初始提交
  const handleInitialSubmit = () => {
    if (!currentInput.trim()) return;

    const newContext = `
用户描述：
${currentInput}
`;

    setContext(newContext);
    runAnalysis(newContext);
  };

  // ✅ 提交澄清回答
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

  // ✅ 用户补充信息
  const handleRefineSubmit = () => {
    if (!currentInput.trim()) return;

    const refineBlock = `
用户补充：
${currentInput}
`;

    const newContext = context + "\n" + refineBlock;

    setContext(newContext);
    runAnalysis(newContext);
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
            结构化拆解，而不是情绪发泄
          </p>
        </div>

        {/* 输入阶段 */}
        {step === "input" && (
          <div className="bg-white rounded-2xl p-6 border space-y-4">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="描述你的情况..."
              className="w-full h-40 resize-none rounded-lg border p-4 text-sm"
            />

            <button
              onClick={handleInitialSubmit}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              {loading ? "分析中..." : "开始分析"}
            </button>
          </div>
        )}

        {/* 澄清阶段 */}
        {step === "clarify" && (
          <div className="bg-white rounded-2xl p-6 border space-y-6">
            <div className="text-sm text-neutral-600">
              为了更准确理解，请补充：
            </div>

            {questions.map((q, i) => (
              <div key={i}>
                <label className="text-sm font-medium">{q}</label>
                <textarea
                  value={answers[i] || ""}
                  onChange={(e) => {
                    const updated = [...answers];
                    updated[i] = e.target.value;
                    setAnswers(updated);
                  }}
                  className="w-full mt-2 h-24 resize-none rounded-lg border p-3 text-sm"
                />
              </div>
            ))}

            <button
              onClick={handleClarifySubmit}
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg"
            >
              {loading ? "分析中..." : "继续分析"}
            </button>
          </div>
        )}

        {/* 结果阶段 */}
        {step === "result" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </div>

            {/* 补充 */}
            <div className="bg-white rounded-2xl p-6 border space-y-4">
              <div className="text-sm text-neutral-600">
                还有补充信息吗？
              </div>

              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="补充新的信息..."
                className="w-full h-24 resize-none rounded-lg border p-3 text-sm"
              />

              <button
                onClick={handleRefineSubmit}
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg"
              >
                {loading ? "更新中..." : "更新分析"}
              </button>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
