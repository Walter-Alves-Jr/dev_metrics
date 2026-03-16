import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExecutiveDashboard from "@/components/ExecutiveDashboard";
import FlowDashboard from "@/components/FlowDashboard";
import SustentationDashboard from "@/components/SustentationDashboard";
import QualityDashboard from "@/components/QualityDashboard";
import {
  DeploymentRecord,
  IncidentRecord,
  TaskRecord,
  BugRecord,
} from "@/lib/doraMetrics";

export default function Home() {
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [bugs, setBugs] = useState<BugRecord[]>([]);

  // Dados de exemplo para demonstração
  useEffect(() => {
    // Exemplo de dados
    const mockDeployments: DeploymentRecord[] = [
      {
        id: "1",
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        success: true,
        environment: "production",
      },
      {
        id: "2",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        success: true,
        environment: "production",
      },
      {
        id: "3",
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        success: false,
        rollback: true,
        environment: "production",
      },
    ];

    const mockIncidents: IncidentRecord[] = [
      {
        id: "1",
        title: "API lenta em produção",
        openedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        acknowledgedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
        severity: "high",
        slaTarget: 4,
      },
      {
        id: "2",
        title: "Erro de autenticação",
        openedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        acknowledgedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 4.8 * 24 * 60 * 60 * 1000),
        severity: "critical",
        recurring: true,
        slaTarget: 2,
      },
    ];

    const mockTasks: TaskRecord[] = [
      {
        id: "1",
        title: "Implementar novo recurso",
        status: "done",
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        devStartedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
        reviewStartedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        deployedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        type: "project",
      },
      {
        id: "2",
        title: "Corrigir bug de validação",
        status: "done",
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        devStartedAt: new Date(Date.now() - 7.5 * 24 * 60 * 60 * 1000),
        reviewStartedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        deployedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        reopened: 1,
        type: "sustentation",
      },
    ];

    const mockBugs: BugRecord[] = [
      {
        id: "1",
        title: "Erro ao salvar formulário",
        foundAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        fixedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        environment: "production",
        severity: "high",
      },
      {
        id: "2",
        title: "Performance lenta em listagem",
        foundAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        environment: "production",
        severity: "medium",
      },
    ];

    setDeployments(mockDeployments);
    setIncidents(mockIncidents);
    setTasks(mockTasks);
    setBugs(mockBugs);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>
            Engineering Performance Dashboard
          </h1>
          <p style={{ color: "#6B7280" }}>
            Métricas DORA + Sustentação para gestão de engenharia
          </p>
        </header>

        <Tabs defaultValue="executivo" className="w-full">
          <TabsList
            className="grid w-full grid-cols-4 mb-4"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}
          >
            <TabsTrigger value="executivo">Executivo</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo</TabsTrigger>
            <TabsTrigger value="sustentacao">Sustentação</TabsTrigger>
            <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
          </TabsList>

          {/* Dashboard Executivo */}
          <TabsContent value="executivo" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <ExecutiveDashboard
                deployments={deployments}
                incidents={incidents}
                tasks={tasks}
                bugs={bugs.length}
              />
            </div>
          </TabsContent>

          {/* Dashboard de Fluxo */}
          <TabsContent value="fluxo" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <FlowDashboard tasks={tasks} />
            </div>
          </TabsContent>

          {/* Dashboard de Sustentação */}
          <TabsContent value="sustentacao" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <SustentationDashboard incidents={incidents} />
            </div>
          </TabsContent>

          {/* Dashboard de Qualidade */}
          <TabsContent value="qualidade" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <QualityDashboard tasks={tasks} bugs={bugs} testCoverage={72} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer com informações */}
        <div className="mt-8 p-4 bg-white rounded border" style={{ borderColor: "#E5E7EB" }}>
          <h3 className="font-semibold text-gray-900 mb-2">Sobre as Métricas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900">DORA (DevOps Research and Assessment)</p>
              <p>Padrão da indústria para medir performance de engenharia</p>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Sustentação</p>
              <p>Métricas operacionais para times de suporte e incidentes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
