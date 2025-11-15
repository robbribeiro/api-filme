# Como Testar a API

Agora que está configurada, siga estes passos para testar:

## Teste 1: Verificar se a API está funcionando (Ler filme)

Abra no navegador:
```
https://api-filme-two.vercel.app/api/filme
```

**Resultado esperado:**
- Se não houver filme salvo: `Nenhum filme configurado.`
- Se houver filme: `Nome do Filme (começamos às 20:00), falta para o filme acabar 1h 25m 30s`

## Teste 2: Salvar um filme

Abra no navegador:
```
https://api-filme-two.vercel.app/api/set?nome=Matrix&duracao=2h16m&inicio=20:00
```

**Resultado esperado:**
```
Filme atualizado: Matrix - Duração: 2h16m - Início: 20:00
```

## Teste 3: Ler o filme que acabou de salvar

Abra no navegador:
```
https://api-filme-two.vercel.app/api/filme
```

**Resultado esperado:**
```
Matrix (começamos às 20:00), falta para o filme acabar 2h 16m XXs
```

## Teste Completo (Fluxo)

1. **Salvar um filme:**
   ```
   https://api-filme-two.vercel.app/api/set?nome=Inception&duracao=2h28m&inicio=21:00
   ```

2. **Ler o filme:**
   ```
   https://api-filme-two.vercel.app/api/filme
   ```

3. **Salvar outro filme:**
   ```
   https://api-filme-two.vercel.app/api/set?nome=Vingadores&duracao=2h30m&inicio=19:30
   ```

4. **Ler novamente:**
   ```
   https://api-filme-two.vercel.app/api/filme
   ```

## Exemplos de URLs para Testar

### Filmes com nomes simples:
```
https://api-filme-two.vercel.app/api/set?nome=Matrix&duracao=2h16m&inicio=20:00
https://api-filme-two.vercel.app/api/set?nome=Inception&duracao=2h28m&inicio=21:00
https://api-filme-two.vercel.app/api/set?nome=Interstellar&duracao=2h49m&inicio=19:00
```

### Filmes com nomes que têm espaços (use %20):
```
https://api-filme-two.vercel.app/api/set?nome=O%20Poderoso%20Chefão&duracao=2h55m&inicio=20:30
https://api-filme-two.vercel.app/api/set?nome=Senhor%20dos%20Anéis&duracao=3h20m&inicio=18:00
```

### Com data completa:
```
https://api-filme-two.vercel.app/api/set?nome=Matrix&duracao=2h16m&inicio=2025-01-20T20:00
```

## Formato dos Parâmetros

- **nome**: Nome do filme (use `%20` para espaços)
- **duracao**: Formato `XhYm` (ex: `2h30m`, `1h45m`, `90m`)
- **inicio**: 
  - Formato simples: `20:00` (usa a data de hoje)
  - Formato completo: `2025-01-20T20:00` (data e hora específicas)

## Testar no Chat da Twitch (StreamElements)

Após configurar os comandos no StreamElements (veja `CONFIGURACAO_STREAMELEMENTS.md`):

1. **No chat, digite:**
   ```
   !novofilme Matrix 2h16m 20:00
   ```

2. **O bot deve responder:**
   ```
   Filme atualizado: Matrix - Duração: 2h16m - Início: 20:00
   ```

3. **Depois digite:**
   ```
   !filme
   ```

4. **O bot deve responder:**
   ```
   Matrix (começamos às 20:00), falta para o filme acabar 2h 16m XXs
   ```

## Se Algo Não Funcionar

1. **Verifique os logs no Vercel:**
   - Deployments → Deploy mais recente → View Logs

2. **Verifique se as variáveis estão configuradas:**
   - Settings → Environment Variables

3. **Teste primeiro no navegador** antes de testar no chat

---

**Pronto!** Sua API está funcionando! 🎉

