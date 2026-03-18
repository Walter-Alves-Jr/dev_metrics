import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataInputForms from "@/components/DataInputForms";

import ExecutiveDashboard from "@/components/ExecutiveDashboard";
import FlowDashboard from "@/components/FlowDashboard";
import SustentationDashboard from "@/components/SustentationDashboard";
import QualityDashboard from "@/components/QualityDashboard";
import ROIDashboard from "@/components/ROIDashboard";
import ProjectsTimelineView from "@/components/ProjectsTimelineView";
import ProjectsManager from "@/components/ProjectsManager";
import BugsManager from "@/components/BugsManager";
import {
  loadProjects,
  loadBugs,
  loadDeployments,
  loadIncidents,
} from "@/lib/integratedMetrics";
import {
  DeploymentRecord,
  IncidentRecord,
  TaskRecord,
  BugRecord,
} from "@/lib/doraMetrics";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [deployments, setDeployments] = useState<DeploymentRecord[]>([]);
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [tasks, setTasks] = useState<TaskRecord[]>([]);
  const [bugs, setBugs] = useState<BugRecord[]>([]);

  const loadData = () => {
    // Carregar projetos e converter para TaskRecord
    const projects = loadProjects();
    const projectTasks: TaskRecord[] = projects.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      createdAt: p.createdAt,
      devStartedAt: p.devStartedAt,
      reviewStartedAt: p.reviewStartedAt,
      deployedAt: p.deployedAt,
      completedAt: p.completedAt,
      reopened: p.reopened,
      type: p.type,
    }));

    // Carregar bugs
    const loadedBugs = loadBugs();
    const bugRecords: BugRecord[] = loadedBugs.map((b) => ({
      id: b.id,
      title: b.title,
      foundAt: b.foundAt,
      fixedAt: b.fixedAt,
      environment: b.environment,
      severity: b.severity,
    }));

    // Carregar deployments
    const loadedDeployments = loadDeployments();
    const deploymentRecords: DeploymentRecord[] = loadedDeployments.map((d) => ({
      id: d.id,
      date: d.date,
      success: d.success,
      rollback: d.rollback,
      environment: d.environment,
    }));

    // Carregar incidentes
    const loadedIncidents = loadIncidents();
    const incidentRecords: IncidentRecord[] = loadedIncidents.map((i) => ({
      id: i.id,
      title: i.title,
      openedAt: i.openedAt,
      acknowledgedAt: i.acknowledgedAt,
      resolvedAt: i.resolvedAt,
      severity: i.severity,
      recurring: i.recurring,
      slaTarget: i.slaTargetHours,
    }));

    setTasks(projectTasks);
    setBugs(bugRecords);
    setDeployments(deploymentRecords);
    setIncidents(incidentRecords);
  };

  useEffect(() => {
    loadData();
  }, [refreshKey]);

  const handleDataAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

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

        <Tabs defaultValue="entrada" className="w-full">
          <TabsList
            className="grid w-full grid-cols-9 mb-4 overflow-x-auto"
            style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}
          >
            <TabsTrigger value="entrada">Entrada</TabsTrigger>
            <TabsTrigger value="projetos">Gestão Projetos</TabsTrigger>
            <TabsTrigger value="bugs">Gestão Bugs</TabsTrigger>
            <TabsTrigger value="executivo">Executivo</TabsTrigger>
            <TabsTrigger value="fluxo">Fluxo</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="sustentacao">Sustentação</TabsTrigger>
            <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
            <TabsTrigger value="roi">ROI</TabsTrigger>
          </TabsList>

          {/* Entrada de Dados */}
          <TabsContent value="entrada" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>
                Registrar Dados
              </h2>
              <DataInputForms onDataAdded={handleDataAdded} key={refreshKey} />
            </div>
          </TabsContent>

          {/* Gestão de Projetos */}
          <TabsContent value="projetos" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>
                Gerenciar Projetos
              </h2>
              <ProjectsManager onDataChanged={handleDataAdded} key={`projects-${refreshKey}`} />
            </div>
          </TabsContent>

          {/* Gestão de Bugs */}
          <TabsContent value="bugs" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>
                Gerenciar Bugs
              </h2>
              <BugsManager onDataChanged={handleDataAdded} key={`bugs-${refreshKey}`} />
            </div>
          </TabsContent>

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

          {/* Timeline de Projetos */}
          <TabsContent value="timeline" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <ProjectsTimelineView tasks={tasks} />
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

          {/* Dashboard de ROI */}
          <TabsContent value="roi" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <ROIDashboard />
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
