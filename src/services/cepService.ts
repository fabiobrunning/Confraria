export interface EnderecoViaCEP {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  gia: string;
  ddd: string;
  siafi: string;
  erro?: boolean;
}

export class CEPService {
  private static readonly VIACEP_URL = 'https://viacep.com.br/ws';

  static async buscarCEP(cep: string): Promise<EnderecoViaCEP | null> {
    try {
      // Remove caracteres não numéricos do CEP
      const cepLimpo = cep.replace(/\D/g, '');
      
      // Valida se o CEP tem 8 dígitos
      if (cepLimpo.length !== 8) {
        throw new Error('CEP deve ter 8 dígitos');
      }

      // Faz a requisição para a API ViaCEP
      const response = await fetch(`${this.VIACEP_URL}/${cepLimpo}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao consultar CEP');
      }

      const data: EnderecoViaCEP = await response.json();
      
      // Verifica se o CEP foi encontrado
      if (data.erro) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  }

  static formatarCEP(cep: string): string {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.replace(/(\d{5})(\d{3})/, '$1-$2');
  }

  static validarCEP(cep: string): boolean {
    const cepLimpo = cep.replace(/\D/g, '');
    return cepLimpo.length === 8 && /^\d{8}$/.test(cepLimpo);
  }
}