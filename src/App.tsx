import React, { useState } from 'react';
import { Users, Building2, Target, FileText, Search, Plus, Download, User, Trophy, UserCheck, UsersIcon, Clock, CheckCircle, AlertCircle, UserPlus, Smartphone, FolderOpen, Globe } from 'lucide-react';
import { GrupoForm } from './components/GrupoForm';
import { GrupoCard } from './components/GrupoCard';
import { MembroForm } from './components/MembroForm';
import { MembroCard } from './components/MembroCard';
import { SorteioInterface } from './components/SorteioInterface';
import { PagamentoCard } from './components/PagamentoCard';
import { UploadComprovanteModal } from './components/UploadComprovanteModal';
import { VisualizarComprovanteModal } from './components/VisualizarComprovanteModal';
import { DocumentoCard } from './components/DocumentoCard';
import { DocumentoForm } from './components/DocumentoForm';
import { VisualizarDocumentoModal } from './components/VisualizarDocumentoModal';
import { MembrosHeader } from './components/MembrosHeader';
import { MembrosFilters } from './components/MembrosFilters';
import { MembrosAcoesLote } from './components/MembrosAcoesLote';
import { MembrosListaPaginacao } from './components/MembrosListaPaginacao';
import { LegendaGlobal } from './components/LegendaGlobal';
import { GrupoService } from './services/grupoService';
import { MembroService } from './services/membroService';
import { PagamentoService } from './services/pagamentoService';
import { DocumentoService } from './services/documentoService';
import { GrupoConsorcio, CreateGrupoData } from './types/grupo';
import { Membro, PreCadastroData, CadastroCompletoData } from './types/membro';
import { Pagamento, UploadComprovanteData, StatusMembroGrupo } from './types/pagamento';
import { Documento, CreateDocumentoData, CATEGORIAS_DOCUMENTO } from './types/documento';

interface Stats {
  total: number;
  aguardando: number;
  andamento: number;
  finalizado: number;
  totalCotas: number;
}

interface MembroStats {
  total: number;
  preCadastro: number;
  cadastroCompleto: number;
  contemplados: number;
}

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

