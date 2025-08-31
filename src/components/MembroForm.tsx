import React, { useState, useEffect } from 'react';
import { X, Save, User, Phone, FileText, Building, MapPin, Plus, Trash2, Search } from 'lucide-react';
import { PreCadastroData, CadastroCompletoData, Endereco, Empresa, CotaConsorcio } from '../types/membro';
import { GrupoConsorcio } from '../types/grupo';
import { GrupoService } from '../services/grupoService';
import { CEPService } from '../services/cepService';

interface MembroFormProps {
  onSubmitPreCadastro: (data: PreCadastroData) => void;
  onSubmitCadastroCompleto: (data: CadastroCompletoData) => void;
  onCancel: () => void;
  isLoading?: boolean;
  step?: 1 | 2;
  membroId?: string;
}

export function MembroForm({ 
  onSubmitPreCadastro, 
  onSubmitCadastroCompleto, 
  onCancel, 
  isLoading, 
  step = 1,
  membroId 
}: MembroFormProps) {
  const [currentStep, setCurrentStep] = useState(step);
  const [grupos, setGrupos] = useState<GrupoConsorcio[]>([]);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [erroCEP, setErroCEP] = useState<string>('');
  
  // Dados do pré-cadastro
  const [preCadastroData, setPreCadastroData] = useState<PreCadastroData>({
    nome: '',
    telefone: ''
  });

  // Dados do cadastro completo
  const [cadastroCompleto, setCadastroCompleto] = useState<CadastroCompletoData>({
    nome_completo: '',
    cpf: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: ''
    },
    empresas: [{
      nome_empresa: '',
      ramo_atuacao: '',
      telefone_contato: ''
    }],
    cotas: []
  });

  useEffect(() => {
    loadGrupos();
  }, []);

  const loadGrupos = async () => {
    try {
      const data = await GrupoService.getAll();
      setGrupos(data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const handlePreCadastroSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitPreCadastro(preCadastroData);
    if (!membroId) {
      setCurrentStep(2);
    }
  };

  const handleCadastroCompletoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitCadastroCompleto(cadastroCompleto);
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const buscarCEP = async (cep: string) => {
    if (!CEPService.validarCEP(cep)) {
      setErroCEP('CEP inválido');
      return;
    }

    setBuscandoCEP(true);
    setErroCEP('');

    try {
      const endereco = await CEPService.buscarCEP(cep);
      if (endereco === null) {
        setErroCEP('CEP não encontrado');
      } else if (endereco) {
        setCadastroCompleto(prev => ({
          ...prev,
          endereco: {
            ...prev.endereco,
            cep: CEPService.formatarCEP(endereco.cep),
            rua: endereco.logradouro,
            bairro: endereco.bairro,
            cidade: endereco.localidade,
            estado: endereco.uf,
            // Mantém número e complemento que o usuário já digitou
            numero: prev.endereco.numero,
            complemento: prev.endereco.complemento
          }
        }));
      }
    } catch (error) {
      setErroCEP(error instanceof Error ? error.message : 'Erro ao buscar CEP');
    } finally {
      setBuscandoCEP(false);
    }
  };

  const handleCEPChange = (cep: string) => {
    const cepFormatado = formatCEP(cep);
    setCadastroCompleto(prev => ({
      ...prev,
      endereco: { ...prev.endereco, cep: cepFormatado }
    }));

    // Busca automaticamente quando CEP estiver completo
    if (CEPService.validarCEP(cep)) {
      buscarCEP(cep);
    } else {
      setErroCEP('');
    }
  };

  const addEmpresa = () => {
    setCadastroCompleto(prev => ({
      ...prev,
      empresas: [...prev.empresas, {
        nome_empresa: '',
        ramo_atuacao: '',
        telefone_contato: ''
      }]
    }));
  };

  const removeEmpresa = (index: number) => {
    setCadastroCompleto(prev => ({
      ...prev,
      empresas: prev.empresas.filter((_, i) => i !== index)
    }));
  };

  const addCota = () => {
    setCadastroCompleto(prev => ({
      ...prev,
      cotas: [...prev.cotas, {
        grupo_id: '',
        numero_cota: '',
        status_cota: 'ATIVA'
      }]
    }));
  };

  const removeCota = (index: number) => {
    setCadastroCompleto(prev => ({
      ...prev,
      cotas: prev.cotas.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 1 ? 'Pré-cadastro de Membro' : 'Cadastro Completo'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Etapa {currentStep} de 2
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Indicador de progresso */}
        <div className="px-6 py-4 bg-gray-50">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 1 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`flex-1 h-1 mx-4 ${
              currentStep >= 2 ? 'bg-yellow-500' : 'bg-gray-300'
            }`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep >= 2 ? 'bg-yellow-500 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={currentStep >= 1 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
              Dados Básicos
            </span>
            <span className={currentStep >= 2 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
              Informações Completas
            </span>
          </div>
        </div>

        {/* Etapa 1: Pré-cadastro */}
        {currentStep === 1 && (
          <form onSubmit={handlePreCadastroSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Nome *
                </label>
                <input
                  type="text"
                  value={preCadastroData.nome}
                  onChange={(e) => setPreCadastroData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                  placeholder="Ex: João Silva"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone *
                </label>
                <input
                  type="text"
                  value={preCadastroData.telefone}
                  onChange={(e) => setPreCadastroData(prev => ({ 
                    ...prev, 
                    telefone: formatTelefone(e.target.value) 
                  }))}
                  required
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Continuar'}
              </button>
            </div>
          </form>
        )}

        {/* Etapa 2: Cadastro Completo */}
        {currentStep === 2 && (
          <form onSubmit={handleCadastroCompletoSubmit} className="p-6 space-y-8">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={cadastroCompleto.nome_completo}
                    onChange={(e) => setCadastroCompleto(prev => ({ 
                      ...prev, 
                      nome_completo: e.target.value 
                    }))}
                    required
                    placeholder="Nome completo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CPF *
                  </label>
                  <input
                    type="text"
                    value={cadastroCompleto.cpf}
                    onChange={(e) => setCadastroCompleto(prev => ({ 
                      ...prev, 
                      cpf: formatCPF(e.target.value) 
                    }))}
                    required
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Endereço
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CEP *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cadastroCompleto.endereco.cep}
                      onChange={(e) => handleCEPChange(e.target.value)}
                      required
                      placeholder="00000-000"
                      maxLength={9}
                      className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 ${
                        erroCEP ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {buscandoCEP ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      ) : (
                        <Search className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {erroCEP && (
                    <p className="mt-1 text-sm text-red-600">{erroCEP}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rua *
                  </label>
                  <input
                    type="text"
                    value={cadastroCompleto.endereco.rua}
                    onChange={(e) => setCadastroCompleto(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, rua: e.target.value }
                    }))}
                    required
                    placeholder="Nome da rua"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-gray-50"
                    readOnly={buscandoCEP}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
                  <input
                    type="text"
                    value={cadastroCompleto.endereco.numero}
                    onChange={(e) => setCadastroCompleto(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, numero: e.target.value }
                    }))}
                    required
                    placeholder="123"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                  <input
                    type="text"
                    value={cadastroCompleto.endereco.complemento}
                    onChange={(e) => setCadastroCompleto(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, complemento: e.target.value }
                    }))}
                    placeholder="Apto, sala, etc."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={cadastroCompleto.endereco.bairro}
                    onChange={(e) => setCadastroCompleto(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, bairro: e.target.value }
                    }))}
                    required
                    placeholder="Nome do bairro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-gray-50"
                    readOnly={buscandoCEP}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={cadastroCompleto.endereco.cidade}
                    onChange={(e) => setCadastroCompleto(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, cidade: e.target.value }
                    }))}
                    required
                    placeholder="Nome da cidade"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-gray-50"
                    readOnly={buscandoCEP}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado *
                  </label>
                  <select
                    value={cadastroCompleto.endereco.estado}
                    onChange={(e) => setCadastroCompleto(prev => ({
                      ...prev,
                      endereco: { ...prev.endereco, estado: e.target.value }
                    }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 bg-gray-50"
                    disabled={buscandoCEP}
                  >
                    <option value="">Selecione</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empresas */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Empresas
                </h3>
                <button
                  type="button"
                  onClick={addEmpresa}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </button>
              </div>

              {cadastroCompleto.empresas.map((empresa, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Empresa {index + 1}</h4>
                    {cadastroCompleto.empresas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmpresa(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        value={empresa.nome_empresa}
                        onChange={(e) => {
                          const newEmpresas = [...cadastroCompleto.empresas];
                          newEmpresas[index].nome_empresa = e.target.value;
                          setCadastroCompleto(prev => ({ ...prev, empresas: newEmpresas }));
                        }}
                        required
                        placeholder="Nome da empresa"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ramo de Atuação *
                      </label>
                      <input
                        type="text"
                        value={empresa.ramo_atuacao}
                        onChange={(e) => {
                          const newEmpresas = [...cadastroCompleto.empresas];
                          newEmpresas[index].ramo_atuacao = e.target.value;
                          setCadastroCompleto(prev => ({ ...prev, empresas: newEmpresas }));
                        }}
                        required
                        placeholder="Ex: Comércio, Serviços"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone de Contato *
                      </label>
                      <input
                        type="text"
                        value={empresa.telefone_contato}
                        onChange={(e) => {
                          const newEmpresas = [...cadastroCompleto.empresas];
                          newEmpresas[index].telefone_contato = formatTelefone(e.target.value);
                          setCadastroCompleto(prev => ({ ...prev, empresas: newEmpresas }));
                        }}
                        required
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cotas de Consórcio */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Cotas de Consórcio
                </h3>
                <button
                  type="button"
                  onClick={addCota}
                  className="inline-flex items-center px-3 py-1 text-sm bg-gold-500 text-white rounded-md hover:bg-gold-600 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </button>
              </div>

              {cadastroCompleto.cotas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma cota adicionada ainda</p>
                  <p className="text-sm">Clique em "Adicionar" para incluir uma cota</p>
                </div>
              ) : (
                cadastroCompleto.cotas.map((cota, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Cota {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeCota(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grupo *
                        </label>
                        <select
                          value={cota.grupo_id}
                          onChange={(e) => {
                            const newCotas = [...cadastroCompleto.cotas];
                            newCotas[index].grupo_id = e.target.value;
                            setCadastroCompleto(prev => ({ ...prev, cotas: newCotas }));
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        >
                          <option value="">Selecione um grupo</option>
                          {grupos.map(grupo => (
                            <option key={grupo.id} value={grupo.id}>
                              {grupo.nome} - {grupo.tipo}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número da Cota *
                        </label>
                        <input
                          type="text"
                          value={cota.numero_cota}
                          onChange={(e) => {
                            const newCotas = [...cadastroCompleto.cotas];
                            newCotas[index].numero_cota = e.target.value;
                            setCadastroCompleto(prev => ({ ...prev, cotas: newCotas }));
                          }}
                          required
                          placeholder="Ex: 001, 002"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status *
                        </label>
                        <select
                          value={cota.status_cota}
                          onChange={(e) => {
                            const newCotas = [...cadastroCompleto.cotas];
                            newCotas[index].status_cota = e.target.value as 'ATIVA' | 'CONTEMPLADA' | 'CANCELADA';
                            setCadastroCompleto(prev => ({ ...prev, cotas: newCotas }));
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500"
                        >
                          <option value="ATIVA">Ativa</option>
                          <option value="CONTEMPLADA">Contemplada</option>
                          <option value="CANCELADA">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 bg-gold-500 text-white rounded-md hover:bg-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Salvando...' : 'Finalizar Cadastro'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}