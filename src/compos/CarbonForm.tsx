import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  calculateGaugePercentage,
  formatRecommendation,
  getEmissionColor,
  getEmissionSeverity,
} from "@/utility/formatRecommendation";
import axios from "axios";
import {
  AlertCircle,
  Bus,
  Car,
  Droplets,
  Home,
  Leaf,
  Loader2,
  Plane,
  Recycle,
  Sun,
  Train,
  Utensils,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import useCarbonStore from "../store/useCarbonStore";
import { CalculateResponse, RecommendationResponse, TransportMode } from "../types/carbon";

export default function CarbonForm() {
  const [distance, setDistance] = useState<string>("");
  const [mode, setMode] = useState<TransportMode>("car");
  const [result, setResult] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [recLoading, setRecLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [animateResult, setAnimateResult] = useState<boolean>(false);
  const addEntry = useCarbonStore((state) => state.addEntry);

  // Reset animation state when starting new calculation
  useEffect(() => {
    if (loading) {
      setAnimateResult(false);
    }
  }, [loading]);

  // Trigger animations when result is set
  useEffect(() => {
    if (result && !loading) {
      setAnimateResult(true);
    }
  }, [result, loading]);

  const getModeIcon = (modeType: TransportMode) => {
    switch (modeType) {
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

  const handleCalculate = async (): Promise<void> => {
    if (!distance || isNaN(parseFloat(distance)) || parseFloat(distance) <= 0) {
      setError("Please enter a valid distance");
      return;
    }

    setLoading(true);
    setError(null);
    setRecommendation(null);

    try {
      const response = await axios.post<CalculateResponse>("http://localhost:5000/api/calculate", {
        distance,
        mode,
      });

      setResult(response.data.carbonFootprint);
      setRecLoading(true);
      const recResponse = await axios.post<RecommendationResponse>(
        "http://localhost:5000/api/recommendations",
        { carbonFootprint: response.data.carbonFootprint }
      );

      setRecommendation(recResponse.data.recommendation);
      setRecLoading(false);

      addEntry({
        distance: Number(distance),
        mode,
        carbonFootprint: response.data.carbonFootprint,
        recommendation: recResponse.data.recommendation,
      });
    } catch (err) {
      setError("Failed to calculate carbon footprint. Please try again.");
      setRecLoading(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full transition-all duration-300 ease-in-out">
      <CardHeader>
        <CardTitle className="text-xl">Carbon Footprint Calculator</CardTitle>
        <CardDescription>Calculate the environmental impact of your travel</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Steps - Only visible during calculation or right after completion */}
        <div className="space-y-2 transition-all duration-300 ease-in-out transform hover:translate-y-0 hover:shadow-sm">
          <label htmlFor="distance" className="text-sm font-medium">
            Travel Distance
          </label>
          <div className="flex gap-2">
            <Input
              id="distance"
              type="number"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Enter distance"
              className="flex-1 transition-all duration-200 hover:border-green-400 focus:border-green-500"
            />
            <Badge variant="outline" className="h-10 px-4 py-2 text-base font-normal">
              km
            </Badge>
          </div>
        </div>

        <div className="space-y-2 transition-all duration-300 ease-in-out">
          <label htmlFor="mode" className="text-sm font-medium">
            Transportation Mode
          </label>
          <Select value={mode} onValueChange={(value: TransportMode) => setMode(value)}>
            <SelectTrigger
              id="mode"
              className="w-full border rounded-md bg-white p-2 transition-all duration-200 hover:border-green-400 focus:border-green-500"
            >
              <SelectValue placeholder="Select a travel mode" />
            </SelectTrigger>
            <SelectContent className="bg-white border shadow-md">
              <SelectItem
                value="car"
                className="flex items-center gap-2 transition-colors duration-150 hover:bg-green-50"
              >
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  <span>Car</span>
                </div>
              </SelectItem>
              <SelectItem value="bus" className="transition-colors duration-150 hover:bg-green-50">
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4" />
                  <span>Bus</span>
                </div>
              </SelectItem>
              <SelectItem value="train" className="transition-colors duration-150 hover:bg-green-50">
                <div className="flex items-center gap-2">
                  <Train className="h-4 w-4" />
                  <span>Train</span>
                </div>
              </SelectItem>
              <SelectItem value="plane" className="transition-colors duration-150 hover:bg-green-50">
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4" />
                  <span>Plane</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error && (
          <Alert variant="destructive" className="animate-fadeIn transition-all duration-300 ease-in-out">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex-col gap-4">
        <Button
          onClick={handleCalculate}
          className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-102 active:scale-98"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Calculating...
            </>
          ) : (
            "Calculate Carbon Footprint"
          )}
        </Button>

        {result && (
          <div
            className={`w-full space-y-3 pt-4 border-t transition-all duration-500 ease-in-out ${
              animateResult ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <div className="flex flex-col items-center justify-center mb-6">
              <h3 className="font-medium mb-2">Your Carbon Footprint:</h3>

              {/* Carbon Footprint Gauge */}
              <div className="w-full h-6 bg-gray-200 rounded-full overflow-hidden relative mb-2">
                <div
                  className={`h-full transition-all duration-1000 ease-out rounded-full ${
                    getEmissionSeverity(result) === "low"
                      ? "bg-green-500"
                      : getEmissionSeverity(result) === "medium"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${animateResult ? calculateGaugePercentage(result) : 0}%`,
                  }}
                ></div>
              </div>

              <Badge
                className={`text-lg py-2 px-4 transition-all duration-300 ${getEmissionColor(
                  getEmissionSeverity(result)
                )}`}
              >
                {result} kg CO₂
              </Badge>
            </div>

            <div className="flex items-start gap-2 text-slate-700 bg-slate-50 p-3 rounded-md transition-all duration-300 ease-in-out hover:bg-slate-100">
              <div className="animate-bounce-once">{getModeIcon(mode)}</div>
              <span>
                {distance} km by {mode}
              </span>
            </div>

            {/* Recommendation Section */}
            <div
              className="bg-green-50 rounded-md p-4 mt-4 transition-all duration-500 ease-in-out transform"
              style={{
                transitionDelay: "300ms",
                opacity: animateResult ? 1 : 0,
                transform: animateResult ? "translateY(0)" : "translateY(20px)",
              }}
            >
              {recLoading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
                  <p className="text-sm text-green-700">Analyzing with AI...</p>
                </div>
              ) : recommendation ? (
                <div className="space-y-3">
                  <h3 className="font-medium text-green-800 flex items-center gap-2">
                    <Leaf className="h-5 w-5 animate-pulse" />
                    {formatRecommendation(recommendation).title}
                  </h3>

                  {formatRecommendation(recommendation).intro && (
                    <p className="text-sm text-green-700">{formatRecommendation(recommendation).intro}</p>
                  )}

                  <div className="space-y-3">
                    {formatRecommendation(recommendation).items.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-2 transition-all duration-300 ease-in-out hover:bg-green-100 p-2 rounded-md"
                        style={{
                          transitionDelay: `${index * 150}ms`,
                          opacity: animateResult ? 1 : 0,
                          transform: animateResult ? "translateX(0)" : "translateX(-10px)",
                        }}
                      >
                        <div className="mt-1 text-green-600 flex-shrink-0">
                          {getRecommendationIcon(item.title || item.description)}
                        </div>
                        <div>
                          {item.title ? (
                            <>
                              <h4 className="text-sm font-medium text-green-700">{item.title}</h4>
                              <p className="text-sm text-green-600">{item.description}</p>
                            </>
                          ) : (
                            <p className="text-sm text-green-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p
                    className="text-xs text-green-600 italic mt-2 transition-all duration-500 ease-in-out"
                    style={{
                      transitionDelay: "800ms",
                      opacity: animateResult ? 1 : 0,
                    }}
                  >
                    Even small changes can make a significant difference over time!
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
