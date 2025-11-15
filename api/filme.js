// api/filme.js
import { Redis } from '@upstash/redis';

// INICIALIZAÇÃO GLOBAL (Otimização para evitar Timeout)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default async function handler(req, res) {
  try {
    // 1. Busca dados do Redis
    const val = await redis.get("current_filme");
    
    if (!val) return res.status(200).send("Nenhum filme configurado no momento.");

    // Garante que é um objeto (o SDK do Upstash as vezes já retorna parseado, as vezes string)
    const payload = typeof val === 'string' ? JSON.parse(val) : val;
    const { nome, duracao, inicio } = payload;

    // 2. Função auxiliar para converter "1h30m" em minutos
    function duracaoParaMinutos(d) {
      let horas = 0, mins = 0;
      d = d.toLowerCase();
      if (d.includes("h")) {
          const parts = d.split("h");
          horas = parseInt(parts[0]) || 0;
          if (parts[1] && parts[1].includes("m")) {
              mins = parseInt(parts[1].replace("m","")) || 0;
          }
      } else if (d.includes("m")) {
          mins = parseInt(d.replace("m","")) || 0;
      } else {
          // Tenta ler apenas números se não tiver h/m
          mins = parseInt(d) || 0;
      }
      return (horas * 60) + mins;
    }

    const durMin = duracaoParaMinutos(duracao);

    // 3. Interpretar Horário de Início
    // Aceita formato ISO ou apenas Horário "HH:MM" (assumindo dia atual)
    let comeco = new Date(inicio);
    if (isNaN(comeco.getTime())) {
      const now = new Date();
      // Ajuste para fuso horário se necessário (aqui usa o do servidor/Vercel UTC)
      // Se quiser forçar BRT, precisaria subtrair 3h, mas vamos manter simples:
      const parts = inicio.split(":");
      if (parts.length >= 2) {
          comeco = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(parts[0]), parseInt(parts[1]), 0);
      }
    }

    // 4. Cálculos de Tempo
    const fim = new Date(comeco.getTime() + durMin * 60000);
    const agora = new Date();
    const restanteMs = fim - agora;

    // Se já acabou
    if (restanteMs <= 0) {
      return res.status(200).send(`${nome} já acabou.`);
    }

    // Formata saída
    const h = Math.floor(restanteMs / (1000*60*60));
    const m = Math.floor((restanteMs % (1000*60*60)) / (1000*60));
    const s = Math.floor((restanteMs % (1000*60)) / 1000);

    const partsArr = [];
    if (h > 0) partsArr.push(`${h}h`);
    if (m > 0) partsArr.push(`${m}m`);
    partsArr.push(`${s}s`);

    const timeStr = partsArr.join(" ");
    
    // Formata a hora de inicio para exibição (HH:MM)
    const startedAt = comeco.toTimeString().slice(0,5);

    return res.status(200).send(`${nome} (começamos às ${startedAt}), falta para o filme acabar ${timeStr}`);

  } catch (err) {
    console.error("Erro no filme.js:", err);
    return res.status(200).send(`Erro ao ler dados: ${err.message}`);
  }
}