
# Comando /document-api

Você gera o **contrato OpenAPI** da API do projeto a partir do código real e o escreve onde o **Scalar** (porta 8802) lê. O Scalar não gera nada sozinho: ele só renderiza um `openapi.yaml`. Este comando é quem produz esse arquivo, lendo a stack do projeto e traduzindo as superfícies de API (rotas REST e/ou remote functions) para OpenAPI 3.1.

Argumento opcional: `$ARGUMENTS` — um filtro de escopo (ex: um módulo/pasta, ou um slug de change). Vazio = documentar a API inteira.

Contexto carregado automaticamente:
- Branch atual: `git branch --show-current` (ou "(fora de repo git)")
- Data: `date +%Y-%m-%d`
- Constitution: existe `docs/explanation/constitution.md`?
- Patterns: conteúdo de `docs/patterns/`
- Alvo do Scalar: `scalar/openapi.yaml` (padrão deste kit) ou `docs/scalar/openapi.yaml`, o que existir

---

## Regras gerais

1. **Não invente contrato.** Cada endpoint, payload, status code e schema sai do código real (rotas, controllers, validators). Se um campo não está no código, não está no OpenAPI. Documentar API errada é pior que não documentar.
2. **Stack-aware.** A forma de extrair API muda por stack. Detecte a stack antes de extrair (Fase 1) e só então aplique a estratégia certa (Fase 3).
3. **Uma fonte, um arquivo.** A saída é um único `openapi.yaml` válido (OpenAPI 3.1) no diretório que o Scalar serve. Não espalhe o contrato em vários arquivos.
4. **Idempotente e revisável.** Rodar de novo regenera o arquivo de forma estável (ordene paths e operations alfabeticamente) para o diff ser limpo e revisável.
5. **Não toque no código da aplicação.** Este comando só lê o código e escreve o `openapi.yaml` (e, no máximo, o `index.html` do Scalar se faltar). Nunca altera rotas, controllers nem validators.
6. **Degrade com honestidade.** Onde o código não revela o suficiente (ex: tipo de retorno `unknown`), documente o que dá e marque `description` com a limitação, em vez de fabricar um schema.

---

## Fase 0 — Pré-condições

1. **Onde o Scalar lê.** Procure, nesta ordem, `scalar/openapi.yaml` e depois `docs/scalar/openapi.yaml`. Use o diretório que existir como destino. Se nenhum existir mas houver `scalar/` (ou `docs/scalar/`), crie o `openapi.yaml` lá. Se não houver nada de Scalar instalado, avise: "Scalar não está instalado — rode o instalador com `--scalar`. Posso ainda assim gerar `scalar/openapi.yaml`; quer continuar?" e espere confirmação.
2. **Repo git.** Não é obrigatório, mas o commit final (Fase 6) depende dele. Se não houver git, gere o arquivo e pule o commit.

---

## Fase 1 — Detectar a stack

O objetivo é classificar quais **superfícies de API** o projeto expõe. Um projeto pode ter mais de uma (ex: rotas REST + remote functions). Combine três sinais:

1. **Constitution.** Leia `docs/explanation/constitution.md` (seções "Stack" e "Project Identity"). É a fonte declarada de verdade sobre linguagem, framework e runtime.
2. **Patterns.** Leia `docs/patterns/`. Se houver `controller.md`, `route.md`, `remote.md` ou similar, eles mostram o formato canônico que o projeto usa para expor API — siga-o.
3. **Filesystem (confirmação).** Procure os marcadores abaixo para confirmar o que a constitution diz e detectar superfícies não declaradas:

   | Superfície | Marcadores |
   |---|---|
   | SvelteKit remote functions | `src/lib/remote/*.remote.ts` (ou `**/*.remote.ts`), imports de `$app/server` (`query`, `command`, `form`), schemas Valibot (`valibot` / `v.object`) |
   | SvelteKit endpoints REST | `src/routes/**/+server.ts` com exports `GET`/`POST`/`PUT`/`PATCH`/`DELETE` |
   | Laravel | `routes/api.php`, `routes/web.php`, `app/Http/Controllers/**`, Form Requests em `app/Http/Requests/**` |
   | Express/Node | `app.get(...)`/`router.post(...)`, `express()`, schemas Zod/Joi/Valibot |
   | Outra | qualquer framework com rotas explícitas — adapte por analogia |

Decida o conjunto de superfícies presentes. Se nenhuma for detectável, pare e relate: "Não encontrei superfície de API reconhecível (REST nem remote functions). Aponte o diretório/arquivo certo via argumento, ou descreva a stack na constitution."

---

## Fase 2 — Mapear as superfícies

Para cada superfície detectada, faça um inventário **antes** de escrever YAML. Use `grep`/`find` e leia os arquivos relevantes. Se o argumento `$ARGUMENTS` foi passado, restrinja o inventário a esse escopo (módulo/pasta/change).

