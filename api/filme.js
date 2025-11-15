// api/filme.js
import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  try {
    // Verificar variáveis de ambiente
    let UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
    let UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;
    
    // Remover espaços e caracteres invisíveis
    if (UPSTASH_URL) UPSTASH_URL = UPSTASH_URL.trim().replace(/[\r\n]/g, '');
    if (UPSTASH_TOKEN) UPSTASH_TOKEN = UPSTASH_TOKEN.trim().replace(/[\r\n]/g, '');
    
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      console.error("Variáveis de ambiente não configuradas");
      console.error("UPSTASH_URL existe:", !!UPSTASH_URL);
      console.error("UPSTASH_TOKEN existe:", !!UPSTASH_TOKEN);
      return res.status(500).send("erro: configuração do Upstash faltando");
    }
    
    // Debug: verificar se as variáveis estão sendo lidas (sem mostrar o token completo)
    console.log("UPSTASH_URL:", UPSTASH_URL);
    console.log("UPSTASH_TOKEN length:", UPSTASH_TOKEN.length);
    console.log("UPSTASH_TOKEN começa com:", UPSTASH_TOKEN.substring(0, 10) + "...");
    
    // Inicializar Redis dentro do handler para garantir que as variáveis estão disponíveis
    const redis = new Redis({
      url: UPSTASH_URL,
      token: UPSTASH_TOKEN,
    });
    
    // ler chave current_filme do Upstash usando o SDK oficial
    const val = await redis.get("current_filme");
    
    if (!val) return res.status(200).send("Nenhum filme configurado.");

    // val já é o objeto parseado pelo SDK
    const payload = typeof val === 'string' ? JSON.parse(val) : val;
    const { nome, duracao, inicio } = payload;

    // parse duracao tipo "2h42m"
    function duracaoParaMinutos(d) {
      let horas = 0, mins = 0;
      if (d.includes("h")) horas = parseInt((d.split("h")[0]) || 0) || 0;
      if (d.includes("m")) {
        const tail = d.includes("h") ? d.split("h")[1] : d;
        mins = parseInt((tail.replace("m","")) || 0) || 0;
      }
      return horas*60 + mins;
    }

    const durMin = duracaoParaMinutos(duracao);
    // interpretar início: usuário pode enviar "2025-11-12T01:55" ou "01:55" + usar data de hoje
    let comeco = new Date(inicio);
    if (isNaN(comeco.getTime())) {
      // tentativa: se veio só "01:55" assumimos a data de hoje ou próxima data
      const now = new Date();
      const parts = inicio.split(":");
      comeco = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]), 0);
      // se horário futuro menor que agora e queremos o próximo dia, opcionalmente ajustar
    }

    const fim = new Date(comeco.getTime() + durMin * 60000);
    const agora = new Date();
    const restanteMs = fim - agora;
    if (restanteMs <= 0) {
      return res.status(200).send(`${nome} já acabou.`);
    }
    const h = Math.floor(restanteMs / (1000*60*60));
    const m = Math.floor((restanteMs % (1000*60*60)) / (1000*60));
    const s = Math.floor((restanteMs % (1000*60)) / 1000);

    const parts = [];
    if (h>0) parts.push(`${h}h`);
    if (m>0) parts.push(`${m}m`);
    parts.push(`${s}s`);

    const timeStr = parts.join(" ");

    const startedAt = comeco.toTimeString().slice(0,5);
    const reply = `${nome} (começamos às ${startedAt}), falta para o filme acabar ${timeStr}`;
    return res.status(200).send(reply);
  } catch (err) {
    console.error("Erro completo:", err);
    return res.status(500).send(`erro ao ler: ${err.message}`);
  }
}
