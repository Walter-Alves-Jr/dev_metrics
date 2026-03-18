import { useMemo } from "react";
import { motion } from "framer-motion";

type ProjectStatus = "backlog" | "dev" | "review" | "deploy" | "done";

interface ProjectTimelineProps {
  title: string;
  status: ProjectStatus;
}

const statusMap: Record<ProjectStatus, { label: string; progress: number }> = {
  backlog: { label: "Backlog", progress: 0 },
  dev: { label: "Desenvolvimento", progress: 25 },
  review: { label: "Review", progress: 50 },
  deploy: { label: "Deploy", progress: 75 },
  done: { label: "Concluído", progress: 100 },
};

export default function ProjectTimeline({ title, status }: ProjectTimelineProps) {
  const currentProgress = useMemo(() => statusMap[status].progress, [status]);

  return (
    <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm mb-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold uppercase tracking-wider">
          {statusMap[status].label}
        </span>
      </div>

      <div className="relative pt-12 pb-4 px-2">
        {/* Estrada / Linha de Progresso */}
        <div className="absolute top-20 left-0 w-full h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentProgress}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="h-full bg-blue-500"
          />
        </div>

        {/* Marcadores de Etapas */}
        <div className="absolute top-20 left-0 w-full flex justify-between transform -translate-y-1/2">
          {Object.entries(statusMap).map(([key, value]) => (
            <div key={key} className="flex flex-col items-center">
              <div 
                className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${
                  currentProgress >= value.progress ? "bg-blue-500" : "bg-gray-300"
                }`}
              />
              <span className="mt-2 text-[10px] font-medium text-gray-500 whitespace-nowrap">
                {value.label}
              </span>
            </div>
          ))}
        </div>

        {/* O Caminhão */}
        <motion.div
          className="absolute top-4 left-0 w-24 h-12 z-20 pointer-events-none"
          initial={{ left: "0%" }}
          animate={{ left: `calc(${currentProgress}% - 48px)` }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          style={{ 
            x: currentProgress === 0 ? 0 : 0,
            marginLeft: currentProgress === 0 ? "0px" : currentProgress === 100 ? "48px" : "24px"
          }}
        >
          <img 
            src="/assets/truck.png" 
            alt="Truck" 
            className="w-full h-auto object-contain drop-shadow-md"
          />
          {/* Fumaça do escapamento opcional */}
          {status !== "done" && status !== "backlog" && (
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0], scale: [1, 1.5, 2], x: [-5, -15] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute bottom-2 left-0 w-2 h-2 bg-gray-400 rounded-full blur-[1px]"
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
