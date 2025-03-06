import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCarbonStore from "@/store/useCarbonStore";
import { CarbonEntry, TransportMode } from "@/types/carbon";
import { formatRecommendation } from "@/utility/formatRecommendation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bus,
  Calendar,
  Car,
  ChevronDown,
  ChevronUp,
  Droplets,
  Home,
  Leaf,
  ListFilter,
  Map,
  Plane,
  Recycle,
  Sun,
  Train,
  Trash2,
  Utensils,
  Zap,
} from "lucide-react";
import { useRef, useState } from "react";

export default function CarbonHistory() {
  const history = useCarbonStore((state) => state.history);
  const clearHistory = useCarbonStore((state) => state.clearHistory);
  const removeEntry = useCarbonStore((state) => state.removeEntry);
  const [expandedEntries, setExpandedEntries] = useState<Record<number, boolean>>({});
  const [viewMode, setViewMode] = useState<"list" | "map" | "timeline">("list");
  const mapRef = useRef(null);

  // Toggle expansion state with animation
  const toggleExpand = (index: number) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

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

  const getEmissionBadgeColor = (value: string | number): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (numValue < 5) return "bg-green-100 text-green-800 hover:bg-green-100";
    if (numValue < 20) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    return "bg-red-100 text-red-800 hover:bg-red-100";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get icon for recommendation category
  const getRecommendationIcon = (title: string) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("flight") || lowerTitle.includes("plane")) return <Plane className="h-4 w-4" />;
    if (lowerTitle.includes("meat") || lowerTitle.includes("diet") || lowerTitle.includes("food"))
      return <Utensils className="h-4 w-4" />;
    if (
      lowerTitle.includes("drive") ||
      lowerTitle.includes("car") ||
      lowerTitle.includes("cycle") ||
      lowerTitle.includes("walk")
    )
      return <Car className="h-4 w-4" />;
    if (lowerTitle.includes("energy") || lowerTitle.includes("unplug") || lowerTitle.includes("electron"))
      return <Zap className="h-4 w-4" />;
    if (lowerTitle.includes("recycle") || lowerTitle.includes("waste"))
      return <Recycle className="h-4 w-4" />;
    if (lowerTitle.includes("shower") || lowerTitle.includes("water"))
      return <Droplets className="h-4 w-4" />;
    if (lowerTitle.includes("dry") || lowerTitle.includes("clothes")) return <Sun className="h-4 w-4" />;
    if (lowerTitle.includes("home") || lowerTitle.includes("house")) return <Home className="h-4 w-4" />;
    return <Leaf className="h-4 w-4" />;
  };

  const getMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  // Group entries by month for timeline view
  const groupEntriesByMonth = () => {
    const groups: Record<string, CarbonEntry[]> = {};

    history.forEach((entry) => {
      if (!entry.date) return;

      const monthYear = getMonthYear(entry.date);
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(entry);
    });

    return Object.entries(groups).sort((a, b) => {
      const dateA = new Date(a[0]);
      const dateB = new Date(b[0]);
      return dateB.getTime() - dateA.getTime(); // Sort in descending order
    });
  };

  // Simple map representation
  const renderMap = () => {
    return (
      <div className="relative w-full h-64 bg-slate-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-slate-400">
          <p>Map visualization would display travel routes here</p>
        </div>
        {history.length > 0 && (
          <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-md shadow-md">
            <p className="text-sm font-medium">Travel Summary</p>
            <p className="text-xs text-slate-500">
              {history.length} journeys recorded, total{" "}
              {history.reduce((acc, item) => acc + parseFloat(item.distance.toString()), 0).toFixed(2)} km
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Travel History</CardTitle>
          <CardDescription>Your past carbon footprint calculations</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500">No travel history available yet.</p>
            <p className="text-sm text-slate-400 mt-2">Use the calculator to track your carbon footprint</p>
          </div>
        ) : (
          <>
            <Tabs defaultValue="list" className="mb-4">
              <TabsList className="mb-4">
                <TabsTrigger value="list" onClick={() => setViewMode("list")}>
                  <ListFilter className="h-4 w-4 mr-2" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="map" onClick={() => setViewMode("map")}>
                  <Map className="h-4 w-4 mr-2" />
                  Map View
                </TabsTrigger>
                <TabsTrigger value="timeline" onClick={() => setViewMode("timeline")}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-0">
                <ul className="space-y-3">
                  {history.map((entry: CarbonEntry, index: number) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border rounded-lg p-3 hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="px-2 py-1">
                            {getModeIcon(entry.mode)}
                          </Badge>
                          <div>
                            <h4 className="font-medium">{entry.distance} km journey</h4>
                            <p className="text-xs text-slate-500">
                              {entry.date ? formatDate(entry.date) : "No date recorded"}
                            </p>
                          </div>
                        </div>
                        <Badge className={getEmissionBadgeColor(entry.carbonFootprint)}>
                          {entry.carbonFootprint} kg CO₂
                        </Badge>
                      </div>

                      {entry.recommendation && (
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(index)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 flex items-center gap-1 text-xs ml-8 pl-1 h-6"
                          >
                            <Leaf className="h-3 w-3" />
                            {expandedEntries[index] ? "Hide recommendations" : "View recommendations"}
                            {expandedEntries[index] ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </Button>

                          <AnimatePresence>
                            {expandedEntries[index] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-8 mt-2 bg-green-50 p-3 rounded-md">
                                  {formatRecommendation(entry.recommendation).intro && (
                                    <p className="text-xs text-green-700 mb-2">
                                      {formatRecommendation(entry.recommendation).intro}
                                    </p>
                                  )}

                                  <div className="space-y-2">
                                    {formatRecommendation(entry.recommendation).items.map(
                                      (item, itemIndex) => (
                                        <motion.div
                                          key={itemIndex}
                                          initial={{ opacity: 0, x: -5 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          transition={{ duration: 0.2, delay: itemIndex * 0.1 }}
                                          className="flex gap-2"
                                        >
                                          <div className="mt-0.5 text-green-600 flex-shrink-0">
                                            {getRecommendationIcon(item.title || item.description)}
                                          </div>
                                          <div>
                                            {item.title ? (
                                              <>
                                                <span className="text-xs font-medium text-green-700">
                                                  {item.title}
                                                </span>
                                                <span className="text-xs text-green-600">
                                                  {" "}
                                                  {item.description}
                                                </span>
                                              </>
                                            ) : (
                                              <span className="text-xs text-green-600">
                                                {item.description}
                                              </span>
                                            )}
                                          </div>
                                        </motion.div>
                                      )
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}

                      <div className="flex justify-end mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEntry(index)}
                          className="h-6 px-2 text-slate-500 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="map" className="mt-0">
                {renderMap()}
                <div className="mt-4">
                  <p className="text-sm text-slate-500">Top carbon contributors:</p>
                  <ul className="mt-2 space-y-2">
                    {history
                      .slice()
                      .sort(
                        (a, b) =>
                          parseFloat(b.carbonFootprint.toString()) - parseFloat(a.carbonFootprint.toString())
                      )
                      .slice(0, 3)
                      .map((entry, idx) => (
                        <li key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                          <div className="flex items-center gap-2">
                            {getModeIcon(entry.mode)}
                            <span className="text-sm">
                              {entry.distance} km {entry.mode}
                            </span>
                          </div>
                          <Badge className={getEmissionBadgeColor(entry.carbonFootprint)}>
                            {entry.carbonFootprint} kg CO₂
                          </Badge>
                        </li>
                      ))}
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-0">
                <div className="space-y-6">
                  {groupEntriesByMonth().map(([monthYear, entries], groupIndex) => (
                    <div key={monthYear} className="relative">
                      <div className="flex items-center mb-3">
                        <div className="w-4 h-4 rounded-full bg-blue-500 z-10"></div>
                        <div className="ml-3 font-medium">{monthYear}</div>
                      </div>

                      {/* Vertical timeline line */}
                      {groupIndex < groupEntriesByMonth().length - 1 && (
                        <div className="absolute top-4 left-2 w-0.5 h-full -ml-0.5 bg-blue-200"></div>
                      )}

                      <div className="ml-10 space-y-3">
                        {entries.map((entry, entryIndex) => (
                          <motion.div
                            key={entryIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: entryIndex * 0.1 }}
                            className="p-3 border rounded-lg hover:bg-slate-50"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="px-2 py-1">
                                  {getModeIcon(entry.mode)}
                                </Badge>
                                <div>
                                  <h4 className="font-medium">{entry.distance} km journey</h4>
                                  <p className="text-xs text-slate-500">
                                    {entry.date ? formatDate(entry.date) : "No date recorded"}
                                  </p>
                                </div>
                              </div>
                              <Badge className={getEmissionBadgeColor(entry.carbonFootprint)}>
                                {entry.carbonFootprint} kg CO₂
                              </Badge>
                            </div>

                            {entry.recommendation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleExpand(groupIndex * 100 + entryIndex)} // Unique ID
                                className="text-green-600 hover:text-green-700 hover:bg-green-50 flex items-center gap-1 text-xs mt-2 h-6"
                              >
                                <Leaf className="h-3 w-3" />
                                {expandedEntries[groupIndex * 100 + entryIndex] ? "Hide" : "View"}{" "}
                                recommendations
                              </Button>
                            )}

                            <AnimatePresence>
                              {expandedEntries[groupIndex * 100 + entryIndex] && entry.recommendation && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="mt-2 bg-green-50 p-3 rounded-md overflow-hidden"
                                >
                                  {formatRecommendation(entry.recommendation).items.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex gap-2 mb-1">
                                      <div className="text-green-600 flex-shrink-0">
                                        {getRecommendationIcon(item.title || item.description)}
                                      </div>
                                      <div className="text-xs text-green-600">
                                        {item.title && <span className="font-medium">{item.title}: </span>}
                                        {item.description}
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}
