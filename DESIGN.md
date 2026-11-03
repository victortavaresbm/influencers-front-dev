# Design

Leia este arquivo por inteiro antes de implementar ou alterar qualquer interface.

A interface usa os componentes shadcn já instalados em `components/ui`. O preset do projeto é `base-nova` (`components.json`). Não desenhe um controle novo se um componente dessa pasta já cobre o caso.

## Antes de escrever UI

1. Procure o componente em `components/ui`.
2. Use esse componente, com as variantes que ele já expõe.
3. Só então componha a tela. Ícones vêm de `lucide-react`. Classes condicionais usam `cn`.

Componentes disponíveis: `actions-menu`, `avatar`, `badge`, `button`, `card`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `input`, `input-group`, `label`, `progress`, `scroll-area`, `select`, `separator`, `sheet`, `skeleton`, `table`, `tabs`, `textarea`, `tooltip`, `toast`.

Não crie botão, menu, modal, campo, aba, badge ou tabela com `<button>`, `<div>` ou `<select>` nativos quando o equivalente shadcn existe.

## Menu de ações

Duas ou mais operações no mesmo lugar viram um único botão de ícone com reticências (`MoreHorizontal`). O gatilho é o `Button` outline, tamanho `icon-sm`. O painel é o `DropdownMenu`. A ação destrutiva fica em vermelho, com o ícone na mesma cor.

Uma única operação continua um `Button`. Não envolva uma ação solitária num menu.

Use `ActionsMenu` em `components/ui/actions-menu.tsx`. Não monte outro dropdown de ações na página.

```tsx
<ActionsMenu
  items={[
    { label: "Editar", icon: Pencil, onSelect: edit },
    { label: "Compartilhar", icon: Share, onSelect: share },
    { label: "Excluir", icon: Trash2, onSelect: remove, destructive: true },
  ]}
/>
```

O gatilho é só o ícone de reticências, com `aria-label` "Ações" (ou "Actions" / "Acciones", conforme o idioma). Sem texto visível, sem chevron e sem preenchimento primário. Itens levam ícone e rótulo. `destructive: true` usa a variante destrutiva do menu.

Isto vale para linha de tabela, seleção em massa, barra de ferramentas e rodapé de ficha. Exemplos: aprovar e recusar, exportar e convidar, gerar relatório e enviar pagamentos.

## O que não entra no menu

Estas ações ficam visíveis, porque são o caminho da tela e não uma lista de operações sobre um registro:

- O único chamado principal da página, como "Nova campanha" ou "Nova lista".
- O par de confirmação de um formulário: Cancelar e Salvar.
- A navegação de um assistente: Voltar e Continuar, Salvar rascunho e Publicar.

## Botão

`Button` de `components/ui/button.tsx`.

- `default`: a única ação principal da página ou o envio do formulário.
- `outline`: ação secundária solitária e o gatilho do menu Ações.
- `destructive`: a única ação destrutiva, quando não há menu.
- `ghost`: ação discreta, como fechar.
- `size="sm"` em barras, tabelas e cabeçalhos. `size="lg"` no passo de um assistente.

Não recrie o botão com classes de cor soltas (`bg-white`, `border-zinc-700`, `bg-emerald-50`).
