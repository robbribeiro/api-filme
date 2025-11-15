// api/set.js
import { Redis } from '@upstash/redis';

// INICIALIZAÇÃO GLOBAL (Otimização para evitar Timeout)
// Ao criar a conexão fora do handler, a Vercel reutiliza a conexão entre chamadas
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
    try {
        // 1. Captura e Decodifica os parâmetros
        // O StreamElements envia codificado (por causa do queryencode), então precisamos decodificar
        let nome = req.query.nome ? decodeURIComponent(req.query.nome).trim() : null;
        let duracao = req.query.duracao ? decodeURIComponent(req.query.duracao).trim() : null;
        let inicio = req.query.inicio ? decodeURIComponent(req.query.inicio).trim() : null;
        
        // 2. Remove aspas extras (caso escapem no chat)
        if (nome) nome = nome.replace(/^["']|["']$/g, '');
        if (duracao) duracao = duracao.replace(/^["']|["']$/g, '');
        if (inicio) inicio = inicio.replace(/^["']|["']$/g, '');
        
        console.log("Processando:", { nome, duracao, inicio });
        
        // 3. Validação básica
        if (!nome || !duracao || !inicio) {
            return res.status(200).send("Erro: Parâmetros faltando. O comando precisa de duração, inicio e nome.");
        }
    
        const payload = {
            nome,
            duracao,
            inicio
        };
    
        // 4. Salva no Redis (usando a conexão global)
        await redis.set("current_filme", JSON.stringify(payload));
        
        // 5. Resposta para o Chat
        return res.status(200).send(`Filme atualizado: ${nome} - Duração: ${duracao} - Início: ${inicio}`);

    } catch (err) {
        console.error("Erro no set.js:", err);
        return res.status(500).send(`Erro ao salvar: ${err.message}`);
    }
}