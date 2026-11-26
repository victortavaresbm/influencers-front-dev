This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Conta real e backend

Sem variáveis, o app roda só com os logins de demonstração. Para entrar com conta real (Clerk) e chamar o gateway, crie `.env.local` (o git ignora `.env*`):

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...   # Clerk → API keys (instância de desenvolvimento)
CLERK_SECRET_KEY=sk_test_...                    # Clerk → API keys; nunca commitar
NEXT_PUBLIC_API_URL=https://api-dev.<domínio>   # gateway, sem barra no fim
```

- O token vai para o gateway pelo JWT template `gateway` do Clerk, cujo `aud` é o `CLERK_AUDIENCE` do gateway.
- A origem do front (ex.: `http://localhost:3000`) precisa estar em `CORS_ALLOWED_ORIGINS` do gateway.
- Depois do login real, o painel carrega as Marcas da conta (`GET /v1/identity/me/brands`) e os convites pendentes para o e-mail dela (`GET /v1/identity/me/members/invitations`). Com uma Marca, entra direto; com mais de uma, abre na última usada ou no seletor, e a troca fica no topo da barra lateral. O `X-Marca-Id` sai da Marca escolhida.
- Primeira Marca: o Admin da plataforma cria a Marca (`POST /v1/identity/admin/brands`) com o e-mail do Dono. O Dono entra com esse e-mail, vê o convite na tela "Você ainda não faz parte de nenhuma Marca" e aceita.

Testes unitários: `npm test`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
