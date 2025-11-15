// api/set.js
export default async function handler(req, res) {
    const { nome, duracao, inicio } = req.query;
    if (!nome || !duracao || !inicio) {
      return res.status(200).send("Parâmetros faltando. Use ?nome=&duracao=&inicio=");
    }
  
    // armazenar objeto JSON como string no Upstash (chave: current_filme)
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL; // ex: https://us1-stable-xxxxx.upstash.io
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  
    const payload = {
      nome,
      duracao,
      inicio
    };
  
    // usar comando SET via REST
    const body = JSON.stringify({ "token": UPSTASH_TOKEN, "cmd": `SET current_filme ${encodeURIComponent(JSON.stringify(payload))}` });
    // Upstash REST expects specific endpoints; we'll call the simple REST URL with /set?key=... alternatively use the REST GET command:
    const url = `${UPSTASH_URL}/set/current_filme/${encodeURIComponent(JSON.stringify(payload))}?token=${UPSTASH_TOKEN}`;
  
    try {
      const r = await fetch(url, { method: "POST" });
      const j = await r.text();
      // respondemos vazio para o bot ficar "silencioso" ou uma confirmação curta
      return res.status(200).send(""); // resposta vazia -> chat do SE não mostrará nada visível
    } catch (err) {
      console.error(err);
      return res.status(500).send("erro ao salvar");
    }
  }
  