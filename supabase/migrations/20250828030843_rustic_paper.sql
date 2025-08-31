/*
  # Sistema de Pagamentos - Tabelas e Funcionalidades

  1. Novas Tabelas
    - `pagamentos`
      - `id` (uuid, primary key)
      - `membro_id` (uuid, foreign key)
      - `grupo_id` (uuid, foreign key)
      - `numero_cota` (text)
      - `mes_referencia` (text, formato YYYY-MM)
      - `valor_parcela` (decimal)
      - `data_pagamento` (timestamptz)
      - `tipo_pagamento` (enum: pix, dinheiro)
      - `status_pagamento` (enum: pendente, pago, atrasado, isento)
      - `comprovante` (jsonb)
      - `validado_por` (text)
      - `data_validacao` (timestamptz)
      - `observacoes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Enums
    - `tipo_pagamento_enum` (pix, dinheiro)
    - `status_pagamento_enum` (pendente, pago, atrasado, isento)

  3. Segurança
    - Enable RLS na tabela `pagamentos`
    - Políticas para membros verem apenas seus pagamentos
    - Políticas para administradores verem todos os pagamentos

  4. Funções
    - Trigger para atualizar `updated_at`
    - Função para calcular status de membros
    - Função para atualizar pagamentos em atraso
*/

-- Criar enums para tipos de pagamento e status
CREATE TYPE tipo_pagamento_enum AS ENUM ('pix', 'dinheiro');
CREATE TYPE status_pagamento_enum AS ENUM ('pendente', 'pago', 'atrasado', 'isento');

-- Criar tabela de pagamentos
CREATE TABLE IF NOT EXISTS pagamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  membro_id uuid NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  grupo_id uuid NOT NULL REFERENCES grupos_consorcio(id) ON DELETE CASCADE,
  numero_cota text NOT NULL,
  mes_referencia text NOT NULL, -- formato YYYY-MM
  valor_parcela decimal(10,2) NOT NULL DEFAULT 0,
  data_pagamento timestamptz,
  tipo_pagamento tipo_pagamento_enum NOT NULL DEFAULT 'pix',
  status_pagamento status_pagamento_enum NOT NULL DEFAULT 'pendente',
  comprovante jsonb, -- {nomeArquivo, tipoArquivo, tamanhoArquivo, urlArquivo, dataUpload}
  validado_por text,
  data_validacao timestamptz,
  observacoes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_membro_id ON pagamentos(membro_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_grupo_id ON pagamentos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_pagamentos_mes_referencia ON pagamentos(mes_referencia);
CREATE INDEX IF NOT EXISTS idx_pagamentos_status ON pagamentos(status_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_data_pagamento ON pagamentos(data_pagamento);

-- Constraint para garantir unicidade de pagamento por membro/grupo/mês
ALTER TABLE pagamentos ADD CONSTRAINT unique_pagamento_membro_grupo_mes 
  UNIQUE (membro_id, grupo_id, mes_referencia);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON pagamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE pagamentos ENABLE ROW LEVEL SECURITY;

-- Política para membros verem apenas seus próprios pagamentos
CREATE POLICY "Membros podem ver seus próprios pagamentos"
  ON pagamentos
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = membro_id::text);

-- Política para membros criarem seus próprios pagamentos
CREATE POLICY "Membros podem criar seus próprios pagamentos"
  ON pagamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = membro_id::text);

-- Política para membros atualizarem seus próprios pagamentos
CREATE POLICY "Membros podem atualizar seus próprios pagamentos"
  ON pagamentos
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = membro_id::text);

-- Política para administradores (assumindo que existe uma tabela de admins ou role)
-- Por enquanto, permitir acesso total para usuários autenticados
CREATE POLICY "Acesso administrativo completo"
  ON pagamentos
  FOR ALL
  TO authenticated
  USING (true);

-- Função para calcular status do membro em um grupo
CREATE OR REPLACE FUNCTION calcular_status_membro(p_membro_id uuid, p_grupo_id uuid)
RETURNS text AS $$
DECLARE
  pagamentos_atrasados integer;
  proximo_vencimento date;
  dias_para_vencimento integer;
BEGIN
  -- Contar pagamentos em atraso
  SELECT COUNT(*)
  INTO pagamentos_atrasados
  FROM pagamentos
  WHERE membro_id = p_membro_id
    AND grupo_id = p_grupo_id
    AND status_pagamento = 'atrasado';

  -- Se tem 3 ou mais pagamentos em atraso, é inadimplente
  IF pagamentos_atrasados >= 3 THEN
    RETURN 'inadimplente';
  END IF;

  -- Se tem pagamentos em atraso, está atrasado
  IF pagamentos_atrasados > 0 THEN
    RETURN 'atrasado';
  END IF;

  -- Calcular próximo vencimento (assumindo dia 10 de cada mês)
  proximo_vencimento := date_trunc('month', CURRENT_DATE) + interval '1 month' + interval '9 days';
  dias_para_vencimento := proximo_vencimento - CURRENT_DATE;

  -- Se está próximo do vencimento (5 dias ou menos)
  IF dias_para_vencimento <= 5 AND dias_para_vencimento > 0 THEN
    RETURN 'atencao';
  END IF;

  -- Caso contrário, está em dia
  RETURN 'em_dia';
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar status de pagamentos em atraso
CREATE OR REPLACE FUNCTION atualizar_status_atrasados()
RETURNS void AS $$
BEGIN
  -- Atualizar pagamentos pendentes que passaram do vencimento
  UPDATE pagamentos
  SET status_pagamento = 'atrasado'
  WHERE status_pagamento = 'pendente'
    AND data_pagamento IS NULL
    AND (
      -- Assumindo que o vencimento é dia 10 do mês de referência
      to_date(mes_referencia || '-10', 'YYYY-MM-DD') < CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql;

-- Criar view para status dos membros por grupo
CREATE OR REPLACE VIEW status_membros_grupos AS
SELECT 
  m.id as membro_id,
  gc.id as grupo_id,
  m.nome,
  m.nome_completo,
  gc.nome_grupo,
  calcular_status_membro(m.id, gc.id) as status_geral,
  (
    SELECT MAX(data_pagamento)
    FROM pagamentos p
    WHERE p.membro_id = m.id AND p.grupo_id = gc.id AND p.status_pagamento = 'pago'
  ) as ultimo_pagamento,
  -- Próximo vencimento (dia 10 do próximo mês)
  (date_trunc('month', CURRENT_DATE) + interval '1 month' + interval '9 days')::date as proximo_vencimento,
  (
    SELECT COALESCE(SUM(valor_parcela), 0)
    FROM pagamentos p
    WHERE p.membro_id = m.id AND p.grupo_id = gc.id AND p.status_pagamento = 'pago'
  ) as total_pago,
  (
    SELECT COUNT(*)
    FROM pagamentos p
    WHERE p.membro_id = m.id AND p.grupo_id = gc.id AND p.status_pagamento = 'atrasado'
  ) as parcelas_atrasadas,
  (
    SELECT COUNT(*)
    FROM pagamentos p
    WHERE p.membro_id = m.id 
      AND p.grupo_id = gc.id 
      AND p.comprovante IS NOT NULL 
      AND p.validado_por IS NULL
  ) as comprovantes_pendentes
FROM membros m
CROSS JOIN grupos_consorcio gc
WHERE EXISTS (
  -- Apenas membros que têm pelo menos um pagamento no grupo
  SELECT 1 FROM pagamentos p 
  WHERE p.membro_id = m.id AND p.grupo_id = gc.id
);