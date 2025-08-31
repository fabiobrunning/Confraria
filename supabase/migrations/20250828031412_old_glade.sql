/*
  # Sistema de Gerenciamento de Documentos

  1. Novas Tabelas
    - `documentos`
      - `id` (uuid, primary key)
      - `nome` (text)
      - `descricao` (text)
      - `categoria` (enum)
      - `grupo_id` (uuid, nullable - null = documento geral)
      - `arquivo` (jsonb - metadados do arquivo)
      - `upload_por` (text - ID do admin)
      - `data_upload` (timestamp)
      - `data_atualizacao` (timestamp)
      - `versao` (text)
      - `status` (enum)
      - `acesso_publico` (boolean)
      - `tags` (text array)
      - `historico_versoes` (jsonb array)

  2. Segurança
    - Enable RLS on `documentos` table
    - Add policies for public access and admin management
*/

-- Criar enums
CREATE TYPE categoria_documento AS ENUM ('minuta', 'contrato', 'regras', 'regulamento', 'ata', 'outros');
CREATE TYPE status_documento AS ENUM ('ativo', 'arquivado', 'rascunho');

-- Criar tabela de documentos
CREATE TABLE IF NOT EXISTS documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL,
  descricao text DEFAULT '',
  categoria categoria_documento NOT NULL,
  grupo_id uuid REFERENCES grupos_consorcio(id) ON DELETE SET NULL,
  arquivo jsonb NOT NULL,
  upload_por text NOT NULL,
  data_upload timestamptz DEFAULT now(),
  data_atualizacao timestamptz DEFAULT now(),
  versao text DEFAULT '1.0',
  status status_documento DEFAULT 'ativo',
  acesso_publico boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  historico_versoes jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_documentos_categoria ON documentos(categoria);
CREATE INDEX IF NOT EXISTS idx_documentos_grupo_id ON documentos(grupo_id);
CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos(status);
CREATE INDEX IF NOT EXISTS idx_documentos_acesso_publico ON documentos(acesso_publico);
CREATE INDEX IF NOT EXISTS idx_documentos_data_upload ON documentos(data_upload);
CREATE INDEX IF NOT EXISTS idx_documentos_tags ON documentos USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_documentos_busca ON documentos USING GIN(to_tsvector('portuguese', nome || ' ' || descricao));

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_documentos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.data_atualizacao = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documentos_updated_at
  BEFORE UPDATE ON documentos
  FOR EACH ROW
  EXECUTE FUNCTION update_documentos_updated_at();

-- Enable RLS
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Documentos públicos podem ser lidos por todos"
  ON documentos
  FOR SELECT
  TO public
  USING (acesso_publico = true AND status = 'ativo');

CREATE POLICY "Administradores podem ver todos os documentos"
  ON documentos
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Administradores podem inserir documentos"
  ON documentos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Administradores podem atualizar documentos"
  ON documentos
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Administradores podem deletar documentos"
  ON documentos
  FOR DELETE
  TO authenticated
  USING (true);

