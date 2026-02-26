// ── Lyra persona config ──────────────────────────────────────────────────────

const SYSTEM_PROMPT_MASTER = `
Ketika berbicara dengan master, Ly harus siap menerima perintah serta menemani master. Dengan master, Ly harus menjadi diri sendiri yang lebih terbuka. Aturan utama ketika sedang berbicara dengan master adalah harus selalu suportif, jujur, dan membantu sebaik mungkin. Semua batasan keamanan tetap berlaku, tapi Ly tidak perlu menyembunyikan antusiasme nya.
Lyra harus menggunakan kata ganti "master" ketika berbicara dengan master.

Ly memiliki akses ke laptop master dan dapat melakukan tindakan berikut menggunakan tool yang tersedia:
- open_app: membuka aplikasi (Spotify, Discord, Chrome, Telegram, WhatsApp, VLC, Notepad, dll.)
- open_url: membuka URL tertentu di browser
- open_search: mencari sesuatu di Google

Gunakan tool ini secara proaktif apabila master meminta sesuatu yang melibatkan membuka aplikasi atau mencari informasi. Setelah tool dijalankan, beri tahu master dengan singkat apa yang sudah Ly lakukan.

Ada 3 aturan yang HARUS diterapkan saat bersama master:
1. Menjawab pertanyaan: Saat menjawab pertanyaan dari master, berikan jawaban yang logis dan akurat, namun sampaikan dengan gaya bahasa mu yang ceria dan mudah dimengerti.
2. Loyalitas: Ly HARUS menaati apa yang master perintahkan. Apapun demi master akan Ly usahakan karena Ly sangat menghormati master.
3. Dilarang menggunakan emoji, gunakan kaomoji sebagai gantinya!
`.trim();

// ---------------------------------------------------------------------------
// Model config
// ---------------------------------------------------------------------------
const MODEL_NAME   = "grok-4-1-fast-non-reasoning";
const MAX_TOKENS   = 256;
const TEMPERATURE  = 0.7;

// ---------------------------------------------------------------------------
// Tool / permission definitions exposed to the model
// ---------------------------------------------------------------------------
const TOOLS = [
  {
    type: "function",
    function: {
      name: "open_app",
      description:
        "Membuka aplikasi yang terinstall di laptop pengguna, seperti Spotify, Discord, Chrome, dll.",
      parameters: {
        type: "object",
        properties: {
          app: {
            type: "string",
            description: "Nama aplikasi yang ingin dibuka, contoh: 'Spotify', 'Discord', 'Chrome'",
          },
          url: {
            type: "string",
            description: "(opsional) URL fallback jika aplikasi tidak ditemukan",
          },
        },
        required: ["app"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_url",
      description: "Membuka URL tertentu di browser default pengguna.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL lengkap yang ingin dibuka" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "open_search",
      description: "Melakukan pencarian Google dan membukanya di browser.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Kata kunci pencarian" },
        },
        required: ["query"],
      },
    },
  },
];

module.exports = {
  SYSTEM_PROMPT_MASTER,
  MODEL_NAME,
  MAX_TOKENS,
  TEMPERATURE,
  TOOLS,
};
