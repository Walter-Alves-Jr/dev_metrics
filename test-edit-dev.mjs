// Script para testar fluxo de edição de desenvolvedor
import fs from 'fs';

// Simular localStorage
const mockStorage = {};

function setItem(key, value) {
  mockStorage[key] = value;
  console.log(`✓ localStorage.setItem("${key}", ...)`);
}

function getItem(key) {
  const value = mockStorage[key];
  console.log(`✓ localStorage.getItem("${key}") = ${value ? value.substring(0, 50) + '...' : 'null'}`);
  return value;
}

// Copiar funções do integratedMetrics
function loadDevelopers() {
  const data = getItem("dev_metrics_developers");
  if (!data) return [];
  
  const developers = JSON.parse(data);
  return developers.map((d) => ({
    ...d,
    baseSalary: Number(d.baseSalary ?? 0) || 0,
    monthlyCosts: Array.isArray(d.monthlyCosts) ? d.monthlyCosts.map((mc) => ({
      month: mc.month || new Date().toISOString().slice(0, 7),
      onCallHours: Number(mc.onCallHours ?? 0) || 0,
      overtimeHours: Number(mc.overtimeHours ?? 0) || 0,
    })) : [],
    products: Array.isArray(d.products) ? d.products : [],
  }));
}

function saveDevelopers(developers) {
  setItem("dev_metrics_developers", JSON.stringify(developers));
}

function updateDeveloper(devId, baseSalary) {
  console.log(`\n[updateDeveloper] Chamado com devId=${devId}, baseSalary=${baseSalary}`);
  const developers = loadDevelopers();
  console.log(`[updateDeveloper] Carregados ${developers.length} devs`);
  const dev = developers.find((d) => d.id === devId);
  console.log(`[updateDeveloper] Dev encontrado: ${dev ? dev.name : 'NÃO ENCONTRADO'}`);
  if (dev && baseSalary !== undefined && baseSalary > 0) {
    console.log(`[updateDeveloper] Atualizando ${dev.name} de R$ ${dev.baseSalary} para R$ ${baseSalary}`);
    dev.baseSalary = Number(baseSalary);
    saveDevelopers(developers);
    console.log(`[updateDeveloper] ✓ Salvo com sucesso`);
  } else {
    console.warn(`[updateDeveloper] ✗ Não foi possível atualizar: dev=${!!dev}, baseSalary=${baseSalary}`);
  }
}

// Teste
console.log("=== TESTE DE EDIÇÃO DE DESENVOLVEDOR ===\n");

// 1. Criar um desenvolvedor
console.log("1. Criando desenvolvedor inicial...");
const initialDev = {
  id: "123",
  name: "André",
  baseSalary: 9000,
  monthlyCosts: [],
  products: [],
};
setItem("dev_metrics_developers", JSON.stringify([initialDev]));

// 2. Carregar e verificar
console.log("\n2. Carregando desenvolvedor...");
let devs = loadDevelopers();
console.log(`   Desenvolvedor: ${devs[0].name}, Salário: R$ ${devs[0].baseSalary}`);

// 3. Editar
console.log("\n3. Editando desenvolvedor (André: 9000 → 10000)...");
updateDeveloper("123", 10000);

// 4. Recarregar e verificar
console.log("\n4. Recarregando desenvolvedor...");
devs = loadDevelopers();
console.log(`   Desenvolvedor: ${devs[0].name}, Salário: R$ ${devs[0].baseSalary}`);

if (devs[0].baseSalary === 10000) {
  console.log("\n✓ TESTE PASSOU: Salário foi atualizado corretamente!");
} else {
  console.log(`\n✗ TESTE FALHOU: Salário ainda é ${devs[0].baseSalary}, esperado 10000`);
}
