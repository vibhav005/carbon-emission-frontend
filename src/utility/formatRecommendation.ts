export const formatRecommendation = (rec: string) => {
  if (!rec) return { title: "Recommendation", items: [] };

  // Extract the intro text (everything before the first bullet or ***)
  let introText = "";
  let itemsText = rec;

  // Check if there's an intro paragraph before bullet points or *** markers
  const introMatch = rec.match(/(.*?)(\*\*\*|\* \*\*)/s);
  if (introMatch && introMatch[1].trim()) {
    introText = introMatch[1].trim();
    itemsText = rec.substring(introMatch[0].length - (introMatch[2] || "").length);
  }

  // Parse the items based on different possible formats
  let items = [];

  // Check for markdown bullet format: * **Title:** Description
  if (itemsText.includes("* **")) {
    items = itemsText.split(/\* \*\*/).filter((item) => item.trim().length > 0);
  }
  // Check for *** format: ***Title:** Description
  else if (itemsText.includes("***")) {
    items = itemsText.split(/\*\*\*/).filter((item) => item.trim().length > 0);
  }
  // If no structured format is found, use the whole text as one item
  else if (itemsText.trim()) {
    // Try to split on newlines if available
    const lines = itemsText.split(/\n/).filter((line) => line.trim().length > 0);
    if (lines.length > 1) {
      items = lines;
    } else {
      items = [itemsText.trim()];
    }
  }

  // Process each item into title and description
  const processedItems = items.map((item) => {
    // Check for bold title with colon format: Title:** Description
    const titleMatch = item.match(/([^:]*?):\*\*(.*)/);
    if (titleMatch) {
      return {
        title: titleMatch[1].replace(/\*/g, "").trim(),
        description: titleMatch[2].trim(),
      };
    }

    // Check for regular title with colon format: Title: Description
    const colonMatch = item.match(/([^:]*?):(.*)/);
    if (colonMatch) {
      return {
        title: colonMatch[1].replace(/\*/g, "").trim(),
        description: colonMatch[2].trim(),
      };
    }

    // If no clear structure, use the whole item as description
    return {
      title: "",
      description: item.replace(/\*/g, "").trim(),
    };
  });

  // Find title for the recommendations section
  let title = "Ways to Reduce Your Carbon Footprint";
  if (introText) {
    // Use first sentence of intro as title if it's not too long
    const firstSentence = introText.split(".")[0];
    if (firstSentence && firstSentence.length < 60) {
      title = firstSentence;
    }
  }

  return {
    title,
    intro: introText,
    items: processedItems,
  };
};

export const getEmissionSeverity = (value: string | number): "low" | "medium" | "high" => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (numValue < 5) return "low";
  if (numValue < 20) return "medium";
  return "high";
};

export const getEmissionColor = (severity: "low" | "medium" | "high"): string => {
  switch (severity) {
    case "low":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "medium":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    case "high":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "bg-slate-100";
  }
};

export const calculateGaugePercentage = (value: string | number): number => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return Math.min(100, (numValue / 50) * 100);
};
