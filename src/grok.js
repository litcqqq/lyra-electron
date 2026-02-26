const { SYSTEM_PROMPT_MASTER, MODEL_NAME, MAX_TOKENS, TEMPERATURE, TOOLS } = require("../config");
const { dispatchTool } = require("./actions");

// ── helpers ──────────────────────────────────────────────────────────────────
async function callApi(messages, useTools) {
  const body = {
    model: MODEL_NAME,
    messages,
    temperature: TEMPERATURE,
    max_tokens: MAX_TOKENS,
  };
  if (useTools) {
    body.tools      = TOOLS;
    body.tool_choice = "auto";
  }

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROK_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const raw = await res.text();
  console.log("STATUS:", res.status);
  console.log("RAW:", raw);

  if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
  return JSON.parse(raw);
}

// ── intent detection ──────────────────────────────────────────────────────────
// Heuristic: only attach tools when the message likely needs an action.
// This avoids sending ~400 tokens of schema on every conversational turn.
const ACTION_PATTERN = /\b(buka|open|putar|play|cari|search|launch|jalankan|hiding|tutup|close|ketik|browse|lihat|show|tampil)\b/i;

function needsTools(prompt) {
  return ACTION_PATTERN.test(prompt);
}

// ── helpers ───────────────────────────────────────────────────────────────────
function accUsage(acc, raw) {
  const u = raw?.usage || {};
  acc.prompt_tokens     += u.prompt_tokens     || 0;
  acc.completion_tokens += u.completion_tokens || 0;
  acc.total_tokens      += u.total_tokens      || 0;
}

// ── main export ───────────────────────────────────────────────────────────────
/**
 * @returns {{ text: string, actions: string[], usage: object }}
 */
async function askGrok(prompt) {
  const actions = [];
  const usage   = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

  try {
    const messages = [
      { role: "system", content: SYSTEM_PROMPT_MASTER },
      { role: "user",   content: prompt },
    ];

    // ── first call (attach tools only if prompt suggests an action) ──────────
    const withTools = needsTools(prompt);
    let json     = await callApi(messages, withTools);
    accUsage(usage, json);
    let choice   = json.choices?.[0];
    let message  = choice?.message;

    // ── tool-call loop ────────────────────────────────────────────────────
    while (choice?.finish_reason === "tool_calls" && message?.tool_calls?.length) {
      messages.push(message);

      const toolResults = [];
      for (const tc of message.tool_calls) {
        let args;
        try { args = JSON.parse(tc.function.arguments); } catch { args = {}; }

        const result = await dispatchTool({ name: tc.function.name, arguments: args });
        actions.push(result);
        console.log("TOOL RESULT:", result);

        toolResults.push({
          role:         "tool",
          tool_call_id: tc.id,
          content:      result,
        });
      }

      messages.push(...toolResults);

      json    = await callApi(messages, false);
      accUsage(usage, json);
      choice  = json.choices?.[0];
      message = choice?.message;
    }

    const text = message?.content ?? "[empty]";
    console.log("USAGE:", usage);
    return { text, actions, usage };

  } catch (e) {
    console.error("GROK ERROR:", e);
    return { text: "[grok error]", actions, usage };
  }
}

module.exports = { askGrok };
