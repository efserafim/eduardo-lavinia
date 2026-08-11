# Chá de Panela — Eduardo & Lavínia

Site de chá de panela com lista de presentes, contribuições de valor livre, progresso por item e integração PagBank (PagSeguro).

## Como rodar (local)

```bash
npm install
npm run db:setup
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Admin

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Senha padrão: `casamento2026` (altere em `.env.local`)

No admin você pode:
- Criar e excluir itens (nome + valor-meta)
- Ver doações pagas
- Enviar fotos da galeria

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | SQLite local (`file:./dev.db`) |
| `ADMIN_PASSWORD` | Senha da área do casal |
| `AUTH_SECRET` | Segredo do cookie de sessão |
| `PAGBANK_TOKEN` | Token da API PagBank (vazio = modo demo) |
| `PAGBANK_EMAIL` | E-mail da conta (referência) |
| `NEXT_PUBLIC_SITE_URL` | URL do site (para redirects e webhook) |

## Pagamentos

### Modo demo (sem token)

Com `PAGBANK_TOKEN` vazio, ao clicar em contribuir o site simula o pagamento e atualiza o progresso imediatamente. Ideal para testar a lista.

### PagBank / PagSeguro (produção)

1. Crie uma conta no [PagBank](https://pagbank.com.br) e gere um token de API.
2. Preencha `PAGBANK_TOKEN` no `.env.local`.
3. Configure o webhook para: `https://seu-dominio.com/api/webhooks/pagbank`
4. Reinicie o servidor.

O fluxo cria um checkout hospedado e redireciona o convidado para pagar (cartão, PIX, boleto).

## Estrutura

- `/` — landing, galeria e lista de presentes
- `/doar/[itemId]` — escolher valor e pagar
- `/obrigado` — confirmação
- `/admin` — dashboard do casal

Logo: `public/logo.png` (cópia de `image/eduardo e lavinia.png`).

## Próximo passo (hospedagem)

Quando for publicar: migrar SQLite → Postgres (ex.: Supabase), configurar variáveis na Vercel e apontar o webhook do PagBank para a URL pública.
