// api/set.js
export default async function handler(req, res) {
    const { nome, duracao, inicio } = req.query;
    if (!nome || !duracao || !inicio) {
      return res.status(200).send("Parâmetros faltando. Use ?nome=&duracao=&inicio=");
    }
  
    // armazenar objeto JSON como string no Upstash (chave: current_filme)
    const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL; // ex: https://us1-stable-xxxxx.upstash.io
    const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
  
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      console.error("Variáveis de ambiente do Upstash não configuradas");
      return res.status(500).send("erro: configuração do Upstash faltando");
    }
  
    const payload = {
      nome,
      duracao,
      inicio
    };
  
    // Formato correto da API REST do Upstash
    // A API REST do Upstash aceita comandos Redis via POST no formato de array
    // Usa Authorization Bearer header para autenticação
    const value = JSON.stringify(payload);
    
    // Comando Redis: SET current_filme "valor"
    // O Upstash REST API espera um array de comandos: ["SET", "key", "value"]
    const command = ["SET", "current_filme", value];
  
    try {
      const r = await fetch(UPSTASH_URL, { 
        method: "POST",
        headers: {
          "Authorization": `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(command)
      });
      
      if (!r.ok) {
        const errorText = await r.text();
        console.error("Erro do Upstash - Status:", r.status, "Response:", errorText);
        return res.status(500).send(`erro ao salvar no Upstash: ${r.status} - ${errorText}`);
      }
      
      const j = await r.json();
      console.log("Resposta do Upstash:", j);
      console.log("Filme salvo com sucesso:", payload);
      
      // Retorna confirmação para o usuário
      return res.status(200).send(`Filme atualizado: ${nome} - Duração: ${duracao} - Início: ${inicio}`);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      return res.status(500).send("erro ao salvar");
    }
  }
  