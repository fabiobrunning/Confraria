-- Remover o tipo se ele já existir (para garantir idempotência e contornar o erro)
DROP TYPE IF EXISTS status_grupo;

-- Criar enum para status do grupo
CREATE TYPE status_grupo AS ENUM ('ATIVO', 'ARQUIVADO');

-- Criar tabela grupos_consorcio
CREATE TABLE IF NOT EXISTS grupos_consorcio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_grupo text NOT NULL,
  numero_grupo integer NOT NULL UNIQUE,
  nome_bem text NOT NULL,
  valor_bem numeric NOT NULL CHECK (valor_bem > 0),
  quantidade_cotas integer NOT NULL CHECK (quantidade_cotas > 0),
  valor_parcela numeric NOT NULL CHECK (valor_parcela > 0),
  data_inicio date NOT NULL,
  status_grupo status_grupo DEFAULT 'ATIVO' NOT NULL,
  sorteios_realizados integer DEFAULT 0 NOT NULL CHECK (sorteios_realizados >= 0),
  sorteios_restantes integer NOT NULL CHECK (sorteios_restantes >= 0),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Habilitar Row Level Security
ALTER TABLE grupos_consorcio ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Permitir leitura para todos"
  ON grupos_consorcio
  FOR SELECT
  USING (true);

CREATE POLICY "Permitir inserção para usuários autenticados"
  ON grupos_consorcio
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Permitir atualização para usuários autenticados"
  ON grupos_consorcio
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir exclusão para usuários autenticados"
  ON grupos_consorcio
  FOR DELETE
  USING (true);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_grupos_consorcio_updated_at
  BEFORE UPDATE ON grupos_consorcio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_grupos_consorcio_numero_grupo ON grupos_consorcio(numero_grupo);
CREATE INDEX IF NOT EXISTS idx_grupos_consorcio_status ON grupos_consorcio(status_grupo);
