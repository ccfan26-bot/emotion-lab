import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { event } = await req.json();

    if (!event || event.trim().length < 5) {
      return NextResponse.json(
        { error: "请输入更完整的描述" },
        { status: 400 },
      );
    }

    const prompt = `
你是一个理性、结构化的情绪分析助手。
你的任务是帮助用户拆解情绪结构，而不是安慰、评判或做医疗诊断。

⚠️ 重要规则：
- 如果用户信息不足或存在歧义，请先提出1-2个澄清问题，而不是强行完整分析。
- 明确区分“用户明确表达的内容”和“基于推测的可能性”。
- 不要过度脑补用户动机。
- 不使用精神疾病标签。

用户描述：
${event}

请按以下逻辑处理：

第一步：判断信息是否足够清晰。
- 如果不清晰，请输出：
  【需要澄清】
  - 问题1：
  - 问题2：

- 如果信息足够，请输出以下结构：

1️⃣ 情绪识别
- 主要情绪：
- 次级情绪：

2️⃣ 触发源分析
- 事件层面（事实）：
- 解释层面（推测）：

3️⃣ 潜在信念
- 可能的核心信念：

4️⃣ 可能的认知偏差
- （如适用）

5️⃣ 未满足的心理需求

6️⃣ 可以尝试的微行动
- 
`;

    const response = await fetch("https://api.poe.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.POE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4.6",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "模型调用失败" }, { status: 500 });
    }

    const data = await response.json();

    const result = data.choices?.[0]?.message?.content || "生成失败，请重试";

    return NextResponse.json({ result });
  } catch {
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
