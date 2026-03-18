import { TaskRecord } from "@/lib/doraMetrics";
import ProjectTimeline from "./ProjectTimeline";

type ProjectsTimelineViewProps = {
  tasks: TaskRecord[];
};

export default function ProjectsTimelineView({ tasks }: ProjectsTimelineViewProps) {
  // Filtrar apenas projetos (não sustentação) e ordenar por data de criação
  const projects = tasks
    .filter((t) => t.type === "project")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (projects.length === 0) {
    return (
      <div className="p-8 text-center bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 font-medium">Nenhum projeto cadastrado</p>
        <p className="text-sm text-gray-500 mt-1">Adicione um projeto para visualizar a linha do tempo</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Linha do Tempo de Projetos</h2>
        <p className="text-sm text-gray-600 mt-1">Acompanhe o progresso de cada projeto em tempo real</p>
      </div>

      <div className="space-y-3">
        {projects.map((project) => (
          <ProjectTimeline
            key={project.id}
            title={project.title}
            status={project.status}
          />
        ))}
      </div>

      {/* Legenda */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Legenda de Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-sm">
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
            <span className="text-blue-800">Backlog</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-blue-800">Desenvolvimento</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-blue-800">Review</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-blue-800">Deploy</span>
          </div>
          <div>
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span className="text-blue-800">Concluído</span>
          </div>
        </div>
      </div>
    </div>
  );
}
