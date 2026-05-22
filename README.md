# SDD Workflow

Workflow local-first de **Spec-Driven Development** para trabalhar com agentes de IA sem perder controle, rastreabilidade e documentação.

A ideia é simples: toda mudança importante no projeto nasce como uma ideia documentada, vira PRD, SPEC, tasks, implementação e depois entra no changelog.

```text
ideia -> PRD -> SPEC -> tasks -> implementação -> archive
```

O SDD Workflow pode ser instalado em qualquer projeto: PHP, Laravel, Node, React, Svelte, Python, Go, mobile apps ou qualquer stack com arquivos.

## Para Que Serve

Use este workflow quando você quer:

- transformar ideias soltas em especificações claras;
- deixar a IA implementar seguindo trilhos bem definidos;
- versionar decisões, tasks e documentação no próprio repositório;
- evitar que cada mudança vire conversa perdida no chat;
- usar o mesmo processo com Claude, Codex, Cursor, ChatGPT ou outro LLM.

O estado do trabalho fica em arquivos Markdown dentro do projeto. Não depende de Jira, Linear, Trello ou banco externo.

## Pré-requisito Recomendado

Use o workflow dentro de um repositório Git. Os comandos conseguem gerar arquivos sem Git, mas branch, commit e histórico rastreável só funcionam depois de inicializar o projeto:

```bash
git init
git add .
git commit -m "Initial commit"
```

O instalador **não** apaga `.git` e **não** roda `git init` automaticamente. Isso é intencional: o controle do histórico do projeto deve ficar com você.

## Instalação

Entre no projeto onde você quer instalar o workflow:

```bash
cd meu-projeto
```

Instalação direta via terminal:

```bash
curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow
```

Instalar tudo:

```bash
curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --all
```

Instalar somente com Claude Code:

```bash
curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --claude
```

Fallback direto pelo GitHub:

```bash
curl -fsSL https://raw.githubusercontent.com/jonathantx/sdd-workflow/main/install-remote.sh | bash -s -- --all
```

O endpoint `install.jonathanteixeira.com.br/install.sh` é um instalador central. Ele recebe o nome do pacote (`sdd-workflow`) e encaminha para o instalador remoto deste repositório.

### Instalação Manual

Clone este repositório em uma pasta local:

```bash
git clone https://github.com/jonathantx/sdd-workflow.git ~/.sdd-workflow
```

Instale o workflow básico:

```bash
~/.sdd-workflow/install.sh
```

Instale tudo, incluindo comandos do Claude Code, Fumadocs e Scalar:

```bash
~/.sdd-workflow/install.sh --all
```

Opções disponíveis:

```bash
~/.sdd-workflow/install.sh --claude
~/.sdd-workflow/install.sh --fumadocs
~/.sdd-workflow/install.sh --scalar
~/.sdd-workflow/install.sh --all
```

Se você já clonou antes e quer atualizar:

```bash
git -C ~/.sdd-workflow pull
```

Se o repositório estiver em outro usuário/org, você pode sobrescrever a origem:

```bash
curl -fsSL https://raw.githubusercontent.com/jonathantx/sdd-workflow/main/install-remote.sh \
  | SDD_WORKFLOW_REPO=https://github.com/jonathantx/sdd-workflow.git bash -s -- --all
```

## O Que É Instalado

Instalação básica:

```text
.sdd/
  commands/
  bin/sdd-command

docs/
  index.md
  CHANGELOG.md
  explanation/constitution.md
  changes/
  adr/
  guides/
```

Com `--claude`:

```text
.claude/commands/
```

Com `--fumadocs`:

```text
docs-fumadocs/
Dockerfile.fumadocs
docker-compose.sdd.yml
```

Com `--scalar`:

```text
scalar/
Dockerfile.scalar
docker-compose.sdd.yml
```

## Como Usar Com Qualquer LLM

Os comandos portáveis ficam em:

```text
.sdd/commands/
```

Se sua ferramenta não suporta slash commands, use o helper:

```bash
.sdd/bin/sdd-command ideia "adicionar exportação CSV"
```

Ele imprime o prompt completo do comando. Você cola esse prompt no seu LLM/agente e pede para ele executar dentro do repositório.

Exemplos:

```bash
.sdd/bin/sdd-command ideia "adicionar exportação CSV"
.sdd/bin/sdd-command prd exportacao-csv
.sdd/bin/sdd-command spec exportacao-csv
.sdd/bin/sdd-command tasks exportacao-csv
.sdd/bin/sdd-command run-all exportacao-csv
.sdd/bin/sdd-command archive exportacao-csv
```

## Como Usar Com Claude Code

Instale com:

```bash
~/.sdd-workflow/install.sh --claude
```

Depois, dentro do Claude Code, use:

```text
/ideia "adicionar exportação CSV"
/prd exportacao-csv
/approve exportacao-csv
/spec exportacao-csv
/approve exportacao-csv
/tasks exportacao-csv
/run-all exportacao-csv
/archive exportacao-csv
```

## Fluxos

Feature:

```text
/ideia -> /prd -> /approve -> /spec -> /approve -> /tasks -> /run-all -> /archive
```

Fix:

```text
/ideia -> /fix -> /archive
```

Chore:

```text
/ideia -> commit direto, ou NOTE.md se precisar documentar
```

## Fumadocs

Fumadocs renderiza a documentação do projeto a partir da pasta `docs/`.

Instale:

```bash
~/.sdd-workflow/install.sh --fumadocs
```

Rode:

```bash
docker compose -f docker-compose.sdd.yml up --build docs-fumadocs
```

Acesse:

```text
http://localhost:8801/docs
```

Fumadocs roda separado da sua aplicação. Por isso funciona em qualquer stack.

## Scalar

Scalar renderiza documentação interativa de API a partir de OpenAPI/Swagger.

Instale:

```bash
~/.sdd-workflow/install.sh --scalar
```

Rode:

```bash
docker compose -f docker-compose.sdd.yml up --build scalar
```

Acesse:

```text
http://localhost:8802
```

Por padrão, ele lê:

```text
scalar/openapi.yaml
```

O `/archive` deve manter esse arquivo sincronizado quando uma change altera rotas, endpoints ou contrato de API. O arquivo inicial é só um placeholder; não trate como documentação final do projeto.

Se seu backend expõe OpenAPI em `/openapi.json`, abra:

```text
http://localhost:8802?url=http://localhost:3000/openapi.json
```

Uso recomendado em projetos com backend:

```text
docs/           -> SDD, PRD, SPEC, ADR, guias
scalar/         -> documentação interativa da API
openapi.json    -> contrato OpenAPI gerado pelo backend
```

## Publicando No GitHub

Crie um repositório vazio chamado `sdd-workflow` no GitHub, depois rode:

```bash
cd /caminho/para/sdd-workflow
git init
git add .
git commit -m "Initial SDD workflow"
git branch -M main
git remote add origin git@github.com:jonathantx/sdd-workflow.git
git push -u origin main
```

Depois disso, qualquer projeto pode instalar com:

```bash
cd meu-projeto
curl -fsSL https://install.jonathanteixeira.com.br/install.sh | bash -s -- sdd-workflow --all
```

## Deploy Do Instalador Central

O instalador central vive em:

```text
cloudflare/install-worker/
```

Ele serve:

```text
https://install.jonathanteixeira.com.br/
https://install.jonathanteixeira.com.br/install.sh
```

Para publicar na Cloudflare:

```bash
cd cloudflare/install-worker
npm install
npx wrangler login
npx wrangler deploy
```

O Worker usa Custom Domain:

```text
install.jonathanteixeira.com.br
```
