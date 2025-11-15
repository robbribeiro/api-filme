# Guia de Configuração dos Comandos no StreamElements

Este guia explica como configurar os comandos `!novofilme` e `!filme` no StreamElements para interagir com sua API.

## Pré-requisitos

1. **API deployada no Vercel**: Sua API deve estar funcionando e acessível via URL pública
2. **Bot do StreamElements ativo**: O bot deve estar adicionado ao seu canal da Twitch

## Passo 1: Adicionar o Bot ao Canal

1. Acesse o [Dashboard do StreamElements](https://streamelements.com/dashboard)
2. No painel, clique em **"Join Channel"** para adicionar o bot ao seu chat
3. No chat da Twitch, digite:
   ```
   /mod StreamElements
   ```
   Isso concede permissões de moderador ao bot

## Passo 2: Criar o Comando `!filme`

Este comando exibe as informações do filme atual.

1. No dashboard do StreamElements, vá para **"Chatbot"** > **"Chat Commands"** > **"Custom Commands"**
2. Clique em **"Add New Command"**
3. Configure o comando:
   - **Command name**: `filme` (sem o `!`, o StreamElements adiciona automaticamente)
   - **Response**: 
     ```
     $(urlfetch https://sua-api.vercel.app/api/filme)
     ```
     ⚠️ **IMPORTANTE**: Substitua `https://sua-api.vercel.app` pela URL real da sua API no Vercel
   - **User Level**: `Everyone` (ou configure conforme necessário)
   - **Cooldown**: Recomendado `5` segundos para evitar spam
4. Clique em **"Activate Command"** para salvar

## Passo 3: Criar o Comando `!novofilme`

Este comando atualiza as informações do filme. Ele recebe 3 parâmetros: nome, duração e horário de início.

1. No dashboard do StreamElements, vá para **"Chatbot"** > **"Chat Commands"** > **"Custom Commands"**
2. Clique em **"Add New Command"**
3. Configure o comando:
   - **Command name**: `novofilme`
   - **Response**: 
     ```
     $(urlfetch https://sua-api.vercel.app/api/set?nome=$(1)&duracao=$(2)&inicio=$(3))
     ```
     ⚠️ **IMPORTANTE**: Substitua `https://sua-api.vercel.app` pela URL real da sua API no Vercel
   
   **Explicação das variáveis**:
   - `$(1)` = primeiro argumento (nome do filme)
   - `$(2)` = segundo argumento (duração, ex: "2h30m")
   - `$(3)` = terceiro argumento (horário de início, ex: "20:00" ou "2025-01-15T20:00")
   
   - **User Level**: `Moderator` ou `Broadcaster` (recomendado para evitar que qualquer pessoa altere)
   - **Cooldown**: Recomendado `10` segundos
4. Clique em **"Activate Command"** para salvar

## Como Usar os Comandos

### Comando `!filme`
No chat da Twitch, qualquer pessoa pode digitar:
```
!filme
```
O bot responderá com as informações do filme atual, por exemplo:
```
Vingadores: Ultimato (começamos às 20:00), falta para o filme acabar 1h 25m 30s
```

### Comando `!novofilme`
No chat da Twitch, moderadores/broadcasters podem digitar:
```
!novofilme Vingadores: Ultimato 2h30m 20:00
```

**Formato dos parâmetros**:
- **Nome**: Qualquer texto (se tiver espaços, use aspas)
- **Duração**: Formato `XhYm` (ex: `2h30m`, `1h45m`, `90m`)
- **Início**: 
  - Formato simples: `20:00` (usa a data de hoje)
  - Formato completo: `2025-01-15T20:00` (data e hora específicas)

**Exemplos**:
```
!novofilme "Matrix" 2h16m 21:00
!novofilme "O Poderoso Chefão" 2h55m 2025-01-20T19:30
!novofilme Inception 2h28m 20:30
```

**⚠️ IMPORTANTE**: 
- Se o nome do filme tiver espaços, **use aspas** ao redor do nome
- O StreamElements separa os argumentos por espaços, então `"O Poderoso Chefão"` (com aspas) será tratado como um único argumento
- Sem aspas, `O Poderoso Chefão` será tratado como 3 argumentos separados

**Resposta do comando**: Quando o filme for salvo com sucesso, o bot responderá com uma confirmação:
```
Filme atualizado: Vingadores: Ultimato - Duração: 2h30m - Início: 20:00
```

## Variáveis do StreamElements

O StreamElements oferece várias variáveis úteis que você pode usar nos comandos:

- `$(user)` - Nome do usuário que executou o comando
- `$(1)`, `$(2)`, `$(3)` - Argumentos do comando (1º, 2º, 3º)
- `$(urlfetch URL)` - Faz uma requisição HTTP GET para a URL e retorna a resposta
- `$(channel)` - Nome do canal
- `$(count)` - Contador de quantas vezes o comando foi usado

## Troubleshooting

### O comando não responde
1. Verifique se o bot está online no chat (deve aparecer como "StreamElements" online)
2. Verifique se você digitou o comando corretamente (sem espaços extras)
3. Verifique os logs do Vercel para ver se há erros na API

### Erro ao salvar filme
1. Verifique se você tem permissão (deve ser Moderator ou Broadcaster)
2. Verifique se passou os 3 parâmetros corretamente
3. Verifique os logs do Vercel para ver o erro específico

### A API retorna erro
1. Verifique se a URL da API está correta no comando
2. Verifique se as variáveis de ambiente estão configuradas no Vercel:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
3. Verifique os logs do Vercel para detalhes do erro

## Notas Importantes

1. **URL da API**: Certifique-se de usar a URL completa da sua API no Vercel (ex: `https://api-filme.vercel.app/api/filme`)
2. **Permissões**: O comando `!novofilme` deve ter permissão restrita para evitar alterações não autorizadas
3. **Encoding**: Se o nome do filme tiver caracteres especiais ou espaços, o StreamElements pode precisar de tratamento especial
4. **Cooldown**: Configure cooldowns apropriados para evitar spam e excesso de requisições à API

## Exemplo de Configuração Completa

### Comando `!filme`
```
Nome: filme
Resposta: $(urlfetch https://api-filme.vercel.app/api/filme)
User Level: Everyone
Cooldown: 5 segundos
```

### Comando `!novofilme`
```
Nome: novofilme
Resposta: $(urlfetch https://api-filme.vercel.app/api/set?nome=$(1)&duracao=$(2)&inicio=$(3))
User Level: Moderator
Cooldown: 10 segundos
```

---

**Dica**: Teste os comandos primeiro em um chat de teste antes de usar na transmissão ao vivo!

