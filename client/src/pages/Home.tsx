import AddDeveloperForm from "@/components/AddDeveloperForm";
import AddTaskForm from "@/components/AddTaskForm";
import DevelopersList from "@/components/DevelopersList";
import MetricsDashboard from "@/components/MetricsDashboard";
import TasksList from "@/components/TasksList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDevelopers } from "@/lib/storage";
import { useEffect, useState } from "react";

export default function Home() {
  const [developers, setDevelopers] = useState(getDevelopers());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setDevelopers(getDevelopers());
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    // Refresh data when component mounts
    handleRefresh();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dev Metrics</h1>
          <p className="text-gray-600">
            Sistema para medir custo vs retorno dos desenvolvedores
          </p>
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="developers">Devs</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <MetricsDashboard key={refreshKey} />
          </TabsContent>

          {/* Developers Tab */}
          <TabsContent value="developers" className="space-y-4">
            <div className="bg-white p-6 rounded border">
              <h2 className="text-xl font-semibold mb-4">Desenvolvedores</h2>
              <DevelopersList
                developers={developers}
                onDeveloperUpdated={handleRefresh}
              />
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="bg-white p-6 rounded border">
              <h2 className="text-xl font-semibold mb-4">Tarefas Registradas</h2>
              <TasksList key={refreshKey} onTaskDeleted={handleRefresh} />
            </div>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded border">
                <AddDeveloperForm onDeveloperAdded={handleRefresh} />
              </div>
              <div className="bg-white rounded border">
                <AddTaskForm
                  developers={developers}
                  onTaskAdded={handleRefresh}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
