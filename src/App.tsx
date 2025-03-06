// App.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, History, MoveRight } from "lucide-react";
import CarbonForm from "./compos/CarbonForm";
import CarbonHistory from "./compos/CarbonHistory";
import CarbonStats from "./compos/CarbonStats";

export default function App() {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-slate-50 min-h-screen">
      <header className="flex items-center justify-center gap-2 mb-6">
        <h1 className="text-3xl font-bold text-slate-800">CarbonTrackr</h1>
        <MoveRight className="text-green-600 w-6 h-6" />
      </header>

      <main>
        <Tabs defaultValue="calculate" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="calculate" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span>Calculate</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-bar-chart-2"
              >
                <line x1="18" x2="18" y1="20" y2="10" />
                <line x1="12" x2="12" y1="20" y2="4" />
                <line x1="6" x2="6" y1="20" y2="14" />
              </svg>
              <span>Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calculate" className="space-y-4">
            <CarbonForm />
          </TabsContent>

          <TabsContent value="history">
            <CarbonHistory />
          </TabsContent>

          <TabsContent value="stats">
            <CarbonStats />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-8 text-center text-sm text-slate-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-4 low-emission">
            <h3 className="font-medium text-green-800">Low Impact Activities</h3>
            <p className="text-sm text-slate-600">Walking, cycling, local produce</p>
          </div>
          <div className="card p-4 medium-emission">
            <h3 className="font-medium text-yellow-800">Medium Impact</h3>
            <p className="text-sm text-slate-600">Public transport, moderate flights</p>
          </div>
          <div className="card p-4 high-emission">
            <h3 className="font-medium text-red-800">High Impact Activities</h3>
            <p className="text-sm text-slate-600">Frequent flights, gas vehicles</p>
          </div>
        </div>
        <p className="mt-15">© 2025 CarbonTrackr - Track your carbon footprint and make a difference</p>
      </footer>
    </div>
  );
}
