# CoreStock ERP 📦

Gestão simplificada e robusta de estoque e compras para pequenas operações e autônomos.

## 🎯 Regras de Negócio do Backend (NestJS + Prisma)

1. **Saldo Atômico e Transacional**:
   - Saldo de produtos nunca é alterado diretamente.
   - Movimentações de **ENTRADA** (compras/lotes) e **SAÍDA** (vendas/avarias).
   - Execução em transação atômica (`prisma.$transaction`) com validação de estoque não-negativo (lança erro 400 amigável em saldo insuficiente).
2. **Ponto de Pedido (Estoque Crítico)**:
   - Todo produto possui um limiar de `minStock`.
   - Alerta visual e indicador quando o saldo atual atinge ou fica abaixo do estoque mínimo.
3. **Autenticação Segura JWT**:
   - Senhas criptografadas com `bcrypt`.
   - Emissão de Token JWT para proteção de rotas protegidas via `@UseGuards(JwtAuthGuard)`.

## 🖥️ Frontend

- **Tela de Login**: Autenticação com e-mail e senha.
- **Dashboard de Estoque**: Cards de métricas (Total de Itens, Críticos, Valor Total R$) e tabela com filtros e busca.
- **Drawer / Modal de Movimentação**: Registro rápido de entradas e saídas atualizando o estado em tempo real.