function App() {
  const [activeTab, setActiveTab] = useState('membros');
  const [searchTerm, setSearchTerm] = useState('');
  const [showGrupoForm, setShowGrupoForm] = useState(false);
  const [showMembroForm, setShowMembroForm] = useState(false);
  const [showSorteioInterface, setShowSorteioInterface] = useState(false);
  const [grupos, setGrupos] = useState<GrupoConsorcio[]>([]);
  const [membros, setMembros] = useState<Membro[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    aguardando: 0,
    andamento: 0,
    finalizado: 0,
    totalCotas: 0
  });
  const [membroStats, setMembroStats] = useState<MembroStats>({
    total: 0,
    preCadastro: 0,
    cadastroCompleto: 0,
    contemplados: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState<GrupoConsorcio | null>(null);
  const [editingMembro, setEditingMembro] = useState<Membro | null>(null);
  const [membroFormStep, setMembroFormStep] = useState<1 | 2>(1);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showVisualizarModal, setShowVisualizarModal] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState<Pagamento | null>(null);
  const [statusMembrosGrupos, setStatusMembrosGrupos] = useState<StatusMembroGrupo[]>([]);
  const [isAdmin, setIsAdmin] = useState(true); // Por enquanto sempre admin, depois implementar auth
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [showDocumentoForm, setShowDocumentoForm] = useState(false);
  const [showVisualizarDocumento, setShowVisualizarDocumento] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('');

  // Estados específicos para membros
  const [filtroGrupo, setFiltroGrupo] = useState<string>('');
  const [filtroStatusPagamento, setFiltroStatusPagamento] = useState<string>('');
  const [filtroStatusCota, setFiltroStatusCota] = useState<string>('');
  const [filtroStatusMembro, setFiltroStatusMembro] = useState<string>('');
  const [ordenacao, setOrdenacao] = useState<string>('nome_asc');
  const [selectedMembros, setSelectedMembros] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  React.useEffect(() => {
    loadGrupos();
    loadStats();
    loadMembros();
    loadMembroStats();
    loadPagamentos();
    loadStatusMembrosGrupos();
    loadDocumentos();
  }, []);

  const loadGrupos = async () => {
    try {
      const data = await GrupoService.getAll();
      setGrupos(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const loadMembros = async () => {
    try {
      const data = await MembroService.getAll();
      setMembros(data);
    } catch (error) {
      console.error('Erro ao carregar membros:', error);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await GrupoService.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadMembroStats = async () => {
    try {
      const statsData = await MembroService.getStats();
      setMembroStats(statsData);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de membros:', error);
    }
  };

  const loadStatusMembrosGrupos = async () => {
    try {
      const data = await MembroService.getStatusMembrosGrupos();
      setStatusMembrosGrupos(data);
    } catch (error) {
      console.error('Erro ao carregar status dos membros:', error);
    }
  };

  const loadDocumentos = async () => {
    try {
      const data = await DocumentoService.getDocumentosPublicos();
      setDocumentos(data);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  };

  const handleCreateGrupo = async (data: CreateGrupoData) => {
    setIsLoading(true);
    try {
      await GrupoService.create(data);
      setShowGrupoForm(false);
      await loadGrupos();
      await loadStats();
    } catch (error) {
      console.error('Erro ao criar grupo:', error);
      alert('Erro ao criar grupo. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePreCadastro = async (data: PreCadastroData) => {
    setIsLoading(true);
    try {
      await MembroService.createPreCadastro(data);
      setShowMembroForm(false);
      await loadMembros();
      await loadMembroStats();
      await loadStatusMembrosGrupos();
    } catch (error) {
      console.error('Erro ao criar pré-cadastro:', error);
      alert('Erro ao criar pré-cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteCadastro = async (data: CadastroCompletoData) => {
    if (!editingMembro) return;
    
    setIsLoading(true);
    try {
      await MembroService.completarCadastro(editingMembro.id, data);
      setShowMembroForm(false);
      setEditingMembro(null);
      await loadMembros();
      await loadMembroStats();
      await loadStatusMembrosGrupos();
    } catch (error) {
      console.error('Erro ao completar cadastro:', error);
      alert('Erro ao completar cadastro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocumento = async (data: CreateDocumentoData) => {
    setIsLoading(true);
    try {
      await DocumentoService.create(data);
      setShowDocumentoForm(false);
      await loadDocumentos();
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      alert('Erro ao criar documento. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocumento = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      try {
        await DocumentoService.delete(id);
        await loadDocumentos();
      } catch (error) {
        console.error('Erro ao deletar documento:', error);
        alert('Erro ao deletar documento. Tente novamente.');
      }
    }
  };

  const handleViewDocumento = (documento: Documento) => {
    setSelectedDocumento(documento);
    setShowVisualizarDocumento(true);
  };

  const handleEditGrupo = (grupo: GrupoConsorcio) => {
    setEditingGrupo(grupo);
    setShowGrupoForm(true);
  };

  const handleDeleteGrupo = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        await GrupoService.delete(id);
        await loadGrupos();
        await loadStats();
      } catch (error) {
        console.error('Erro ao deletar grupo:', error);
        alert('Erro ao deletar grupo. Tente novamente.');
      }
    }
  };

  const handleEditMembro = (membro: Membro) => {
    setEditingMembro(membro);
    setMembroFormStep(membro.status_membro === 'PRE_CADASTRO' ? 1 : 2);
    setShowMembroForm(true);
  };

  const handleDeleteMembro = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este membro?')) {
      try {
        await MembroService.delete(id);
        await loadMembros();
        await loadMembroStats();
        await loadStatusMembrosGrupos();
      } catch (error) {
        console.error('Erro ao deletar membro:', error);
        alert('Erro ao deletar membro. Tente novamente.');
      }
    }
  };

  const handleCompleteCadastroMembro = (id: string) => {
    const membro = membros.find(m => m.id === id);
    if (membro) {
      setEditingMembro(membro);
      setMembroFormStep(2);
      setShowMembroForm(true);
    }
  };

  const loadPagamentos = async () => {
    try {
      const data = await PagamentoService.getAllPagamentos();
      setPagamentos(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
    }
  };

  const handleUploadComprovante = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setShowUploadModal(true);
  };

  const handleVisualizarComprovante = (pagamento: Pagamento) => {
    setSelectedPagamento(pagamento);
    setShowVisualizarModal(true);
  };

  const handleUploadSubmit = async (arquivo: File, observacoes: string) => {
    if (!selectedPagamento) return;

    setIsLoading(true);
    try {
      const uploadData: UploadComprovanteData = {
        pagamentoId: selectedPagamento.id,
        arquivo,
        observacoes
      };
      
      await PagamentoService.uploadComprovante(uploadData);
      setShowUploadModal(false);
      setSelectedPagamento(null);
      await loadPagamentos();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao enviar comprovante. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewMemberDetails = (membro: Membro) => {
    // TODO: Implementar modal de detalhes do membro
    console.log('Ver detalhes do membro:', membro);
  };

  const handleExportSelected = () => {
    // TODO: Implementar exportação dos membros selecionados
    console.log('Exportar membros selecionados:', Array.from(selectedMembros));
  };

  const handleMarkAsEmDia = () => {
    // TODO: Implementar marcação como "em dia" para membros selecionados
    console.log('Marcar como em dia:', Array.from(selectedMembros));
  };

  const handleClearSelection = () => {
    setSelectedMembros(new Set());
  };

  const handleToggleSelection = (membroId: string) => {
    const newSelection = new Set(selectedMembros);
    if (newSelection.has(membroId)) {
      newSelection.delete(membroId);
    } else {
      newSelection.add(membroId);
    }
    setSelectedMembros(newSelection);
  };

  // Criar mapa de status de pagamentos por membro e grupo
  const getStatusPagamentosMembro = (membroId: string) => {
    const statusMap: { [grupoId: string]: 'em_dia' | 'atrasado' | 'inadimplente' | 'atencao' } = {};
    
    statusMembrosGrupos
      .filter(status => status.membroId === membroId)
      .forEach(status => {
        statusMap[status.grupoId] = status.statusGeral;
      });
    
    return statusMap;
  };

  // Filtrar e ordenar membros
  const getFilteredAndSortedMembros = () => {
    let filtered = membros.filter(membro => {
      // Filtro de busca
      const matchesSearch = membro.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (membro.nome_completo && membro.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        membro.telefone.includes(searchTerm) ||
        (membro.cpf && membro.cpf.includes(searchTerm));
      
      if (!matchesSearch) return false;

      // Filtro por grupo
      if (filtroGrupo) {
        const temGrupo = membro.cotas?.some(cota => cota.grupo_id === filtroGrupo);
        if (!temGrupo) return false;
      }

      // Filtro por status do membro
      if (filtroStatusMembro && membro.status_membro !== filtroStatusMembro) {
        return false;
      }

      // Filtro por status de pagamento
      if (filtroStatusPagamento) {
        const statusGeral = getStatusGeralPagamento(membro.id);
        if (statusGeral !== filtroStatusPagamento) return false;
      }

      // Filtro por status da cota
      if (filtroStatusCota) {
        const temStatusCota = membro.cotas?.some(cota => {
          if (filtroStatusCota === 'contemplado') {
            return cota.status_cota === 'CONTEMPLADA';
          } else if (filtroStatusCota === 'nao_contemplado') {
            return cota.status_cota !== 'CONTEMPLADA';
          }
          return false;
        });
        if (!temStatusCota) return false;
      }

      return true;
    });

    // Ordenação
    filtered.sort((a, b) => {
      switch (ordenacao) {
        case 'nome_asc':
          return (a.nome_completo || a.nome).localeCompare(b.nome_completo || b.nome);
        case 'nome_desc':
          return (b.nome_completo || b.nome).localeCompare(a.nome_completo || a.nome);
        case 'data_cadastro_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'data_cadastro_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'grupos_count':
          return (b.cotas?.length || 0) - (a.cotas?.length || 0);
        case 'status_pagamento':
          const statusA = getStatusGeralPagamento(a.id);
          const statusB = getStatusGeralPagamento(b.id);
          const statusOrder = { 'inadimplente': 0, 'atrasado': 1, 'atencao': 2, 'em_dia': 3 };
          return statusOrder[statusA] - statusOrder[statusB];
        default:
          return 0;
      }
    });

    return filtered;
  };

  const getStatusGeralPagamento = (membroId: string) => {
    const statusMap = getStatusPagamentosMembro(membroId);
    if (Object.keys(statusMap).length === 0) return 'em_dia';
    
    const statuses = Object.values(statusMap);
    if (statuses.some(s => s === 'inadimplente')) return 'inadimplente';
    if (statuses.some(s => s === 'atrasado')) return 'atrasado';
    if (statuses.some(s => s === 'atencao')) return 'atencao';
    return 'em_dia';
  };

  // Calcular estatísticas dos membros
  const getMembrosStats = () => {
    const total = membros.length;
    let emDia = 0;
    let emAtraso = 0;
    let contemplados = 0;

    membros.forEach(membro => {
      const statusGeral = getStatusGeralPagamento(membro.id);
      if (statusGeral === 'em_dia') emDia++;
      if (statusGeral === 'atrasado' || statusGeral === 'inadimplente') emAtraso++;
      if (membro.cotas?.some(cota => cota.status_cota === 'CONTEMPLADA')) contemplados++;
    });

    return { total, emDia, emAtraso, contemplados };
  };

  // Paginação
  const filteredMembros = getFilteredAndSortedMembros();
  const totalPages = Math.ceil(filteredMembros.length / itemsPerPage);
  const paginatedMembros = filteredMembros.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const filteredGrupos = grupos.filter(grupo =>
    grupo.nome_grupo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.nome_bem.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grupo.numero_grupo.toString().includes(searchTerm)
  );

  const filteredPagamentos = pagamentos.filter(pagamento =>
    pagamento.mesReferencia.includes(searchTerm) ||
    pagamento.numeroCota.includes(searchTerm) ||
    pagamento.statusPagamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDocumentos = documentos.filter(documento => {
    const matchesSearch = documento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      documento.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (documento.nomeGrupo && documento.nomeGrupo.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategoria = !filtroCategoria || documento.categoria === filtroCategoria;
    
    return matchesSearch && matchesCategoria;
  });

  // Filtrar pagamentos baseado no tipo de usuário
  const getPagamentosParaExibir = () => {
    if (isAdmin) {
      return filteredPagamentos;
    } else {
      // Para membros, mostrar apenas seus próprios pagamentos
      // Por enquanto retorna todos, depois implementar com auth real
      return filteredPagamentos;
    }
  };

  const tabs: TabItem[] = [
    { id: 'membros', label: 'MEMBROS', icon: Users },
    { id: 'grupos', label: 'GRUPOS', icon: Building2 },
    { id: 'pagamentos', label: 'PAGAMENTOS', icon: Smartphone },
    { id: 'sorteio', label: 'SORTEIO', icon: Globe },
    { id: 'documentos', label: 'DOCUMENTOS', icon: FolderOpen },
  ];

  const getStatsCards = (): StatCard[] => {
    if (activeTab === 'membros') {
      return [
        { title: 'Total de Membros', value: membroStats.total, icon: Users },
        { title: 'Pré-cadastros', value: membroStats.preCadastro, icon: Clock },
        { title: 'Cadastros Completos', value: membroStats.cadastroCompleto, icon: CheckCircle },
        { title: 'Contemplados', value: membroStats.contemplados, icon: Trophy },
      ];
    } else {
      return [
        { title: 'Total de Grupos', value: stats.total, icon: Building2 },
        { title: 'Aguardando Sorteios', value: stats.aguardando, icon: Clock },
        { title: 'Em Andamento', value: stats.andamento, icon: AlertCircle },
        { title: 'Finalizados', value: stats.finalizado, icon: CheckCircle },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-400">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-6">
          <div className="flex items-center justify-between h-14 md:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/LogoPreto.png" 
                alt="Logo" 
               style={{ transform: 'scale(1.9)' }}
className="h-10 w-auto"
              />
            </div>
            
            {/* Company Name */}
            <div className="flex items-center pr-6 sm:pr-4 md:pr-6 lg:pr-10">
              <img 
                src="/Confraria preta.png" 
                alt="Confraria Pedra Branca" 
                style={{ transform: 'scale(3.3)' }}
                className="h-8 md:h-10 w-auto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="fixed top-14 md:top-16 left-0 right-0 bg-white border-b border-gray-200 z-30">
        <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
          <nav className="flex space-x-2 md:space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1 md:space-x-2 py-3 md:py-4 px-2 md:px-3 border-b-2 font-bold text-xs md:text-sm transition-colors duration-200 whitespace-nowrap ${
                    isActive
                      ? 'border-gold-600 text-gold-700 bg-gold-100 font-bold shadow-lg'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-28 md:pt-32 w-full px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
          {getStatsCards().map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 md:p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="bg-gray-50 p-2 md:p-3 rounded-lg mt-2 md:mt-0">
                    <Icon className="w-4 h-4 md:w-6 md:h-6 text-gray-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Field */}
            <div className="relative flex-1 max-w-full md:max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={
                  activeTab === 'grupos' ? "Buscar grupos..." : 
                  activeTab === 'membros' ? "Buscar membros..." :
                  activeTab === 'pagamentos' ? "Buscar pagamentos..." :
                  "Buscar..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 md:py-3 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gold-500 focus:border-gold-500 text-sm md:text-base"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-3">
              <button 
                onClick={() => {
                  if (activeTab === 'membros') {
                    setEditingMembro(null);
                    setMembroFormStep(1);
                    setShowMembroForm(true);
                  } else if (activeTab === 'grupos') {
                    setEditingGrupo(null);
                    setShowGrupoForm(true);
                  } else if (activeTab === 'documentos') {
                    setShowDocumentoForm(true);
                  }
                }}
                className="inline-flex items-center justify-center px-4 py-3 md:py-2 bg-gold-500 text-white text-sm md:text-base font-medium rounded-md hover:bg-gold-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold-500 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" />
                {activeTab === 'grupos' ? 'Novo Grupo' : 
                 activeTab === 'membros' ? 'Novo Membro' :
                 activeTab === 'documentos' ? 'Novo Documento' :
                 'Novo'}
              </button>
              <button className="inline-flex items-center justify-center px-4 py-3 md:py-2 bg-gray-100 text-gray-700 text-sm md:text-base font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200">
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </button>
            </div>
          </div>

          {/* Filtros específicos para documentos */}
          {activeTab === 'documentos' && (
            <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setFiltroCategoria('')}
                className={`px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                  !filtroCategoria 
                    ? 'bg-gold-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas as Categorias
              </button>
              {Object.entries(CATEGORIAS_DOCUMENTO).map(([key, categoria]) => (
                <button
                  key={key}
                  onClick={() => setFiltroCategoria(key)}
                  className={`px-3 py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap ${
                    filtroCategoria === key 
                      ? 'bg-gold-500 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {categoria.icone} {categoria.nome}
                </button>
              ))}
            </div>
          )}

          {/* Content Area */}
          <div className="mt-6 md:mt-8">
            {activeTab === 'membros' && (
              <div>
                <MembrosHeader stats={getMembrosStats()} />
                
                <MembrosFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  grupos={grupos}
                  filtroGrupo={filtroGrupo}
                  onFiltroGrupoChange={setFiltroGrupo}
                  filtroStatusPagamento={filtroStatusPagamento}
                  onFiltroStatusPagamentoChange={setFiltroStatusPagamento}
                  filtroStatusCota={filtroStatusCota}
                  onFiltroStatusCotaChange={setFiltroStatusCota}
                  filtroStatusMembro={filtroStatusMembro}
                  onFiltroStatusMembroChange={setFiltroStatusMembro}
                  ordenacao={ordenacao}
                  onOrdenacaoChange={setOrdenacao}
                />

                <MembrosAcoesLote
                  selectedCount={selectedMembros.size}
                  onExportSelected={handleExportSelected}
                  onMarkAsEmDia={handleMarkAsEmDia}
                  onClearSelection={handleClearSelection}
                  isVisible={selectedMembros.size > 0}
                />

                {paginatedMembros.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Users className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                      {filteredMembros.length === 0 ? 'Nenhum membro encontrado' : 'Nenhum membro cadastrado'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                      {filteredMembros.length === 0 
                        ? 'Comece adicionando seu primeiro membro ao sistema.' 
                        : 'Tente ajustar os filtros de busca.'}
                    </p>
                    {filteredMembros.length === 0 && (
                      <button 
                        onClick={() => {
                          setEditingMembro(null);
                          setMembroFormStep(1);
                          setShowMembroForm(true);
                        }}
                        className="inline-flex items-center px-4 py-3 md:py-2 bg-gold-500 text-white text-sm md:text-base font-medium rounded-md hover:bg-gold-600 transition-colors duration-200"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Membro
                      </button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedMembros.map((membro) => (
                        <MembroCard
                          key={membro.id}
                          membro={membro}
                          statusPagamentos={getStatusPagamentosMembro(membro.id)}
                          onEdit={handleEditMembro}
                          onDelete={handleDeleteMembro}
                          onCompleteCadastro={handleCompleteCadastroMembro}
                          onViewDetails={handleViewMemberDetails}
                        />
                      ))}
                    </div>

                    <MembrosListaPaginacao
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={filteredMembros.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </>
                )}
              </div>
            )}
            
            {activeTab === 'grupos' && (
              <div>
                {filteredGrupos.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Building2 className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                      {grupos.length === 0 ? 'Nenhum grupo criado' : 'Nenhum grupo encontrado'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                      {grupos.length === 0 
                        ? 'Comece criando seu primeiro grupo de consórcio.' 
                        : 'Tente ajustar os filtros de busca.'}
                    </p>
                    {grupos.length === 0 && (
                      <button 
                        onClick={() => {
                          setEditingGrupo(null);
                          setShowGrupoForm(true);
                        }}
                        className="inline-flex items-center px-4 py-3 md:py-2 bg-gold-500 text-white text-sm md:text-base font-medium rounded-md hover:bg-gold-600 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Primeiro Grupo
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredGrupos.map((grupo) => (
                      <GrupoCard
                        key={grupo.id}
                        grupo={grupo}
                        onEdit={handleEditGrupo}
                        onDelete={handleDeleteGrupo}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'pagamentos' && (
              <div>
                {getPagamentosParaExibir().length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Smartphone className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                      {pagamentos.length === 0 ? 'Nenhum pagamento registrado' : 'Nenhum pagamento encontrado'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                      {pagamentos.length === 0 
                        ? 'Os pagamentos aparecerão aqui conforme forem sendo registrados.' 
                        : 'Tente ajustar os filtros de busca.'}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {getPagamentosParaExibir().map((pagamento) => (
                      <PagamentoCard
                        key={pagamento.id}
                        pagamento={pagamento}
                        onUploadComprovante={handleUploadComprovante}
                        onVisualizarComprovante={handleVisualizarComprovante}
                        isAdmin={isAdmin}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'sorteio' && (
              <div>
                {grupos.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <Globe className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Área de Sorteios</h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                      Você precisa ter grupos cadastrados para realizar sorteios.
                    </p>
                    <button 
                      onClick={() => {
                        setActiveTab('grupos');
                        setEditingGrupo(null);
                        setShowGrupoForm(true);
                      }}
                      className="inline-flex items-center px-4 py-3 md:py-2 bg-gold-500 text-white text-sm md:text-base font-medium rounded-md hover:bg-gold-600 transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Grupo
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-8 md:py-12">
                    <Globe className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">Sistema de Sorteio</h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                      Execute sorteios para seus grupos de consórcio com interface de bingo.
                    </p>
                    <button 
                      onClick={() => setShowSorteioInterface(true)}
                      className="inline-flex items-center px-6 py-4 md:py-3 bg-gold-500 text-white text-base md:text-lg font-medium rounded-md hover:bg-gold-600 transition-colors duration-200"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Iniciar Sorteio
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'documentos' && (
              <div>
                {filteredDocumentos.length === 0 ? (
                  <div className="text-center py-8 md:py-12">
                    <FolderOpen className="w-8 h-8 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
                      {documentos.length === 0 ? 'Nenhum documento disponível' : 'Nenhum documento encontrado'}
                    </h3>
                    <p className="text-sm md:text-base text-gray-500 mb-6 px-4">
                      {documentos.length === 0 
                        ? 'Os documentos da confraria aparecerão aqui quando forem publicados.' 
                        : 'Tente ajustar os filtros de busca.'}
                    </p>
                    {documentos.length === 0 && (
                      <button 
                        onClick={() => setShowDocumentoForm(true)}
                        className="inline-flex items-center px-4 py-3 md:py-2 bg-gold-500 text-white text-sm md:text-base font-medium rounded-md hover:bg-gold-600 transition-colors duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Primeiro Documento
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                    {filteredDocumentos.map((documento) => (
                      <DocumentoCard
                        key={documento.id}
                        documento={documento}
                        isAdmin={true} // TODO: verificar se é admin
                        onView={handleViewDocumento}
                        onDelete={handleDeleteDocumento}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legenda Global */}
      <LegendaGlobal pagina={activeTab as any} />

      {/* Grupo Form Modal */}
      {showGrupoForm && (
        <GrupoForm
          onSubmit={handleCreateGrupo}
          onCancel={() => {
            setShowGrupoForm(false);
            setEditingGrupo(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Membro Form Modal */}
      {showMembroForm && (
        <MembroForm
          onSubmitPreCadastro={handleCreatePreCadastro}
          onSubmitCadastroCompleto={handleCompleteCadastro}
          onCancel={() => {
            setShowMembroForm(false);
            setEditingMembro(null);
          }}
          isLoading={isLoading}
          step={membroFormStep}
          membroId={editingMembro?.id}
        />
      )}

      {/* Upload Comprovante Modal */}
      {showUploadModal && selectedPagamento && (
        <UploadComprovanteModal
          pagamento={selectedPagamento}
          onUpload={handleUploadSubmit}
          onClose={() => {
            setShowUploadModal(false);
            setSelectedPagamento(null);
          }}
          isLoading={isLoading}
        />
      )}

      {/* Visualizar Comprovante Modal */}
      {showVisualizarModal && selectedPagamento && (
        <VisualizarComprovanteModal
          pagamento={selectedPagamento}
          onClose={() => {
            setShowVisualizarModal(false);
            setSelectedPagamento(null);
          }}
        />
      )}

      {/* Documento Form Modal */}
      {showDocumentoForm && (
        <DocumentoForm
          onSubmit={handleCreateDocumento}
          onCancel={() => setShowDocumentoForm(false)}
          isLoading={isLoading}
        />
      )}

      {/* Visualizar Documento Modal */}
      {showVisualizarDocumento && selectedDocumento && (
        <VisualizarDocumentoModal
          documento={selectedDocumento}
          onClose={() => {
            setShowVisualizarDocumento(false);
            setSelectedDocumento(null);
          }}
        />
      )}

      {/* Sorteio Interface Modal */}
      {showSorteioInterface && (
        <SorteioInterface
          grupos={grupos}
          onClose={() => setShowSorteioInterface(false)}
        />
      )}
    </div>
  );
}

export default App;