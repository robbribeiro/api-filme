export default function handler(req, res) {
  const { nome, duracao, inicio } = req.query;

  if (!nome || !duracao || !inicio) {
    return res.status(200).send("Parâmetros faltando. Use: ?nome=&duracao=&inicio=");
  }

  // converter "2h16m" => minutos
  function duracaoParaMinutos(d) {
    let horas = 0;
    let mins = 0;

    if (d.includes("h")) horas = parseInt(d.split("h")[0]);
    if (d.includes("m")) mins = parseInt(d.split("h")[1]);

    return horas * 60 + mins;
  }

  const duracaoMin = duracaoParaMinutos(duracao);

  const comeco = new Date(inicio);
  const fim = new Date(comeco.getTime() + duracaoMin * 60000);
  const agora = new Date();

  const restanteMs = fim - agora;

  if (restanteMs < 0) {
    return res.status(200).send(`${nome} já acabou.`);
  }

  const restanteMin = Math.floor(restanteMs / 60000);
  const restanteSec = Math.floor((restanteMs % 60000) / 1000);

  res.status(200).send(
    `${nome} (começou às ${comeco
      .toTimeString()
      .slice(0, 5)}), falta para acabar ${restanteMin} mins ${restanteSec} secs`
  );
}
