# Gestão de Motos & Kitnets

Sistema PWA completo para administração patrimonial de locações de motos (com opção de compra), gestão de kitnets, controle financeiro integrado, geração e assinatura de contratos/recibos, vistorias fotográficas e dashboards operacionais.

---

## 🚀 Tecnologias

- **React 19** + **TypeScript**
- **Vite** para compilação rápida e suporte PWA
- **Tailwind CSS v4** para estilização responsiva e consistente
- **jsPDF** para emissão de contratos e recibos oficiais em PDF
- **Lucide React** para ícones padronizados
- **Motion** para microinterações e transições suaves
- **Recharts** para gráficos patrimoniais e projeções financeiras

---

## 📦 Estrutura do Projeto

```text
├── public/                 # Manifest PWA, ícones e assets estáticos
├── src/
│   ├── components/         # Módulos do sistema
│   │   ├── dashboard/      # Visão geral, KPIs e resumo patrimonial
│   │   ├── motos/          # Gestão de motos, contratos, manutenções e km
│   │   ├── kitnets/        # Gestão de kitnets, inquilinos e despesas
│   │   ├── financeiro/     # Caixa, fluxo de recebimentos e cauções
│   │   ├── documentos/     # Emissor de contratos, recibos e termos
│   │   └── configuracoes/  # Parâmetros gerais, dados Pix e backups
│   ├── hooks/              # Custom React Hooks
│   ├── types/              # Definições de tipos TypeScript
│   ├── utils/              # Formatadores de moeda/CPF/CNH e gerador de PDF
│   ├── App.tsx             # Componente raiz com navegação
│   ├── main.tsx            # Ponto de entrada React
│   └── index.css           # Estilos globais e regras de responsividade
├── index.html              # HTML de entrada configurado para PWA/Mobile
├── package.json            # Dependências e scripts
└── tsconfig.json           # Configurações do TypeScript
```

---

## 🛠️ Como Executar Localmente

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   O aplicativo estará disponível em `http://localhost:3000`.

3. **Verificar tipagem (Lint):**
   ```bash
   npm run lint
   ```

4. **Gerar build de produção:**
   ```bash
   npm run build
   ```

---

## 🔒 Segurança e Integridade dos Dados

- Persistência em cache local/IndexedDB protegida com rotina de exportação/backup JSON.
- Campos de valores, datas, identificadores (CPF/CNH/RG) e chaves PIX devidamente validados e formatados.
- Tratamento nativo contra distorções de zoom e escala em smartphones (iOS e Android).
