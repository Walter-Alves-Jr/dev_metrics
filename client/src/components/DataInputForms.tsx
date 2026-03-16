import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  addDeveloper,
  addProduct,
  addProject,
  addBug,
  addDeployment,
  addIncident,
  loadDevelopers,
  loadProducts,
  updateDeveloper,
  updateMonthlyCost,
  calculateDevCostPerHour,
} from "@/lib/integratedMetrics";
import { toast } from "sonner";

type DataInputFormsProps = {
  onDataAdded?: () => void;
};

export default function DataInputForms({ onDataAdded }: DataInputFormsProps) {
  const [activeTab, setActiveTab] = useState<
    "developer" | "product" | "project" | "bug" | "deployment" | "incident"
  >("developer");

  // Developer Form
  const [devName, setDevName] = useState("");
  const [devBaseSalary, setDevBaseSalary] = useState("");
  const [devOnCall, setDevOnCall] = useState("");
  const [devOvertimeHours, setDevOvertimeHours] = useState("");
  const [realDevCost, setRealDevCost] = useState(0);

  // Edit Developer State
  const [editingDevId, setEditingDevId] = useState<string | null>(null);
  const [editBaseSalary, setEditBaseSalary] = useState("");
  const [editMonth, setEditMonth] = useState(new Date().toISOString().slice(0, 7));
  const [editOnCallHours, setEditOnCallHours] = useState("");
  const [editOvertimeHours, setEditOvertimeHours] = useState("");

  const handleCalculateDevCost = () => {
    const baseSalary = parseFloat(devBaseSalary) || 0;
    const onCall = parseFloat(devOnCall) || 0;
    const overtimeHours = parseFloat(devOvertimeHours) || 0;
    const totalCost = (baseSalary + onCall + overtimeHours * 1.75) * 1.7;
    setRealDevCost(totalCost);
  };

  const handleAddDeveloper = () => {
    if (!devName || !devBaseSalary) {
      toast.error("Preencha nome e salário base");
      return;
    }
    addDeveloper(devName, parseFloat(devBaseSalary));
    toast.success("Desenvolvedor adicionado!");
    setDevName("");
    setDevBaseSalary("");
    setDevOnCall("");
    setDevOvertimeHours("");
    setRealDevCost(0);
    onDataAdded?.();
  };

  const handleStartEditDeveloper = (devId: string, baseSalary: number) => {
    setEditingDevId(devId);
    setEditBaseSalary(baseSalary.toString());
    setEditOnCallHours("");
    setEditOvertimeHours("");
  };

  const handleSaveEditDeveloper = () => {
    if (!editingDevId) return;

    try {
      // Sempre atualizar salário base se foi alterado
      const newSalary = parseFloat(editBaseSalary);
      console.log(`Tentando atualizar dev ${editingDevId} com salário: ${newSalary}`);
      if (!isNaN(newSalary) && newSalary > 0) {
        updateDeveloper(editingDevId, newSalary);
        console.log(`Dev ${editingDevId} atualizado com sucesso`);
      } else {
        console.warn(`Salário inválido: ${newSalary}`);
      }

      // Atualizar custos mensais se houver valores
      const onCallHours = parseFloat(editOnCallHours) || 0;
      const overtimeHours = parseFloat(editOvertimeHours) || 0;
      
      if (onCallHours > 0 || overtimeHours > 0) {
        updateMonthlyCost(
          editingDevId,
          editMonth,
          onCallHours,
          overtimeHours
        );
      }

      toast.success("Desenvolvedor atualizado!");
      
      // Limpar estado de edição
      setEditingDevId(null);
      setEditBaseSalary("");
      setEditOnCallHours("");
      setEditOvertimeHours("");
      
      // Forçar recarga de dados - IMPORTANTE: isso vai recarregar a lista
      console.log("Chamando onDataAdded para recarregar dados");
      onDataAdded?.();
    } catch (error) {
      toast.error("Erro ao atualizar desenvolvedor");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingDevId(null);
    setEditBaseSalary("");
    setEditOnCallHours("");
    setEditOvertimeHours("");
  };

  // Product Form
  const [productName, setProductName] = useState("");

  const handleAddProduct = () => {
    if (!productName) {
      toast.error("Preencha o nome do produto");
      return;
    }
    addProduct(productName);
    toast.success("Produto adicionado!");
    setProductName("");
    onDataAdded?.();
  };

  // Project Form
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDevId, setProjectDevId] = useState("");
  const [projectProductId, setProjectProductId] = useState("");
  const [projectType, setProjectType] = useState<"project" | "sustentation">(
    "project"
  );
  const [projectHours, setProjectHours] = useState("");
  const [projectValue, setProjectValue] = useState("");

  const developers = loadDevelopers();
  const products = loadProducts();

  const handleAddProject = () => {
    if (
      !projectTitle ||
      !projectDevId ||
      !projectProductId ||
      !projectHours ||
      !projectValue
    ) {
      toast.error("Preencha todos os campos");
      return;
    }
    addProject(
      projectTitle,
      projectDevId,
      projectProductId,
      projectType,
      parseFloat(projectHours),
      parseFloat(projectValue)
    );
    toast.success("Projeto adicionado!");
    setProjectTitle("");
    setProjectDevId("");
    setProjectProductId("");
    setProjectHours("");
    setProjectValue("");
    onDataAdded?.();
  };

  // Bug Form
  const [bugTitle, setBugTitle] = useState("");
  const [bugDevId, setBugDevId] = useState("");
  const [bugProductId, setBugProductId] = useState("");
  const [bugEnvironment, setBugEnvironment] = useState<
    "production" | "staging" | "development"
  >("production");
  const [bugSeverity, setBugSeverity] = useState<
    "critical" | "high" | "medium" | "low"
  >("high");

  const handleAddBug = () => {
    if (!bugTitle || !bugDevId || !bugProductId) {
      toast.error("Preencha todos os campos");
      return;
    }
    addBug(bugTitle, bugDevId, bugProductId, bugEnvironment, bugSeverity);
    toast.success("Bug adicionado!");
    setBugTitle("");
    setBugDevId("");
    setBugProductId("");
    onDataAdded?.();
  };

  // Deployment Form
  const [deploySuccess, setDeploySuccess] = useState(true);
  const [deployEnvironment, setDeployEnvironment] = useState<
    "staging" | "production"
  >("production");
  const [deployRollback, setDeployRollback] = useState(false);

  const handleAddDeployment = () => {
    addDeployment(deploySuccess, deployEnvironment, undefined, deployRollback);
    toast.success("Deploy registrado!");
    onDataAdded?.();
  };

  // Incident Form
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentSeverity, setIncidentSeverity] = useState<
    "critical" | "high" | "medium" | "low"
  >("high");
  const [incidentSLA, setIncidentSLA] = useState("4");

  const handleAddIncident = () => {
    if (!incidentTitle) {
      toast.error("Preencha o título do incidente");
      return;
    }
    addIncident(incidentTitle, incidentSeverity, parseFloat(incidentSLA));
    toast.success("Incidente adicionado!");
    setIncidentTitle("");
    onDataAdded?.();
  };

  // Normalizar dados de desenvolvedor para evitar erros de tipo
  const normalizedDevelopers = developers.map((dev) => {
    const baseSalary = typeof dev.baseSalary === "string" ? parseFloat(dev.baseSalary) : dev.baseSalary;
    // Remover log para evitar poluição de console
    return {
      ...dev,
      baseSalary,
    };
  });
  
  // Debug: verificar se developers foi carregado corretamente
  console.log(`DataInputForms renderizado com ${normalizedDevelopers.length} devs`);
  normalizedDevelopers.forEach(dev => {
    console.log(`  - ${dev.name}: R$ ${dev.baseSalary}`);
  });

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {[
          { id: "developer", label: "Desenvolvedor" },
          { id: "product", label: "Produto" },
          { id: "project", label: "Projeto" },
          { id: "bug", label: "Bug" },
          { id: "deployment", label: "Deploy" },
          { id: "incident", label: "Incidente" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() =>
              setActiveTab(
                tab.id as
                  | "developer"
                  | "product"
                  | "project"
                  | "bug"
                  | "deployment"
                  | "incident"
              )
            }
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Developer Form */}
      {activeTab === "developer" && (
        <div className="space-y-4 p-4 bg-gray-50 rounded">
          <div>
            <h3 className="font-semibold mb-3">Cadastrar Novo Desenvolvedor</h3>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Nome do desenvolvedor"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Salário base (R$)"
                value={devBaseSalary}
                onChange={(e) => setDevBaseSalary(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Sobreaviso (R$) - Opcional"
                value={devOnCall}
                onChange={(e) => setDevOnCall(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Horas extras (com 75% acréscimo) - Opcional"
                value={devOvertimeHours}
                onChange={(e) => setDevOvertimeHours(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <Button onClick={handleCalculateDevCost} className="w-full" variant="outline">
                Calcular Custo Real
              </Button>
              {realDevCost > 0 && (
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Custo Real (com encargos CLT 1.7x):</strong>
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    R$ {realDevCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
              <Button onClick={handleAddDeveloper} className="w-full">
                Adicionar Desenvolvedor
              </Button>
            </div>
          </div>

          {/* Lista de Desenvolvedores */}
          {normalizedDevelopers.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Desenvolvedores Cadastrados</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {normalizedDevelopers.map((dev) => {
                  const baseSalary = Number(dev.baseSalary) || 0;
                  const costWithCLT = baseSalary * 1.7;
                  const costPerHour = calculateDevCostPerHour(dev);
                  const isEditing = editingDevId === dev.id;

                  return (
                    <div key={dev.id} className="p-3 bg-white rounded border border-gray-200">
                      {!isEditing ? (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{dev.name}</p>
                              <p className="text-sm text-gray-600">
                                Salário Base: R$ {baseSalary.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-sm text-gray-600">
                                Custo com CLT (1.7x): R$ {costWithCLT.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                              <p className="text-sm font-semibold text-blue-600">
                                Valor/Hora: R$ {costPerHour.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <button
                              onClick={() => handleStartEditDeveloper(dev.id, baseSalary)}
                              className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                              Editar
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="space-y-3 p-3 bg-blue-50 rounded border border-blue-200">
                          <h4 className="font-semibold text-gray-900">Editar {dev.name}</h4>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Salário Base (R$)
                            </label>
                            <input
                              type="number"
                              value={editBaseSalary}
                              onChange={(e) => setEditBaseSalary(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mês (YYYY-MM)
                            </label>
                            <input
                              type="month"
                              value={editMonth}
                              onChange={(e) => setEditMonth(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Horas de Sobreaviso
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={editOnCallHours}
                              onChange={(e) => setEditOnCallHours(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Horas Extras
                            </label>
                            <input
                              type="number"
                              placeholder="0"
                              value={editOvertimeHours}
                              onChange={(e) => setEditOvertimeHours(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveEditDeveloper}
                              className="flex-1 px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                            >
                              Salvar
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="flex-1 px-3 py-2 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Form */}
      {activeTab === "product" && (
        <div className="space-y-3 p-4 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Nome do produto"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <Button onClick={handleAddProduct} className="w-full">
            Adicionar Produto
          </Button>
        </div>
      )}

      {/* Project Form */}
      {activeTab === "project" && (
        <div className="space-y-3 p-4 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Título do projeto"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            value={projectDevId}
            onChange={(e) => setProjectDevId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Selecione o desenvolvedor</option>
            {normalizedDevelopers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>
          <select
            value={projectProductId}
            onChange={(e) => setProjectProductId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Selecione o produto</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
          <select
            value={projectType}
            onChange={(e) =>
              setProjectType(e.target.value as "project" | "sustentation")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="project">Projeto</option>
            <option value="sustentation">Sustentação</option>
          </select>
          <input
            type="number"
            placeholder="Horas orçadas"
            value={projectHours}
            onChange={(e) => setProjectHours(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <input
            type="number"
            placeholder="Valor (R$)"
            value={projectValue}
            onChange={(e) => setProjectValue(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <Button onClick={handleAddProject} className="w-full">
            Adicionar Projeto
          </Button>
        </div>
      )}

      {/* Bug Form */}
      {activeTab === "bug" && (
        <div className="space-y-3 p-4 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Descrição do bug"
            value={bugTitle}
            onChange={(e) => setBugTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            value={bugDevId}
            onChange={(e) => setBugDevId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Selecione o desenvolvedor</option>
            {normalizedDevelopers.map((dev) => (
              <option key={dev.id} value={dev.id}>
                {dev.name}
              </option>
            ))}
          </select>
          <select
            value={bugProductId}
            onChange={(e) => setBugProductId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="">Selecione o produto</option>
            {products.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
          <select
            value={bugEnvironment}
            onChange={(e) =>
              setBugEnvironment(e.target.value as "production" | "staging" | "development")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="production">Produção</option>
            <option value="staging">Staging</option>
            <option value="development">Desenvolvimento</option>
          </select>
          <select
            value={bugSeverity}
            onChange={(e) =>
              setBugSeverity(e.target.value as "critical" | "high" | "medium" | "low")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
            <option value="low">Baixo</option>
          </select>
          <Button onClick={handleAddBug} className="w-full">
            Registrar Bug
          </Button>
        </div>
      )}

      {/* Deployment Form */}
      {activeTab === "deployment" && (
        <div className="space-y-3 p-4 bg-gray-50 rounded">
          <select
            value={deployEnvironment}
            onChange={(e) =>
              setDeployEnvironment(e.target.value as "staging" | "production")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="staging">Staging</option>
            <option value="production">Produção</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={deploySuccess}
              onChange={(e) => setDeploySuccess(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Deploy bem-sucedido</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={deployRollback}
              onChange={(e) => setDeployRollback(e.target.checked)}
              className="w-4 h-4"
            />
            <span>Rollback realizado</span>
          </label>
          <Button onClick={handleAddDeployment} className="w-full">
            Registrar Deploy
          </Button>
        </div>
      )}

      {/* Incident Form */}
      {activeTab === "incident" && (
        <div className="space-y-3 p-4 bg-gray-50 rounded">
          <input
            type="text"
            placeholder="Título do incidente"
            value={incidentTitle}
            onChange={(e) => setIncidentTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <select
            value={incidentSeverity}
            onChange={(e) =>
              setIncidentSeverity(e.target.value as "critical" | "high" | "medium" | "low")
            }
            className="w-full px-3 py-2 border border-gray-300 rounded"
          >
            <option value="critical">Crítico</option>
            <option value="high">Alto</option>
            <option value="medium">Médio</option>
            <option value="low">Baixo</option>
          </select>
          <input
            type="number"
            placeholder="SLA (horas)"
            value={incidentSLA}
            onChange={(e) => setIncidentSLA(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded"
          />
          <Button onClick={handleAddIncident} className="w-full">
            Registrar Incidente
          </Button>
        </div>
      )}
    </div>
  );
}
