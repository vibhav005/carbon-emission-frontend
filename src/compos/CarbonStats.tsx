// compos/CarbonStats.tsx
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useCarbonStore from "@/store/useCarbonStore";
import { Bus, Car, Plane, Train } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartDataPoint, ModeStats, TransportMode } from "../types/carbon";

export default function CarbonStats() {
  const history = useCarbonStore((state) => state.history);

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Carbon Statistics</CardTitle>
          <CardDescription>View insights about your travel emissions</CardDescription>
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <p className="text-slate-500">Add some trips to see your statistics</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate total emissions
  const totalEmissions = history
    .reduce((sum, entry) => sum + parseFloat(entry.carbonFootprint.toString()), 0)
    .toFixed(2);

  // Calculate average emissions per trip
  const averageEmissions = (parseFloat(totalEmissions) / history.length).toFixed(2);

  // Get stats by transportation mode
  const modeStats = history.reduce<ModeStats>((acc, entry) => {
    if (!acc[entry.mode]) {
      acc[entry.mode] = {
        count: 0,
        totalEmissions: 0,
        totalDistance: 0,
      };
    }

    acc[entry.mode].count++;
    acc[entry.mode].totalEmissions += parseFloat(entry.carbonFootprint.toString());
    acc[entry.mode].totalDistance += parseFloat(entry.distance.toString());

    return acc;
  }, {});

  // Prepare data for charts
  const modeChartData: ChartDataPoint[] = Object.keys(modeStats).map((mode) => ({
    name: mode,
    emissions: modeStats[mode].totalEmissions.toFixed(2),
    count: modeStats[mode].count,
    distance: modeStats[mode].totalDistance,
  }));

  // Prepare timeline data (last 5 entries)
  const timelineData: ChartDataPoint[] = [...history]
    .reverse()
    .slice(0, 5)
    .reverse()
    .map((entry, index) => ({
      name: `Trip ${index + 1}`,
      emissions: parseFloat(entry.carbonFootprint.toString()),
      distance: entry.distance,
      mode: entry.mode,
    }));

  const getModeIcon = (mode: TransportMode) => {
    switch (mode) {
      case "car":
        return <Car className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      case "train":
        return <Train className="h-4 w-4" />;
      case "plane":
        return <Plane className="h-4 w-4" />;
    }
  };

  const getStatusColor = (value: number): string => {
    if (value < 5) return "bg-green-100 text-green-800";
    if (value < 20) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getPreferredMode = (): TransportMode | null => {
    const modes = Object.keys(modeStats) as TransportMode[];
    if (modes.length === 0) return null;

    // If there's only one mode, return it
    if (modes.length === 1) return modes[0];

    return modes.reduce<TransportMode>((preferred, current) => {
      // Safely check if both keys exist in modeStats
      if (modeStats[preferred] && modeStats[current]) {
        return modeStats[preferred].count > modeStats[current].count ? preferred : current;
      }
      // If preferred is valid but current isn't, return preferred
      else if (modeStats[preferred]) {
        return preferred;
      }
      // If current is valid but preferred isn't, return current
      else if (modeStats[current]) {
        return current;
      }
      // Default fallback
      return preferred;
    }, modes[0]);
  };

  const getLowestEmissionMode = (): TransportMode | null => {
    const modes = Object.keys(modeStats) as TransportMode[];
    if (modes.length === 0) return null;

    // If there's only one mode, return it
    if (modes.length === 1) return modes[0];

    const modesWithRatios = modes
      .filter((mode) => modeStats[mode] && modeStats[mode].totalDistance > 0)
      .map((mode) => ({
        mode,
        ratio: modeStats[mode].totalEmissions / modeStats[mode].totalDistance,
      }));

    if (modesWithRatios.length === 0) return null;

    return modesWithRatios.reduce((a, b) => (a.ratio < b.ratio ? a : b)).mode;
  };

  const preferredMode = getPreferredMode();
  const lowestEmissionMode = getLowestEmissionMode();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Carbon Statistics</CardTitle>
          <CardDescription>View insights about your travel emissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Total Emissions</div>
              <div className="text-2xl font-bold">
                {totalEmissions} <span className="text-sm font-normal">kg CO₂</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Average per Trip</div>
              <div className="text-2xl font-bold">
                {averageEmissions} <span className="text-sm font-normal">kg CO₂</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="text-sm text-slate-500 mb-1">Total Trips</div>
              <div className="text-2xl font-bold">{history.length}</div>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <h3 className="font-medium text-slate-700">Your Travel Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={modeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="emissions" name="CO₂ Emissions (kg)" fill="#8884d8" />
                  <Bar yAxisId="right" dataKey="distance" name="Distance (km)" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {timelineData.length > 1 && (
            <div className="space-y-2">
              <h3 className="font-medium text-slate-700">Recent Trips Trend</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="emissions"
                      name="CO₂ Emissions (kg)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Travel Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-full">{preferredMode && getModeIcon(preferredMode)}</div>
                <div>
                  <h4 className="font-medium">Most Used Transportation</h4>
                  <p className="text-sm text-slate-500">
                    {preferredMode && modeStats[preferredMode] ? (
                      <>
                        You've used {preferredMode} for {modeStats[preferredMode].count} trips
                      </>
                    ) : (
                      "No data available"
                    )}
                  </p>
                </div>
              </div>
              {preferredMode && <Badge className="capitalize">{preferredMode}</Badge>}
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="bg-white p-2 rounded-full">
                  {lowestEmissionMode && getModeIcon(lowestEmissionMode)}
                </div>
                <div>
                  <h4 className="font-medium">Lowest Emission Option</h4>
                  <p className="text-sm text-slate-500">
                    {lowestEmissionMode ? (
                      <>Best choice for reducing your carbon footprint</>
                    ) : (
                      "No data available"
                    )}
                  </p>
                </div>
              </div>
              {lowestEmissionMode && (
                <Badge className={`capitalize ${getStatusColor(5)}`}>{lowestEmissionMode}</Badge>
              )}
            </div>

            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="font-medium mb-2">Environmental Impact Status</h4>
              <Badge className={getStatusColor(parseFloat(averageEmissions))}>
                {parseFloat(averageEmissions) < 5
                  ? "Low Impact"
                  : parseFloat(averageEmissions) < 20
                  ? "Medium Impact"
                  : "High Impact"}
              </Badge>
              <p className="text-sm text-slate-500 mt-2">
                {parseFloat(averageEmissions) < 5
                  ? "Great job! Your travel choices are environmentally friendly."
                  : parseFloat(averageEmissions) < 20
                  ? "Your carbon footprint is moderate. Consider more eco-friendly alternatives when possible."
                  : "Your carbon footprint is significant. Try using public transport or carpooling to reduce emissions."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
