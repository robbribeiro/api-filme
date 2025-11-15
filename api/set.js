// api/set.js
import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
    const { nome, duracao, inicio } = req.query;
    if (!nome || !duracao || !inicio) {
      return res.status(200).send("Parâmetros faltando. Use ?nome=&duracao=&inicio=");
    }
  
    // Verificar variáveis de ambiente
    let UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    let UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    // Remover espaços e caracteres invisíveis
    if (UPSTASH_URL) UPSTASH_URL = UPSTASH_URL.trim().replace(/[\r\n]/g, '');
    if (UPSTASH_TOKEN) UPSTASH_TOKEN = UPSTASH_TOKEN.trim().replace(/[\r\n]/g, '');
    
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      console.error("Variáveis de ambiente não configuradas");
      return res.status(500).send("erro: configuração do Upstash faltando");
    }
  
    const payload = {
      nome,
      duracao,
      inicio
    };
  
    try {
      // Inicializar Redis dentro do handler para garantir que as variáveis estão disponíveis
      const redis = new Redis({
        url: UPSTASH_URL,
        token: UPSTASH_TOKEN,
      });
      
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
  