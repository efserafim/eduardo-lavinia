# Chá de Panela — Eduardo & Lavínia

Site de chá de panela com lista de presentes, contribuições de valor livre, progresso por item e integração InfinitePay.

## Como rodar (local)

```bash
npm install
npm run db:setup
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Admin (Supabase Auth)

- URL: [http://localhost:3000/admin](http://localhost:3000/admin)
- Crie o usuário em **Supabase → Authentication → Users → Add user**
- Opcional: `ADMIN_EMAILS` no `.env.local` limita quem pode entrar

No admin você pode:
- Criar, editar e excluir presentes (nome + valor-meta + foto)
- Ver e editar doações
- Enviar fotos da galeria

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URI Postgres do Supabase (pooler, porta 6543) |
| `DIRECT_URL` | URI direta do Postgres (migrations) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave publishable do Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | (Opcional) Service role — facilita criar o bucket de fotos |
| `ADMIN_EMAILS` | E-mails autorizados na área do casal |

### Fotos no admin (Storage)

1. No Supabase → **SQL Editor**, execute `supabase/storage-uploads.sql` (cria o bucket `uploads`).
2. Ou, em **Storage**, crie o bucket `uploads` como **Public**.
3. (Opcional) Na Vercel, adicione `SUPABASE_SERVICE_ROLE_KEY` (Settings → API → `service_role`).
| `INFINITEPAY_HANDLE` | InfiniteTag (sem `$`). Vazio = modo demo |
| `NEXT_PUBLIC_SITE_URL` | URL pública do site (redirects e webhook) |

## Pagamentos

### Modo demo (sem handle)

Com `INFINITEPAY_HANDLE` vazio, ao clicar em contribuir o site simula o pagamento e atualiza o progresso imediatamente.

### InfinitePay (produção)

1. Conta no [InfinitePay](https://www.infinitepay.io) e anote sua **InfiniteTag** (handle, sem `$`).
2. Preencha `INFINITEPAY_HANDLE` no `.env.local` e na Vercel.
3. Defina `NEXT_PUBLIC_SITE_URL` = `https://eduardo-lavinia.vercel.app`.
4. No painel InfinitePay, webhook:

```
https://eduardo-lavinia.vercel.app/api/webhooks/infinitepay
```

O fluxo cria um link de checkout e redireciona o convidado (cartão ou PIX). Após o pagamento, o webhook e a página `/obrigado` marcam a doação como paga.

## Estrutura

- `/` — landing, galeria e lista de presentes
- `/doar/[itemId]` — escolher valor e pagar
- `/obrigado` — confirmação
- `/admin` — área do casal
