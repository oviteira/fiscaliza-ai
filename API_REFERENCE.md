# API Reference - FiscalizaAI

## Visão Geral

A API do FiscalizaAI é construída com **tRPC**, fornecendo type-safety end-to-end entre frontend e backend.

## Base URL

```
https://fiscalizaai.com.br/api/trpc
```

## Autenticação

Todas as requisições devem incluir o cookie de sessão (automaticamente enviado pelo navegador).

Para procedimentos protegidos, o usuário deve estar autenticado.

## Tipos de Dados

### NivelRisco
```typescript
type NivelRisco = 'baixo' | 'medio' | 'alto' | 'critico';
```

### Parlamentar
```typescript
interface Parlamentar {
  id: number;
  cpf: string;
  nome: string;
  partido?: string;
  estado?: string;
  cargo?: string;
  scoreRisco: string;
  nivelRisco: NivelRisco;
  totalContratos?: number;
  totalEmendas?: number;
  dataAtualizacao: Date;
  ativo: number;
}
```

### Contrato
```typescript
interface Contrato {
  id: number;
  numeroContrato: string;
  orgaoContratante: string;
  empresaContratada?: string;
  valorContrato: string;
  valorPago: string;
  dataAssinatura: Date;
  dataVencimento?: Date;
  descricao?: string;
  objeto?: string;
  scoreRisco: string;
  nivelRisco: NivelRisco;
  temSobrepreco: number;
  percentualSobrepreco?: string;
  temVinculoFamiliar: number;
  fonteOrigem?: string;
  idFonteOrigem?: string;
  dataAtualizacao: Date;
  ativo: number;
}
```

### Emenda
```typescript
interface Emenda {
  id: number;
  numeroEmenda: string;
  parlamentarId?: number;
  parlamentarNome: string;
  valorEmenda: string;
  valorExecutado: string;
  municipio: string;
  estado: string;
  descricao?: string;
  tipoEmenda?: string;
  scoreRisco: string;
  nivelRisco: NivelRisco;
  dataEmenda: Date;
  fonteOrigem?: string;
  idFonteOrigem?: string;
  dataAtualizacao: Date;
  ativo: number;
}
```

### Alerta
```typescript
interface Alerta {
  id: number;
  tipo: string;
  parlamentarId?: number;
  contratoId?: number;
  emendaId?: number;
  titulo: string;
  descricao?: string;
  scoreRisco: string;
  nivelRisco: NivelRisco;
  status: 'novo' | 'analisando' | 'confirmado' | 'descartado';
  dataAlerta: Date;
  dataAtualizacao: Date;
  ativo: number;
}
```

## Endpoints

### Parlamentares

#### `fiscaliza.parlamentares.listar`

Lista todos os parlamentares com filtros opcionais.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  estado?: string;           // Filtrar por estado (ex: "SP")
  partido?: string;          // Filtrar por partido
  nivelRisco?: NivelRisco;   // Filtrar por nível de risco
  pagina?: number;           // Página (padrão: 1)
  limite?: number;           // Registros por página (padrão: 50)
}
```

**Resposta**:
```typescript
{
  parlamentares: Parlamentar[];
  total: number;
  pagina: number;
  limite: number;
}
```

**Exemplo (Frontend)**:
```typescript
const { data } = trpc.fiscaliza.parlamentares.listar.useQuery({
  estado: 'SP',
  nivelRisco: 'alto',
  pagina: 1,
});
```

---

#### `fiscaliza.parlamentares.buscarPorCPF`

Busca um parlamentar específico pelo CPF.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  cpf: string;  // CPF do parlamentar (ex: "12345678901")
}
```

**Resposta**:
```typescript
Parlamentar | null
```

**Exemplo**:
```typescript
const { data } = trpc.fiscaliza.parlamentares.buscarPorCPF.useQuery({
  cpf: '12345678901',
});
```

---

#### `fiscaliza.parlamentares.buscarPorNome`

Busca parlamentares por nome (busca parcial).

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  nome: string;              // Nome ou parte do nome
  limite?: number;           // Máximo de resultados (padrão: 20)
}
```

**Resposta**:
```typescript
Parlamentar[]
```

**Exemplo**:
```typescript
const { data } = trpc.fiscaliza.parlamentares.buscarPorNome.useQuery({
  nome: 'Silva',
  limite: 10,
});
```

---

#### `fiscaliza.parlamentares.obterDetalhes`

Obtém detalhes completos de um parlamentar incluindo contratos, emendas e alertas.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  id: number;  // ID do parlamentar
}
```

**Resposta**:
```typescript
{
  parlamentar: Parlamentar;
  contratos: Contrato[];
  emendas: Emenda[];
  alertas: Alerta[];
} | null
```

**Exemplo**:
```typescript
const { data } = trpc.fiscaliza.parlamentares.obterDetalhes.useQuery({
  id: 123,
});
```

---

### Contratos

#### `fiscaliza.contratos.listar`