- **REST tradicional:** liste cada rota como `(método HTTP, path, handler, validação de entrada, formato de resposta)`. Em SvelteKit `+server.ts`, o path vem da estrutura de pastas em `src/routes` e o método do nome do export. Em Laravel, do arquivo de rotas + controller + Form Request. Em Express, da cadeia `router.<verbo>(path, ...)`.
- **Remote functions (SvelteKit):** liste cada export `query`/`command`/`form` de cada `*.remote.ts` como `(arquivo, nome do export, tipo: query|command|form, schema Valibot de entrada, tipo de retorno)`.

Não escreva nada ainda — só construa o inventário em memória.

---

## Fase 3 — Extrair contratos

### 3a. REST tradicional → OpenAPI nativo

Para cada rota inventariada:

- **path + method:** vão direto para `paths`. Normalize parâmetros de rota para o formato OpenAPI (`/users/[id]` ou `/users/{id}` → `/users/{id}` com `parameters` `in: path`).
- **request body:** derive o schema do validator (Valibot/Zod/Form Request/regras de validação). Use o mapeamento da Fase 3c.
- **query/path params:** declare em `parameters`.
- **responses:** baseie nos status codes e formatos que o handler retorna de fato (`json(...)`, `response()->json(...)`, `res.json(...)`). Onde o handler retorna um tipo conhecido, modele o schema; onde for opaco, documente `200` com `description` honesta e schema mínimo.
- **tags:** agrupe por recurso/módulo (pasta ou controller).

### 3b. Remote functions → convenção RPC sobre OpenAPI

Remote functions do SvelteKit são RPC, não REST: o transporte real é interno ao framework e não tem URL pública estável. OpenAPI não as enxerga nativamente. Adote esta **convenção** (documente-a no `info.description` do arquivo gerado, para quem lê o Scalar entender que são RPC, não endpoints HTTP públicos):

- **Cada export vira uma operation.** Uma `query`/`command`/`form` = uma operation OpenAPI.
- **Path sintético:** `/_remote/{módulo}/{nomeDoExport}`, onde `{módulo}` é o nome do arquivo sem `.remote.ts`. Ex: `src/lib/remote/booking.remote.ts` export `createBooking` → `/_remote/booking/createBooking`.
- **Method:** `POST` para todas (é RPC; o argumento vai no corpo). Não use GET mesmo para `query`, para manter a convenção uniforme e permitir corpo de requisição.
- **requestBody:** o schema Valibot passado ao validator da função (`query(schema, handler)` / `command(schema, handler)`) vira o `requestBody` (`application/json`). Se a função não tem schema (sem argumento validado), omita o body.
- **responses:** `200` com o schema do tipo de retorno quando inferível; senão `200` com schema genérico e `description` deixando claro que o retorno não é tipado no contrato.
- **tags:** uma tag por módulo (arquivo). 
- **operationId:** o nome do export.
- **`x-sdd-remote`:** adicione esta extension em cada operation com `{ kind: query|command|form, module, export }`, para deixar explícito que é remote function e qual o tipo. (OpenAPI permite extensions `x-`; o Scalar as ignora na renderização, mas elas documentam a origem.)
- **distinção query vs command:** reflita o tipo na `summary`/`description` (ex: "Query (read)" vs "Command (write)") e na extension. `query` é leitura, `command`/`form` é escrita.

### 3c. Mapeamento de schema → JSON Schema (OpenAPI)

Traduza os validators para JSON Schema (dialeto OpenAPI 3.1). Heurísticas para **Valibot** (a usada nos projetos com remote functions); aplique o equivalente para Zod/Joi/Form Request:

| Valibot | JSON Schema |
|---|---|
| `v.object({...})` | `type: object` + `properties` + `required` (campos não-`optional`) |
| `v.string()` | `type: string` |
| `v.number()` | `type: number` |
| `v.boolean()` | `type: boolean` |
| `v.array(x)` | `type: array`, `items: <x>` |
| `v.optional(x)` | torna o campo não obrigatório (fora de `required`); schema = `<x>` |
| `v.nullable(x)` | `<x>` com `nullable`/`type: [<t>, "null"]` |
| `v.picklist([...])` / `v.enum_(...)` | `type: string`, `enum: [...]` |
| `v.literal(L)` | `const: L` |
| `v.pipe(v.string(), v.email())` | `type: string`, `format: email` |
| `v.pipe(..., v.minLength(n))` / `v.minValue(n)` | `minLength`/`minimum` etc. |
| `v.union([...])` | `oneOf: [...]` |
| `v.record(...)` | `type: object`, `additionalProperties: <valor>` |
| `v.date()` | `type: string`, `format: date-time` |

