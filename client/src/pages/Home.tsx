import AddDeveloperForm from "@/components/AddDeveloperForm";
import AddTaskForm from "@/components/AddTaskForm";
import AddBugTrackingForm from "@/components/AddBugTrackingForm";
import DevelopersList from "@/components/DevelopersList";
import MetricsDashboard from "@/components/MetricsDashboard";
import ProductsManager from "@/components/ProductsManager";
import TasksList from "@/components/TasksList";
import BugTrackingList from "@/components/BugTrackingList";
import ResourceMaximizationDashboard from "@/components/ResourceMaximizationDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDevelopers, getProducts } from "@/lib/storage";
import { getBugTracking } from "@/lib/bugTracking";
import ExportReports from "@/components/ExportReports";
import { useEffect, useState } from "react";

export default function Home() {
  const [developers, setDevelopers] = useState(getDevelopers());
  const [products, setProducts] = useState(getProducts());
  const [bugTracking, setBugTracking] = useState(getBugTracking());
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setDevelopers(getDevelopers());
    setProducts(getProducts());
    setBugTracking(getBugTracking());
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F5F7FA" }}>
      <div className="max-w-7xl mx-auto p-4">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: "#111827" }}>Dev Metrics</h1>
            <p style={{ color: "#6B7280" }}>
              Sistema avançado para medir custo vs retorno dos desenvolvedores
            </p>
          </div>
          <ExportReports />
        </header>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-4" style={{ backgroundColor: "#FFFFFF", border: "1px solid #E5E7EB" }}>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="produtos">Produtos</TabsTrigger>
            <TabsTrigger value="developers">Devs</TabsTrigger>
            <TabsTrigger value="tasks">Tarefas</TabsTrigger>
            <TabsTrigger value="bugs">Bugs/Projetos</TabsTrigger>
            <TabsTrigger value="recursos">Recursos</TabsTrigger>
            <TabsTrigger value="register">Registrar</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-4">
            <MetricsDashboard key={refreshKey} />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="produtos" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>Gerenciar Produtos</h2>
              <ProductsManager
                products={products}
                onProductUpdated={handleRefresh}
              />
            </div>
          </TabsContent>

          {/* Developers Tab */}
          <TabsContent value="developers" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>Desenvolvedores</h2>
              <DevelopersList
                developers={developers}
                onDeveloperUpdated={handleRefresh}
              />
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>Tarefas Registradas</h2>
              <TasksList key={refreshKey} onTaskDeleted={handleRefresh} />
            </div>
          </TabsContent>

          {/* Bugs/Projetos Tab */}
          <TabsContent value="bugs" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 bg-white rounded border" style={{ borderColor: "#E5E7EB" }}>
                <AddBugTrackingForm
                  developers={developers}
                  products={products}
                  onItemAdded={handleRefresh}
                />
              </div>
              <div className="lg:col-span-2 bg-white rounded border" style={{ borderColor: "#E5E7EB" }}>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>Rastreamento de Bugs e Projetos</h2>
                  <BugTrackingList
                    key={refreshKey}
                    items={bugTracking}
                    onItemDeleted={handleRefresh}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Recursos Tab */}
          <TabsContent value="recursos" className="space-y-4">
            <div className="bg-white p-6 rounded border" style={{ borderColor: "#E5E7EB" }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: "#111827" }}>Maximização de Recursos</h2>
              <ResourceMaximizationDashboard developers={developers} />
            </div>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded border" style={{ borderColor: "#E5E7EB" }}>
                <AddDeveloperForm
                  products={products}
                  onDeveloperAdded={handleRefresh}
                />
              </div>
              <div className="bg-white rounded border" style={{ borderColor: "#E5E7EB" }}>
                <AddTaskForm
                  developers={developers}
                  products={products}
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
