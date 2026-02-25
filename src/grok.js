const { SYSTEM_PROMPT_MASTER, MODEL_NAME, MAX_TOKENS, TEMPERATURE } = require("../config");

async function askGrok(prompt) {
  try {
    const res = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: SYSTEM_PROMPT_MASTER },
          { role: "user",   content: prompt },
        ],
        temperature: TEMPERATURE,
        max_tokens: MAX_TOKENS,
      }),
    });

    const raw = await res.text();
    console.log("STATUS:", res.status);
    console.log("RAW:", raw);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = JSON.parse(raw);
    return json.choices?.[0]?.message?.content ?? "[empty]";
  } catch (e) {
    console.error("GROK ERROR:", e);
    return "[grok error]";
  }
}

module.exports = { askGrok };