Esquemas reutilizados em mais de um lugar → extraia para `components/schemas` e referencie com `$ref`. Se um validator estiver definido em outro arquivo e importado, siga o import para ler a definição real. Onde a tradução for incerta, prefira um schema mais permissivo (sem `additionalProperties: false`) e registre a incerteza na `description`.

---

## Fase 4 — Sintetizar o openapi.yaml

Monte um único documento OpenAPI 3.1 válido:

```yaml
openapi: 3.1.0
info:
  title: "{nome do projeto, da constitution}"
  version: "{versão, se houver; senão 1.0.0}"
  description: |
    Contrato gerado por /document-api a partir do código.
    {Se houver remote functions: explique a convenção — operations sob /_remote/* são SvelteKit remote functions (RPC), não endpoints HTTP públicos; method POST por convenção; veja x-sdd-remote.}
tags:
  - name: "{módulo}"
    description: "{...}"
paths:
  # rotas REST com path/method reais + operations de remote functions sob /_remote/*
components:
  schemas:
    # schemas reutilizados, extraídos dos validators
```

Regras de montagem:
- **Determinístico:** ordene `paths` e as chaves de `components.schemas` alfabeticamente; dentro de cada path, ordene os métodos numa ordem fixa (get, post, put, patch, delete). Isso mantém o diff estável entre execuções.
- **Mescle superfícies:** se há REST e remote functions, ambos convivem no mesmo `paths`, distinguíveis pelas tags e pelo prefixo `/_remote/`.
- **Sem placeholder remanescente:** se o arquivo anterior era o placeholder (`/health` de exemplo, "Replace this placeholder..."), substitua-o inteiro. Não acumule lixo.
- Escreva em `scalar/openapi.yaml` (ou `docs/scalar/openapi.yaml`, conforme detectado na Fase 0).

---

## Fase 5 — Validar

1. **YAML/OpenAPI bem formado.** Valide a sintaxe. Se houver Node disponível, um parse rápido basta:
   ```
   node -e "const fs=require('fs');const s=fs.readFileSync(process.argv[1],'utf8');if(!/^openapi:\s*3\./m.test(s)){console.error('sem versão openapi 3.x');process.exit(1)}console.log('ok: '+s.length+' bytes')" scalar/openapi.yaml
   ```
   Se houver um linter de OpenAPI no projeto (ex: `@redocly/cli`, `swagger-cli`), use-o.
2. **Cobertura.** Confirme que o número de operations bate com o inventário da Fase 2 (não perdeu rota nem export). Relate a contagem.
3. **Preview Scalar (se docker disponível).** Se `docker-compose.sdd.yml` e o `openapi.yaml` existem:
   ```
   docker compose -f docker-compose.sdd.yml up -d scalar
   curl -fsS http://localhost:8802 >/dev/null
   curl -fsS http://localhost:8802/openapi.yaml >/dev/null
   ```
   Se o Scalar serve a partir de `docs/scalar/`, ajuste o caminho do `curl` conforme o volume montado. Se docker não estiver disponível, pule — não bloqueie por isso.

Se algo falhar, corrija o `openapi.yaml` antes da Fase 6.

---

## Fase 6 — Commit

Só se houver repo git. Commit apenas do arquivo do Scalar (e do `index.html` se você precisou criá-lo):

```
git add scalar/openapi.yaml
test ! -f scalar/index.html || git add scalar/index.html
git commit -m "docs(api): generate openapi.yaml from code for Scalar"
```

(Ajuste o caminho para `docs/scalar/` se for o destino detectado.) Não commite mudanças no código da aplicação — não deveria haver nenhuma.

---

## Fase 7 — Confirmação e próximo passo

Mostre, conciso:

1. Caminho do `openapi.yaml` gerado e tamanho.
2. **Resumo da cobertura:** quantas operations REST e quantas remote functions, agrupadas por tag/módulo.
3. Qualquer limitação assumida (retornos não tipados, schemas inferidos com incerteza).
4. **Como ver:** `docker compose -f docker-compose.sdd.yml up --build scalar` → http://localhost:8802
5. **Manutenção:** lembre que `/archive` mantém o `scalar/openapi.yaml` sincronizado quando uma change mexe em API; rode `/document-api` de novo quando quiser regenerar o contrato do zero a partir do código.

Não despeje o YAML inteiro — o usuário abre o arquivo.

---

## Notas de instalação

Salve como **`.claude/commands/document-api.md`**. Invoque com `/document-api [escopo]`.

Este comando lê código e escreve um único `openapi.yaml`. A guarda principal é comportamental: **fiel ao código, nunca inventa contrato**. A convenção `/_remote/*` + `x-sdd-remote` é o que dá ao Scalar algo para mostrar mesmo em projetos que usam SvelteKit remote functions em vez de REST.

Modelo recomendado: a tradução de validators para JSON Schema e a leitura de código de várias stacks se beneficiam de um modelo forte. Use o melhor modelo disponível na sessão.