Lista contratos públicos com filtros.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  nivelRisco?: NivelRisco;   // Filtrar por nível de risco
  orgao?: string;            // Filtrar por órgão contratante
  pagina?: number;           // Página (padrão: 1)
  limite?: number;           // Registros por página (padrão: 50)
}
```

**Resposta**:
```typescript
{
  contratos: Contrato[];
  total: number;
  pagina: number;
  limite: number;
}
```

---

#### `fiscaliza.contratos.buscarPorNumero`

Busca um contrato específico pelo número.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  numero: string;  // Número do contrato
}
```

**Resposta**:
```typescript
Contrato | null
```

---

### Emendas

#### `fiscaliza.emendas.listar`

Lista emendas parlamentares com filtros.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  estado?: string;           // Filtrar por estado
  nivelRisco?: NivelRisco;   // Filtrar por nível de risco
  pagina?: number;           // Página (padrão: 1)
  limite?: number;           // Registros por página (padrão: 50)
}
```

**Resposta**:
```typescript
{
  emendas: Emenda[];
  total: number;
  pagina: number;
  limite: number;
}
```

---

#### `fiscaliza.emendas.buscarPorParlamentar`

Lista emendas de um parlamentar específico.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  parlamentarId: number;  // ID do parlamentar
}
```

**Resposta**:
```typescript
Emenda[]
```

---

### Alertas

#### `fiscaliza.alertas.listar`

Lista alertas de risco detectados.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  tipo?: string;             // Tipo de alerta (ex: "sobrepreco")
  status?: string;           // Status do alerta
  nivelRisco?: NivelRisco;   // Filtrar por nível de risco
  pagina?: number;           // Página (padrão: 1)
  limite?: number;           // Registros por página (padrão: 50)
}
```

**Resposta**:
```typescript
{
  alertas: Alerta[];
  total: number;
  pagina: number;
  limite: number;
}
```

---

#### `fiscaliza.alertas.buscarPorParlamentar`

Lista alertas de um parlamentar específico.

**Tipo**: Query (GET)

**Parâmetros**:
```typescript
{
  parlamentarId: number;  // ID do parlamentar
}
```

**Resposta**:
```typescript
Alerta[]
```

---

### Análise e Estatísticas

#### `fiscaliza.analise.obterEstatisticas`

Obtém estatísticas gerais da plataforma.

**Tipo**: Query (GET)

**Parâmetros**: Nenhum

**Resposta**:
```typescript
{
  totalParlamentares: number;
  totalContratos: number;
  totalEmendas: number;
  totalAlertas: number;
  parlamentaresAltoRisco: number;
  contratosAltoRisco: number;
}
```

**Exemplo**:
```typescript
const { data } = trpc.fiscaliza.analise.obterEstatisticas.useQuery();
```

---

#### `fiscaliza.analise.distribuicaoRisco`

Obtém distribuição de parlamentares por nível de risco.

**Tipo**: Query (GET)

**Parâmetros**: Nenhum

**Resposta**:
```typescript
{
  baixo: number;
  medio: number;
  alto: number;
  critico: number;
}
```

---

## Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Requisição inválida (validação Zod falhou) |
| 401 | Não autenticado (requer login) |
| 403 | Não autorizado (requer permissão de admin) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

---

## Exemplos de Uso

### React Component

```typescript
import { trpc } from '@/lib/trpc';

export function ParlamentaresPage() {
  const [filtro, setFiltro] = useState({ estado: 'SP', pagina: 1 });
  
  const { data, isLoading, error } = trpc.fiscaliza.parlamentares.listar.useQuery(filtro);

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error.message}</div>;

  return (
    <div>
      <h1>Parlamentares</h1>
      <table>
        <tbody>
          {data?.parlamentares.map(p => (
            <tr key={p.id}>
              <td>{p.nome}</td>
              <td>{p.scoreRisco}%</td>
              <td>{p.nivelRisco}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Busca com Debounce

```typescript
import { useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export function BuscaParlamentares() {
  const [nome, setNome] = useState('');
  const debouncedNome = useDebounce(nome, 300);

  const { data } = trpc.fiscaliza.parlamentares.buscarPorNome.useQuery(
    { nome: debouncedNome },
    { enabled: debouncedNome.length > 2 }
  );

  return (
    <div>
      <input
        value={nome}
        onChange={e => setNome(e.target.value)}
        placeholder="Buscar parlamentar..."
      />
      {data?.map(p => <div key={p.id}>{p.nome}</div>)}
    </div>
  );
}
```

---

## Rate Limiting

A API implementa rate limiting para evitar abuso:

- **Limite**: 100 requisições por 15 minutos
- **Header**: `X-RateLimit-Remaining` indica requisições restantes
- **Erro 429**: Muitas requisições (aguarde antes de tentar novamente)

---

## Versionamento

A API segue versionamento semântico:

- **v1.0.0**: Release inicial
- Mudanças quebradas requerem nova versão major

---

## Changelog

### v1.0.0 (2024-03-25)
- Release inicial
- Endpoints de parlamentares, contratos, emendas e alertas
- Análise de risco com 6 indicadores
- Sincronização com APIs do governo

---

## Suporte

Para dúvidas ou problemas com a API:

- [Issues do GitHub](https://github.com/oviteira/fiscaliza-ai/issues)
- Email: suporte@fiscalizaai.com.br
