// api/set.js
import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
    // Decodificar e limpar parâmetros (importante para caracteres especiais e espaços)
    let nome = req.query.nome ? decodeURIComponent(req.query.nome).trim() : null;
    let duracao = req.query.duracao ? decodeURIComponent(req.query.duracao).trim() : null;
    let inicio = req.query.inicio ? decodeURIComponent(req.query.inicio).trim() : null;
    
    // Remover aspas se houver (StreamElements pode enviar com aspas)
    if (nome) nome = nome.replace(/^["']|["']$/g, '');
    if (duracao) duracao = duracao.replace(/^["']|["']$/g, '');
    if (inicio) inicio = inicio.replace(/^["']|["']$/g, '');
    
    console.log("Parâmetros recebidos:", { nome, duracao, inicio });
    
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
      
      // Retorna confirmação para o usuário (sempre retorna algo para o StreamElements mostrar)
      const resposta = `Filme atualizado: ${nome} - Duração: ${duracao} - Início: ${inicio}`;
      console.log("Resposta enviada:", resposta);
      return res.status(200).send(resposta);
    } catch (err) {
      console.error("Erro ao salvar:", err);
      return res.status(500).send(`erro ao salvar: ${err.message}`);
    }
  }
  