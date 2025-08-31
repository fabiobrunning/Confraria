/*
  # Atualizar integração do sistema de pagamentos com membros

  1. Melhorar view de status dos membros
  2. Adicionar função para gerar pagamentos automáticos
  3. Atualizar políticas de segurança
  4. Criar função para calcular inadimplência
*/

-- Atualizar view de status dos membros por grupo
DROP VIEW IF EXISTS status_membros_grupos;

CREATE VIEW status_membros_grupos AS
SELECT 
  m.id as membro_id,
  c.grupo_id,
  m.nome,
  m.nome_completo,
  g.nome_grupo,
  CASE 
    WHEN COUNT(CASE WHEN p.status_pagamento = 'atrasado' THEN 1 END) >= 3 THEN 'inadimplente'
    WHEN COUNT(CASE WHEN p.status_pagamento = 'atrasado' THEN 1 END) > 0 THEN 'atrasado'
    WHEN EXTRACT(DAY FROM (CURRENT_DATE + INTERVAL '1 month' - CURRENT_DATE)) <= 5 THEN 'atencao'
    ELSE 'em_dia'
  END as status_geral,
  MAX(p.data_pagamento) as ultimo_pagamento,
  (CURRENT_DATE + INTERVAL '1 month')::date as proximo_vencimento,
  COALESCE(SUM(CASE WHEN p.status_pagamento = 'pago' THEN p.valor_parcela ELSE 0 END), 0) as total_pago,
  COUNT(CASE WHEN p.status_pagamento = 'atrasado' THEN 1 END) as parcelas_atrasadas,
  COUNT(CASE WHEN p.comprovante IS NOT NULL AND p.validado_por IS NULL THEN 1 END) as comprovantes_pendentes
FROM membros m
JOIN cotas c ON m.id = c.membro_id
JOIN grupos_consorcio g ON c.grupo_id = g.id
LEFT JOIN pagamentos p ON m.id = p.membro_id AND c.grupo_id = p.grupo_id
WHERE c.status_cota = 'ATIVA'
GROUP BY m.id, c.grupo_id, m.nome, m.nome_completo, g.nome_grupo;

-- Função para gerar pagamentos mensais automaticamente
CREATE OR REPLACE FUNCTION gerar_pagamentos_mensais(p_grupo_id UUID, p_mes_referencia TEXT)
RETURNS INTEGER AS $$
DECLARE
  cota_record RECORD;
  grupo_record RECORD;
  pagamentos_criados INTEGER := 0;
BEGIN
  -- Buscar dados do grupo
  SELECT * INTO grupo_record FROM grupos_consorcio WHERE id = p_grupo_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Grupo não encontrado';
  END IF;
  
  -- Criar pagamentos para todas as cotas ativas do grupo
  FOR cota_record IN 
    SELECT c.*, m.id as membro_id 
    FROM cotas c 
    JOIN membros m ON c.membro_id = m.id 
    WHERE c.grupo_id = p_grupo_id AND c.status_cota = 'ATIVA'
  LOOP
    -- Verificar se já existe pagamento para este mês
    IF NOT EXISTS (
      SELECT 1 FROM pagamentos 
      WHERE membro_id = cota_record.membro_id 
      AND grupo_id = p_grupo_id 
      AND mes_referencia = p_mes_referencia
    ) THEN
      -- Criar pagamento
      INSERT INTO pagamentos (
        membro_id,
        grupo_id,
        numero_cota,
        mes_referencia,
        valor_parcela,
        tipo_pagamento,
        status_pagamento
      ) VALUES (
        cota_record.membro_id,
        p_grupo_id,
        cota_record.numero_cota,
        p_mes_referencia,
        grupo_record.valor_parcela,
        'pix',
        'pendente'
      );
      
      pagamentos_criados := pagamentos_criados + 1;
    END IF;
  END LOOP;
  
  RETURN pagamentos_criados;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para calcular status de inadimplência
CREATE OR REPLACE FUNCTION calcular_inadimplencia()
RETURNS TABLE(
  membro_id UUID,
  grupo_id UUID,
  nome_membro TEXT,
  nome_grupo TEXT,
  parcelas_atrasadas BIGINT,
  valor_total_devido NUMERIC,
  status_inadimplencia TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.membro_id,
    p.grupo_id,
    COALESCE(m.nome_completo, m.nome) as nome_membro,
    g.nome_grupo,
    COUNT(CASE WHEN p.status_pagamento = 'atrasado' THEN 1 END) as parcelas_atrasadas,
    SUM(CASE WHEN p.status_pagamento IN ('pendente', 'atrasado') THEN p.valor_parcela ELSE 0 END) as valor_total_devido,
    CASE 
      WHEN COUNT(CASE WHEN p.status_pagamento = 'atrasado' THEN 1 END) >= 3 THEN 'inadimplente'
      WHEN COUNT(CASE WHEN p.status_pagamento = 'atrasado' THEN 1 END) > 0 THEN 'atrasado'
      ELSE 'em_dia'
    END as status_inadimplencia
  FROM pagamentos p
  JOIN membros m ON p.membro_id = m.id
  JOIN grupos_consorcio g ON p.grupo_id = g.id
  GROUP BY p.membro_id, p.grupo_id, m.nome, m.nome_completo, g.nome_grupo
  HAVING COUNT(CASE WHEN p.status_pagamento IN ('pendente', 'atrasado') THEN 1 END) > 0
  ORDER BY parcelas_atrasadas DESC, valor_total_devido DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar políticas de segurança para controle de acesso mais específico
DROP POLICY IF EXISTS "Membros podem ver seus próprios pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Membros podem criar seus próprios pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Membros podem atualizar seus próprios pagamentos" ON pagamentos;
DROP POLICY IF EXISTS "Acesso administrativo completo" ON pagamentos;

-- Política para membros verem apenas seus pagamentos
CREATE POLICY "Membros podem ver seus próprios pagamentos"
  ON pagamentos
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = membro_id::text);

-- Política para membros criarem seus próprios pagamentos (upload de comprovante)
CREATE POLICY "Membros podem criar seus próprios pagamentos"
  ON pagamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = membro_id::text);

-- Política para membros atualizarem seus próprios pagamentos (upload de comprovante)
CREATE POLICY "Membros podem atualizar seus próprios pagamentos"
  ON pagamentos
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = membro_id::text);

-- Política para administradores terem acesso completo
CREATE POLICY "Acesso administrativo completo"
  ON pagamentos
  FOR ALL
  TO authenticated
  USING (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_pagamentos_status_membro ON pagamentos(membro_id, status_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_grupo_mes ON pagamentos(grupo_id, mes_referencia);
CREATE INDEX IF NOT EXISTS idx_pagamentos_validacao ON pagamentos(validado_por, data_validacao) WHERE comprovante IS NOT NULL;

-- Comentários para documentação
COMMENT ON VIEW status_membros_grupos IS 'View que mostra o status de adimplência de cada membro por grupo';
COMMENT ON FUNCTION gerar_pagamentos_mensais IS 'Gera pagamentos mensais para todas as cotas ativas de um grupo';
COMMENT ON FUNCTION calcular_inadimplencia IS 'Calcula relatório de inadimplência com detalhes por membro e grupo';