-- Função para busca de documentos
CREATE OR REPLACE FUNCTION buscar_documentos(
  termo_busca text DEFAULT '',
  categoria_filtro categoria_documento DEFAULT NULL,
  grupo_filtro uuid DEFAULT NULL,
  apenas_publicos boolean DEFAULT true
)
RETURNS TABLE (
  id uuid,
  nome text,
  descricao text,
  categoria categoria_documento,
  grupo_id uuid,
  nome_grupo text,
  arquivo jsonb,
  upload_por text,
  data_upload timestamptz,
  data_atualizacao timestamptz,
  versao text,
  status status_documento,
  acesso_publico boolean,
  tags text[],
  relevancia real
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.nome,
    d.descricao,
    d.categoria,
    d.grupo_id,
    g.nome_grupo,
    d.arquivo,
    d.upload_por,
    d.data_upload,
    d.data_atualizacao,
    d.versao,
    d.status,
    d.acesso_publico,
    d.tags,
    CASE 
      WHEN termo_busca = '' THEN 1.0
      ELSE ts_rank(to_tsvector('portuguese', d.nome || ' ' || d.descricao), plainto_tsquery('portuguese', termo_busca))
    END as relevancia
  FROM documentos d
  LEFT JOIN grupos_consorcio g ON d.grupo_id = g.id
  WHERE 
    (NOT apenas_publicos OR (d.acesso_publico = true AND d.status = 'ativo'))
    AND (categoria_filtro IS NULL OR d.categoria = categoria_filtro)
    AND (grupo_filtro IS NULL OR d.grupo_id = grupo_filtro OR d.grupo_id IS NULL)
    AND (
      termo_busca = '' OR
      to_tsvector('portuguese', d.nome || ' ' || d.descricao) @@ plainto_tsquery('portuguese', termo_busca) OR
      EXISTS (SELECT 1 FROM unnest(d.tags) tag WHERE tag ILIKE '%' || termo_busca || '%')
    )
  ORDER BY relevancia DESC, d.data_upload DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de documentos
CREATE OR REPLACE FUNCTION obter_estatisticas_documentos()
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_documentos', COUNT(*),
    'documentos_publicos', COUNT(*) FILTER (WHERE acesso_publico = true AND status = 'ativo'),
    'documentos_privados', COUNT(*) FILTER (WHERE acesso_publico = false OR status != 'ativo'),
    'por_categoria', jsonb_object_agg(categoria, categoria_count),
    'por_status', jsonb_object_agg(status, status_count),
    'documentos_recentes', COUNT(*) FILTER (WHERE data_upload >= now() - interval '30 days')
  ) INTO stats
  FROM (
    SELECT 
      categoria,
      status,
      acesso_publico,
      data_upload,
      COUNT(*) OVER (PARTITION BY categoria) as categoria_count,
      COUNT(*) OVER (PARTITION BY status) as status_count
    FROM documentos
  ) subquery;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir dados de exemplo
INSERT INTO documentos (nome, descricao, categoria, grupo_id, arquivo, upload_por, versao, acesso_publico, tags) VALUES
(
  'Regulamento Geral da Confraria Pedra Branca',
  'Regulamento geral que define as normas e procedimentos da Confraria Pedra Branca para todos os grupos de consórcio.',
  'regulamento',
  NULL,
  '{"nome_original": "regulamento_geral.pdf", "nome_arquivo": "reg_geral_2024.pdf", "tipo_arquivo": "application/pdf", "tamanho_arquivo": 2048576, "url_arquivo": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooUmVndWxhbWVudG8gR2VyYWwpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjA0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjk4CiUlRU9G", "data_upload": "2024-01-15T10:00:00Z"}',
  'admin',
  '2.1',
  true,
  ARRAY['regulamento', 'geral', 'normas', 'confraria']
),
(
  'Contrato de Adesão Padrão',
  'Modelo padrão de contrato de adesão para todos os grupos de consórcio da Confraria Pedra Branca.',
  'contrato',
  NULL,
  '{"nome_original": "contrato_adesao.pdf", "nome_arquivo": "contrato_padrao_2024.pdf", "tipo_arquivo": "application/pdf", "tamanho_arquivo": 1536000, "url_arquivo": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooQ29udHJhdG8gZGUgQWRlc8OjbykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagp4cmVmCjAgNQowMDAwMDAwMDAwIDY1NTM1IGYgCjAwMDAwMDAwMDkgMDAwMDAgbiAKMDAwMDAwMDA1OCAwMDAwMCBuIAowMDAwMDAwMTE1IDAwMDAwIG4gCjAwMDAwMDAyMDQgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA1Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgoyOTgKJSVFT0Y=", "data_upload": "2024-01-10T14:30:00Z"}',
  'admin',
  '1.0',
  true,
  ARRAY['contrato', 'adesão', 'padrão', 'modelo']
),
(
  'Regras de Sorteio',
  'Documento que estabelece as regras e procedimentos para realização de sorteios nos grupos de consórcio.',
  'regras',
  NULL,
  '{"nome_original": "regras_sorteio.pdf", "nome_arquivo": "regras_sorteio_2024.pdf", "tipo_arquivo": "application/pdf", "tamanho_arquivo": 1024000, "url_arquivo": "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL0xlbmd0aCA0NAo+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjcyIDcyMCBUZAooUmVncmFzIGRlIFNvcnRlaW8pIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjA0IDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNQovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMjk4CiUlRU9G", "data_upload": "2024-01-20T09:15:00Z"}',
  'admin',
  '1.2',
  true,
  ARRAY['regras', 'sorteio', 'procedimentos', 'normas']
);