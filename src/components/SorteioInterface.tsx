import React, { useState, useEffect } from 'react';
import { X, Globe, Trophy, Users, Calendar, ArrowLeft, RotateCcw, AlertCircle } from 'lucide-react';
import { GrupoConsorcio } from '../types/grupo';
import { SorteioData, CreateSorteioData } from '../types/sorteio';
import { CotaParticipante } from '../types/membro';
import { SorteioService } from '../services/sorteioService';
import { MembroService } from '../services/membroService';
import { CartellaBingo } from './CartellaBingo';
import { AnimacaoSorteio } from './AnimacaoSorteio';

interface SorteioInterfaceProps {
  grupos: GrupoConsorcio[];
  onClose: () => void;
}

type EtapaSorteio = 'preparacao' | 'etapa1' | 'etapa2' | 'etapa3' | 'confirmacao';

export function SorteioInterface({ grupos, onClose }: SorteioInterfaceProps) {
  const [etapaAtual, setEtapaAtual] = useState<EtapaSorteio>('preparacao');
  const [grupoSelecionado, setGrupoSelecionado] = useState<string>('');
  const [sorteioAtual, setSorteioAtual] = useState<SorteioData | null>(null);
  const [cotasParticipantes, setCotasParticipantes] = useState<CotaParticipante[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sorteando, setSorteando] = useState(false);
  const [animacaoAtiva, setAnimacaoAtiva] = useState(false);
  const [numeroSorteado, setNumeroSorteado] = useState<number | null>(null);
  const [cotaGanhadora, setCotaGanhadora] = useState<any>(null);
  const [membroGanhador, setMembroGanhador] = useState<any>(null);
  const [mostrarResultado, setMostrarResultado] = useState<'numero_apenas' | 'completo' | null>(null);
  const [desabilitarBotao, setDesabilitarBotao] = useState(false);
  
  // Estados para dados da assembleia
  const [dataAssembleia, setDataAssembleia] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numeroAssembleia, setNumeroAssembleia] = useState<string>('');

  useEffect(() => {
    if (grupoSelecionado) {
      carregarCotasParticipantes();
    }
  }, [grupoSelecionado]);

  const carregarCotasParticipantes = async () => {
    try {
      const cotas = await MembroService.getCotasParticipantes(grupoSelecionado);
      setCotasParticipantes(cotas);
    } catch (error) {
      console.error('Erro ao carregar cotas:', error);
    }
  };

  const iniciarSorteio = async () => {
    if (!grupoSelecionado || cotasParticipantes.length === 0) return;

    setIsLoading(true);
    try {
      const grupo = grupos.find(g => g.id === grupoSelecionado);
      if (!grupo) return;

      const createData: CreateSorteioData = {
        grupoId: grupoSelecionado,
        nomeGrupo: grupo.nome_grupo,
        cotasParticipantes
      };

      const novoSorteio = await SorteioService.create(createData);
      setSorteioAtual(novoSorteio);
      setEtapaAtual('etapa1');
    } catch (error) {
      console.error('Erro ao iniciar sorteio:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validarAntesSorteio = (): boolean => {
    if (!grupoSelecionado) {
      alert("Selecione um grupo para sortear");
      return false;
    }
    
    if (!dataAssembleia || !numeroAssembleia) {
      alert("Preencha os dados da assembleia");
      return false;
    }
    
    if (cotasParticipantes.length === 0) {
      alert("Não há cotas disponíveis para sorteio neste grupo");
      return false;
    }
    
    return true;
  };

  const sortearNumero = (numerosDisponiveis: number[]): number => {
    return numerosDisponiveis[Math.floor(Math.random() * numerosDisponiveis.length)];
  };

  const executarEtapa1 = () => {
    if (!validarAntesSorteio()) return;
    
    setDesabilitarBotao(true);
    setSorteando(true);
    setAnimacaoAtiva(true);
    setNumeroSorteado(null);
    
    setTimeout(() => {
      const numerosDisponiveis = cotasParticipantes
        .filter(c => c.status === 'participando')
        .map(c => parseInt(c.numero));
      
      const numeroSorteadoAtual = sortearNumero(numerosDisponiveis);
      setNumeroSorteado(numeroSorteadoAtual);
      setMostrarResultado('numero_apenas');
      setAnimacaoAtiva(false);
      setEtapaAtual('etapa2');
      setDesabilitarBotao(false);
      setSorteando(false);
    }, 3000);
  };

  const executarEtapa2 = () => {
    setDesabilitarBotao(true);
    setSorteando(true);
    setAnimacaoAtiva(true);
    setNumeroSorteado(null);
    
    setTimeout(() => {
      const numerosDisponiveis = cotasParticipantes
        .filter(c => c.status === 'participando')
        .map(c => parseInt(c.numero));
      
      const numeroSorteadoAtual = sortearNumero(numerosDisponiveis);
      setNumeroSorteado(numeroSorteadoAtual);
      setMostrarResultado('numero_apenas');
      setAnimacaoAtiva(false);
      setEtapaAtual('etapa3');
      setDesabilitarBotao(false);
      setSorteando(false);
    }, 3000);
  };

  const executarEtapa3 = () => {
    setDesabilitarBotao(true);
    setSorteando(true);
    setAnimacaoAtiva(true);
    setNumeroSorteado(null);
    
    setTimeout(() => {
      const numerosDisponiveis = cotasParticipantes
        .filter(c => c.status === 'participando')
        .map(c => parseInt(c.numero));
      
      const numeroSorteadoAtual = sortearNumero(numerosDisponiveis);
      
      // Buscar cota ganhadora
      const cotaGanhadouraEncontrada = cotasParticipantes.find(
        cota => parseInt(cota.numero) === numeroSorteadoAtual
      );
      
      setNumeroSorteado(numeroSorteadoAtual);
      setCotaGanhadora(cotaGanhadouraEncontrada);
      setMembroGanhador({
        id: cotaGanhadouraEncontrada?.membroId,
        nomeCompleto: cotaGanhadouraEncontrada?.nomeMembro
      });
      setMostrarResultado('completo');
      setAnimacaoAtiva(false);
      setEtapaAtual('confirmacao');
      setDesabilitarBotao(false);
      setSorteando(false);
    }, 5000);
  };

  const executarProximaEtapa = () => {
    switch(etapaAtual) {
      case 'preparacao':
      case 'etapa1':
        executarEtapa1();
        break;
      case 'etapa2':
        executarEtapa2();
        break;
      case 'etapa3':
        executarEtapa3();
        break;
    }
  };

  const confirmarResultado = async () => {
    if (!sorteioAtual || !cotaGanhadora || !membroGanhador) return;

    setIsLoading(true);
    try {
      // Salvar resultado no banco de dados
      await SorteioService.confirmarResultado(sorteioAtual.id);
      
      // Resetar sistema
      resetarSorteio();
      
      alert("Resultado salvo com sucesso! Sistema pronto para novo sorteio.");
      onClose();
    } catch (error) {
      console.error('Erro ao confirmar resultado:', error);
      alert('Erro ao salvar resultado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetarSorteio = () => {
    setEtapaAtual('preparacao');
    setNumeroSorteado(null);
    setCotaGanhadora(null);
    setMembroGanhador(null);
    setMostrarResultado(null);
    setAnimacaoAtiva(false);
    setSorteando(false);
    setDesabilitarBotao(false);
    setGrupoSelecionado('');
    setCotasParticipantes([]);
    setSorteioAtual(null);
    setDataAssembleia(new Date().toISOString().split('T')[0]);
    setNumeroAssembleia('');
  };

  const renderizarBotaoSorteio = () => {
    if (sorteando) {
      return (
        <button disabled className="bg-gray-400 text-white px-8 py-4 rounded-lg text-xl font-semibold cursor-not-allowed">
          SORTEANDO...
        </button>
      );
    }
    
    if (etapaAtual === 'confirmacao') {
      return null;
    }
    
    if (etapaAtual === 'preparacao' && !grupoSelecionado) {
      return (
        <button disabled className="bg-gray-400 text-white px-8 py-4 rounded-lg text-xl font-semibold cursor-not-allowed">
          Selecione um Grupo
        </button>
      );
    }
    
    return (
      <button 
        onClick={executarProximaEtapa}
        disabled={desabilitarBotao}
        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-xl font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        🎲 INICIAR SORTEIO
      </button>
    );
  };

  const getProgressoEtapa = () => {
    switch(etapaAtual) {
      case 'preparacao': return { texto: 'Aguardando', progresso: 0 };
      case 'etapa1': return { texto: '1º Teste', progresso: 25 };
      case 'etapa2': return { texto: '2º Teste', progresso: 50 };
      case 'etapa3': return { texto: 'Sorteio Oficial', progresso: 75 };
      case 'confirmacao': return { texto: 'Confirmação', progresso: 100 };
      default: return { texto: 'Aguardando', progresso: 0 };
    }
  };

  const voltarEtapa = () => {
    switch (etapaAtual) {
      case 'etapa1':
        setEtapaAtual('preparacao');
        break;
      case 'etapa2':
        setEtapaAtual('etapa1');
        break;
      case 'etapa3':
        setEtapaAtual('etapa2');
        break;
      case 'confirmacao':
        setEtapaAtual('etapa3');
        break;
    }
    setNumeroSorteado(null);
    setMostrarResultado(null);
  };

  const getTextoEtapa = () => {
    switch (etapaAtual) {
      case 'etapa1':
        return '1º SORTEIO TESTE';
      case 'etapa2':
        return '2º SORTEIO TESTE';
      case 'etapa3':
        return 'SORTEIO OFICIAL';
      default:
        return '';
    }
  };

  const getCorResultado = () => {
    switch (etapaAtual) {
      case 'etapa1':
        return 'bg-blue-50 border-blue-200 text-blue-600';
      case 'etapa2':
        return 'bg-yellow-50 border-yellow-200 text-yellow-600';
      case 'etapa3':
        return 'bg-green-50 border-green-200 text-green-600';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full h-full md:max-w-7xl md:w-full md:max-h-[95vh] md:h-auto overflow-y-auto">
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2 md:space-x-4">
            {etapaAtual !== 'preparacao' && (
              <button
                onClick={voltarEtapa}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
              >
                <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            )}
            <div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">Sistema de Sorteio</h2>
              {sorteioAtual && (
                <p className="text-sm md:text-base text-gray-600 truncate">{sorteioAtual.nomeGrupo}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors touch-manipulation"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          {/* Etapa de Preparação */}
          {etapaAtual === 'preparacao' && (
            <div className="space-y-4 md:space-y-6">
              <div className="text-center">
                <Globe className="w-12 h-12 md:w-16 md:h-16 text-gold-500 mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Preparação do Sorteio</h3>
                <p className="text-sm md:text-base text-gray-600 px-4">Selecione o grupo e configure o sorteio</p>
              </div>

              {/* Dados da Assembleia */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-blue-500" />
                  Dados da Assembleia
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Data da Assembleia *</label>
                    <input 
                      type="date" 
                      value={dataAssembleia}
                      onChange={(e) => setDataAssembleia(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Número da Assembleia *</label>
                    <input 
                      type="text" 
                      value={numeroAssembleia}
                      onChange={(e) => setNumeroAssembleia(e.target.value)}
                      placeholder="Ex: 001/2024"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="max-w-full md:max-w-md mx-auto">
                <label className="block text-sm md:text-base font-medium text-gray-700 mb-2">
                  Selecionar Grupo *
                </label>
                <select
                  value={grupoSelecionado}
                  onChange={(e) => setGrupoSelecionado(e.target.value)}
                  className="w-full px-3 py-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                >
                  <option value="">Selecione um grupo</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome_grupo} - {grupo.nome_bem}
                    </option>
                  ))}
                </select>
              </div>

              {cotasParticipantes.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm md:text-base font-medium text-gray-900 flex items-center">
                      <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                      Cotas Participantes
                    </h4>
                    <span className="text-xs md:text-sm text-gray-600">
                      {cotasParticipantes.length} cotas ativas
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-32 md:max-h-40 overflow-y-auto">
                    {cotasParticipantes.map((cota, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-xs md:text-sm">
                        <div className="font-medium text-xs md:text-sm">Cota {cota.numero}</div>
                        <div className="text-gray-600 truncate text-xs">{cota.nomeMembro}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Indicador de Progresso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progresso do Sorteio:</span>
                  <span className="text-sm font-medium">{progresso.texto}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso.progresso}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                {renderizarBotaoSorteio()}
              </div>
            </div>
          )}

          {/* Etapas de Sorteio */}
          {(etapaAtual === 'etapa1' || etapaAtual === 'etapa2' || etapaAtual === 'etapa3') && (
            <div className="space-y-4 md:space-y-6">
              {/* Indicador de Progresso */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progresso do Sorteio:</span>
                  <span className="text-sm font-medium">{progresso.texto}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresso.progresso}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-center">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                  {etapaAtual === 'etapa1' ? '1º SORTEIO TESTE' :
                   etapaAtual === 'etapa2' ? '2º SORTEIO TESTE' :
                   'SORTEIO OFICIAL'}
                </h3>
                <div className="flex items-center justify-center text-sm md:text-base text-gray-600 mb-4">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  {sorteioAtual && new Date(sorteioAtual.dataHora).toLocaleString('pt-BR')}
                </div>
              </div>

              {/* Cartela do Bingo */}
              <CartellaBingo 
                cotasParticipantes={cotasParticipantes}
                numeroSorteado={numeroSorteado}
              />

              {/* Animação do Sorteio */}
              {animacaoAtiva && (
                <AnimacaoSorteio etapa={etapaAtual === 'etapa1' ? 1 : etapaAtual === 'etapa2' ? 2 : 3} />
              )}

              {/* Resultado do Sorteio */}
              {numeroSorteado && !animacaoAtiva && mostrarResultado === 'numero_apenas' && (
                <div className={`text-center p-6 rounded-lg ${
                  etapaAtual === 'etapa1' ? 'bg-blue-50 border border-blue-200' :
                  etapaAtual === 'etapa2' ? 'bg-yellow-50 border border-yellow-200' :
                  'bg-green-50 border border-green-200'
                }`}>
                  <h3 className="text-lg font-semibold mb-2">
                    {etapaAtual === 'etapa1' ? '1º SORTEIO TESTE' :
                     etapaAtual === 'etapa2' ? '2º SORTEIO TESTE' :
                     'SORTEIO OFICIAL'}
                  </h3>
                  <div className={`text-4xl font-bold mb-2 ${
                    etapaAtual === 'etapa1' ? 'text-blue-600' :
                    etapaAtual === 'etapa2' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {numeroSorteado}
                  </div>
                </div>
              )}

              {/* Botão de Ação */}
              {!animacaoAtiva && !mostrarResultado && (
                <div className="text-center">
                  {renderizarBotaoSorteio()}
                </div>
              )}

              {/* Botão Continuar após resultado */}
              {numeroSorteado && !animacaoAtiva && mostrarResultado === 'numero_apenas' && etapaAtual !== 'etapa3' && (
                <div className="text-center">
                  {renderizarBotaoSorteio()}
                </div>
              )}
            </div>
          )}

          {/* Modal de Confirmação */}
          {etapaAtual === 'confirmacao' && mostrarResultado === 'completo' && cotaGanhadora && membroGanhador && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  COTA CONTEMPLADA!
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-gray-600">NÚMERO SORTEADO:</p>
                    <p className="text-4xl font-bold text-blue-600">{numeroSorteado}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">COTA:</p>
                    <p className="text-2xl font-bold">{cotaGanhadora.numero.padStart(3, '0')}</p>
                  </div>
                  
                  <div>
                    <p className="text-gray-600">GANHADOR:</p>
                    <p className="text-xl font-bold text-green-600 break-words">
                      🎉 {membroGanhador.nomeCompleto?.toUpperCase()} 🎉
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <button 
                    onClick={confirmarResultado}
                    disabled={isLoading}
                    className="w-full bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Salvando...' : 'Confirmar Resultado'}
                  </button>
                  
                  <button 
                    onClick={() => {
                      setEtapaAtual('etapa3');
                      setMostrarResultado(null);
                      setNumeroSorteado(null);
                      setCotaGanhadora(null);
                      setMembroGanhador(null);
                    }}
                    className="w-full bg-gray-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    Refazer Sorteio Oficial
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}