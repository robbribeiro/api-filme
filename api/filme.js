// api/filme.js
import { Redis } from '@upstash/redis';

// INICIALIZAÇÃO GLOBAL (Otimização para evitar Timeout)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// --- FUNÇÕES AUXILIARES ---

function duracaoParaMinutos(d) {
    let horas = 0, mins = 0;
    d = String(d).toLowerCase();
    if (d.includes("h")) {
        const parts = d.split("h");
        horas = parseInt(parts[0]) || 0;
        if (parts[1] && parts[1].includes("m")) {
            mins = parseInt(parts[1].replace("m","")) || 0;
        }
    } else if (d.includes("m")) {
        mins = parseInt(d.replace("m","")) || 0;
    } else {
        mins = parseInt(d) || 0;
    }
    return (horas * 60) + mins;
}

// Função para obter a data/hora atual em um fuso específico (ex: -3 para BRT)
function getAgoraNoFuso(offsetHoras = -3) {
    const agoraUTC = new Date();
    const offsetMs = offsetHoras * 60 * 60 * 1000;
    return new Date(agoraUTC.getTime() + offsetMs);
}

// --- HANDLER PRINCIPAL ---

export default async function handler(req, res) {
  try {
    // 1. Busca dados do Redis
    const val = await redis.get("current_filme");
    
    if (!val) return res.status(200).send("Nenhum filme configurado no momento.");

    const payload = typeof val === 'string' ? JSON.parse(val) : val;
    let { nome, duracao, inicio } = payload;

    // Garante que os dados lidos são strings antes de processar
    nome = String(nome || "Filme");
    duracao = String(duracao || "0m");
    inicio = String(inicio || "00:00");

    // 2. Cálculos de Duração
    const durMin = duracaoParaMinutos(duracao);

    // 3. Interpretar Horário de Início (COM FUSO HORÁRIO)
    const FUSO_HORARIO = -3; // Fixo para BRT (-3)
    const agora = getAgoraNoFuso(FUSO_HORARIO);
    
    let comeco = new Date(inicio); // Tenta ler data ISO "2025-11-15T20:00"

    // Se não for data ISO, assume "HH:MM"
    if (isNaN(comeco.getTime())) {
      const parts = inicio.split(":");
      if (parts.length >= 2) {
          // Cria a data de início com base na hora de 'agora' (já no fuso BRT)
          comeco = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate(), parseInt(parts[0]), parseInt(parts[1]), 0);
          
          // Se 'comeco' (ex: 20:00) for DEPOIS de 'agora' (ex: 03:00 da madrugada),
          // assumimos que o filme começou no dia ANTERIOR.
          if (comeco > agora) {
              comeco.setDate(comeco.getDate() - 1);
          }
      } else {
          // Se o formato for inválido, usa 'agora' como 'comeco'
          comeco = agora; 
      }
    }

    // 4. Cálculos de Tempo
    const fim = new Date(comeco.getTime() + durMin * 60000);
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
    return res.status(200).send(`Erro ao ler dados: ${err.message || 'Erro desconhecido'}`);
  }
}