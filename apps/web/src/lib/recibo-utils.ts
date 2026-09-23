export type LinhaRecibo = {
  recibo_id: number | null;
  cliente_id: number;
  nome: string;
  valor: string;
  referente: string;
  observacao: string | null;
  data_emissao: string | null; // formato ISO: "AAAA-MM-DD"
  status: "gerado" | "pendente";
  impresso: boolean;
};

export const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function gerarOpcoesDeMes() {
  const hoje = new Date();
  const opcoes = [];
  for (let i = -2; i <= 2; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
    opcoes.push({ mes: d.getMonth() + 1, ano: d.getFullYear() });
  }
  return opcoes;
}

export function formatarMoeda(valor: string | number) {
  return Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function isoParaBR(iso: string | null): string {
  if (!iso) return "";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

export function brParaIso(br: string): string | null {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, dia, mes, ano] = m;
  return `${ano}-${mes}-${dia}`;
}

export function parseValorBR(valorStr: string): string {
  // remove "R$", espaços e pontos de milhar; troca vírgula decimal por ponto
  const somenteNumeros = valorStr.replace(/[^\d,]/g, "");
  return somenteNumeros.replace(",", ".");
}

// --- Valor por extenso ---
const UNIDADES = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
const DEZ_A_DEZENOVE = ["dez", "onze", "doze", "treze", "catorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
const DEZENAS = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const CENTENAS = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

function tresDigitosPorExtenso(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "cem";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const partes: string[] = [];
  if (c > 0) partes.push(CENTENAS[c]);
  if (resto > 0) {
    if (resto < 10) partes.push(UNIDADES[resto]);
    else if (resto < 20) partes.push(DEZ_A_DEZENOVE[resto - 10]);
    else {
      const d = Math.floor(resto / 10);
      const u = resto % 10;
      partes.push(u > 0 ? `${DEZENAS[d]} e ${UNIDADES[u]}` : DEZENAS[d]);
    }
  }
  return partes.join(" e ");
}

export function valorPorExtenso(valor: number): string {
  const reais = Math.floor(valor);
  const centavos = Math.round((valor - reais) * 100);

  let textoReais: string;
  if (reais === 0) {
    textoReais = "zero reais";
  } else if (reais === 1) {
    textoReais = "um real";
  } else {
    const milhar = Math.floor(reais / 1000);
    const resto = reais % 1000;
    const partes: string[] = [];
    if (milhar > 0) partes.push(milhar === 1 ? "mil" : `${tresDigitosPorExtenso(milhar)} mil`);
    if (resto > 0) partes.push(tresDigitosPorExtenso(resto));
    textoReais = partes.join(" e ") + " reais";
  }

  if (centavos === 0) return textoReais;
  const textoCentavos = centavos === 1 ? "um centavo" : `${tresDigitosPorExtenso(centavos)} centavos`;
  return `${textoReais} e ${textoCentavos}`;
}

export function dataPorExtenso(dataStr: string | null): string {
  if (!dataStr) return "";
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const d = new Date(dataStr + "T00:00:00");
  return `Boa Viagem, ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;
}

// --- API ---
export function apiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
}

export function authHeaders() {
  const token = localStorage.getItem("access_token");
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

export type Cliente = {
  id: number;
  nome: string;
  valor_mensal: string;
  dia_vencimento: number | null;
  referente_padrao: string;
  ativo: boolean;
};