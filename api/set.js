// api/set.js
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    const { nome, duracao, inicio } = req.query;
    if (!nome || !duracao || !inicio) {
      return res.status(200).send("Parâmetros faltando. Use ?nome=&duracao=&inicio=");
    }
  
    const payload = {
      nome,
      duracao,
      inicio
    };
  
    try {
      // Salvar usando o SDK oficial do Upstash
      await redis.set("current_filme", JSON.stringify(payload));
      
      console.log("Filme salvo com sucesso:", payload);
      
      // Retorna confirmação para o usuário
      return res.status(200).send(`Filme atualizado: ${nome} - Duração: ${duracao} - Início: ${inicio}`);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      return res.status(500).send(`erro ao salvar: ${err.message}`);
    }
  }
  