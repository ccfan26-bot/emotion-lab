import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { event } = await req.json();

    if (!event || event.trim().length < 5) {
      return NextResponse.json(
        { error: "请输入更完整的描述" },
        { status: 400 }
      );
    }

    const prompt = `
你是一个理性、结构化的情绪分析助手。
你的任务是拆解用户的情绪结构，而不是安慰。
不要进行医疗诊断，不使用精神疾病标签。

用户描述：
${event}

请严格按照以下结构输出：

1️⃣ 情绪识别
- 主要情绪：
- 次级情绪：

2️⃣ 触发源分析
- 事件层面：
- 解释层面：

3️⃣ 潜在信念
- 可能的核心信念：

4️⃣ 可能的认知偏差
- （如适用）

5️⃣ 未满足的心理需求
- 

6️⃣ 可以尝试的微行动
- 
`;

    const response = await fetch(
      "https://api.poe.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.POE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "模型调用失败" },
        { status: 500 }
      );
    }

    const data = await response.json();

    const result =
      data.choices?.[0]?.message?.content ||
      "生成失败，请重试";

    return NextResponse.json({ result });

  } catch {
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
