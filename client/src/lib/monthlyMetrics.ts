import { BugTrackingItem } from "./bugTracking";
import { Developer } from "./storage";

export type MonthlyProjectMetrics = {
  projectId: string;
  projectTitle: string;
  projectType: "bug" | "projeto";
  developerId: string;
  developerName: string;
  horasOrcadas: number;
  horasReais: number;
  dataInicio: Date;
  dataFim: Date;
  diasTotais: number;
  diasUteis: number; // dias úteis no período (seg-sex)
  valorHora: number;
  valorTotal: number; // horas * valor hora
  custoDiario: number; // valor total / dias totais
  custoMensal: number; // custo diário * dias úteis
  eficiencia: number; // (horas reais / horas orçadas) * 100
};

export type MonthlyDeveloperMetrics = {
  developerId: string;
  developerName: string;
  salarioMensal: number;
  mes: number; // 1-12
  ano: number;
  projetos: MonthlyProjectMetrics[];
  custoProjetos: number; // soma dos custos mensais
  percentualSalario: number; // (custo projetos / salario) * 100
  diasUteis: number;
};

// Calcular dias úteis (seg-sex) entre duas datas
function calcularDiasUteis(dataInicio: Date, dataFim: Date): number {
  let diasUteis = 0;
  const data = new Date(dataInicio);

  while (data <= dataFim) {
    const dia = data.getDay();
    // 0 = domingo, 6 = sábado
    if (dia !== 0 && dia !== 6) {
      diasUteis++;
    }
    data.setDate(data.getDate() + 1);
  }

  return diasUteis;
}

// Calcular dias totais entre duas datas
function calcularDiasTotais(dataInicio: Date, dataFim: Date): number {
  const diffMs = dataFim.getTime() - dataInicio.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
}

// Obter dias úteis de um mês específico
function calcularDiasUteisDoMes(mes: number, ano: number): number {
  let diasUteis = 0;
  const ultimoDia = new Date(ano, mes, 0).getDate();

  for (let dia = 1; dia <= ultimoDia; dia++) {
    const data = new Date(ano, mes - 1, dia);
    const diaSemana = data.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) {
      diasUteis++;
    }
  }

  return diasUteis;
}

// Calcular métricas de um projeto para um mês específico
export function calcularMetricasProjetoMensal(
  item: BugTrackingItem,
  developer: Developer,
  valorHora: number,
  mes: number,
  ano: number
): MonthlyProjectMetrics | null {
  const dataInicio = new Date(item.dataInicio);
  const dataFim = new Date(item.targetPRD || item.dataInicio);

  // Verificar se o projeto está no mês solicitado
  const mesInicio = dataInicio.getMonth() + 1;
  const anoInicio = dataInicio.getFullYear();
  const mesFim = dataFim.getMonth() + 1;
  const anoFim = dataFim.getFullYear();

  // Se o projeto não está no mês, retornar null
  if (
    (anoInicio > ano || (anoInicio === ano && mesInicio > mes)) &&
    (anoFim < ano || (anoFim === ano && mesFim < mes))
  ) {
    return null;
  }

  // Ajustar datas para o mês solicitado
  let dataInicioMes = dataInicio;
  let dataFimMes = dataFim;

  // Se o projeto começou antes do mês, começar no primeiro dia do mês
  if (anoInicio < ano || (anoInicio === ano && mesInicio < mes)) {
    dataInicioMes = new Date(ano, mes - 1, 1);
  }

  // Se o projeto termina depois do mês, terminar no último dia do mês
  const ultimoDiaDoMes = new Date(ano, mes, 0).getDate();
  if (anoFim > ano || (anoFim === ano && mesFim > mes)) {
    dataFimMes = new Date(ano, mes - 1, ultimoDiaDoMes);
  }

  const horasOrcadas = item.horasOrcadas || 0;
  const horasReais = item.horasReais || horasOrcadas;
  const diasTotais = calcularDiasTotais(dataInicioMes, dataFimMes);
  const diasUteis = calcularDiasUteis(dataInicioMes, dataFimMes);

  const valorTotal = horasOrcadas * valorHora;
  const custoDiario = valorTotal / diasTotais;
  const custoMensal = custoDiario * diasUteis;
  const eficiencia = horasOrcadas > 0 ? (horasReais / horasOrcadas) * 100 : 0;

  return {
    projectId: item.id,
    projectTitle: item.title,
    projectType: item.type,
    developerId: developer.id,
    developerName: developer.name,
    horasOrcadas,
    horasReais,
    dataInicio: dataInicioMes,
    dataFim: dataFimMes,
    diasTotais,
    diasUteis,
    valorHora,
    valorTotal,
    custoDiario,
    custoMensal,
    eficiencia,
  };
}

// Calcular métricas mensais de um desenvolvedor
export function calcularMetricasDesenvolvedorMensal(
  developer: Developer,
  projetos: BugTrackingItem[],
  valorHora: number,
  mes: number,
  ano: number
): MonthlyDeveloperMetrics {
  const projetosDoMes: MonthlyProjectMetrics[] = [];
  let custoProjetos = 0;

  for (const projeto of projetos) {
    if (projeto.developerId === developer.id) {
      const metricas = calcularMetricasProjetoMensal(
        projeto,
        developer,
        valorHora,
        mes,
        ano
      );
      if (metricas) {
        projetosDoMes.push(metricas);
        custoProjetos += metricas.custoMensal;
      }
    }
  }

  const diasUteis = calcularDiasUteisDoMes(mes, ano);
  const percentualSalario = (custoProjetos / developer.monthlyCost) * 100;

  return {
    developerId: developer.id,
    developerName: developer.name,
    salarioMensal: developer.monthlyCost,
    mes,
    ano,
    projetos: projetosDoMes,
    custoProjetos,
    percentualSalario,
    diasUteis,
  };
}
