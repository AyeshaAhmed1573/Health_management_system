import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, ArrowUp, ArrowDown, Minus, Info } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const LINE_COLORS = [
  "#6FB3B5",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#22C55E",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
];

// Helper to determine whether an increase is good or bad for key parameters
const isIncreaseGood = (paramName) => {
  const name = paramName.toLowerCase();
  if (name.includes("hemoglobin") || name.includes("hdl") || name.includes("platelet") || name.includes("vit")) {
    return true;
  }
  // Default: for cholesterol, glucose, hba1c, ldl, creatinine, ALT, AST etc, increase is bad
  return false;
};

export default function ComparisonGraph({ category, profileId, open, onOpenChange }) {
  const [selectedParams, setSelectedParams] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "compare", profileId, category],
    queryFn: async () => {
      if (!profileId || !category) return null;
      const res = await fetch(`/api/reports/compare/${profileId}/${encodeURIComponent(category)}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch comparison data");
      return res.json();
    },
    enabled: Boolean(profileId && category && open),
  });

  if (!open) return null;

  const dates = data?.dates || [];
  const paramsMap = data?.params || {};
  const paramKeys = Object.keys(paramsMap);

  // Initialize selected parameters if empty
  const activeParams = paramKeys.filter((param) =>
    selectedParams[param] !== undefined ? selectedParams[param] : true
  );

  const handleToggleParam = (param) => {
    setSelectedParams((prev) => ({
      ...prev,
      [param]: prev[param] !== undefined ? !prev[param] : false,
    }));
  };

  // Transform data into array of objects for Recharts: [{ date: "01/01/2025", "Hemoglobin": 10.2, "WBC": 6.1 }]
  const chartData = dates.map((dateStr, idx) => {
    const row = { date: dateStr };
    paramKeys.forEach((key) => {
      row[key] = paramsMap[key].values[idx];
    });
    return row;
  });

  const timespan =
    dates.length >= 2 ? `${dates[0]} — ${dates[dates.length - 1]}` : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto rounded-3xl p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" /> {category} Health Trends
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-20 text-center text-secondary-foreground font-medium">
            Loading trend comparison graph...
          </div>
        ) : !data || data.count < 2 ? (
          <div className="bg-secondary/40 border border-dashed border-border/80 p-8 rounded-2xl text-center space-y-3 my-4">
            <Info className="w-10 h-10 text-primary mx-auto opacity-80" />
            <h3 className="text-lg font-bold text-foreground">Not Enough Data to Compare</h3>
            <p className="text-sm text-secondary-foreground max-w-md mx-auto">
              Upload at least 2 {category} reports over time to visualize parameter trends on a comparison graph.
            </p>
          </div>
        ) : (
          <div className="space-y-6 mt-2">
            <div className="text-sm text-secondary-foreground font-medium">
              Showing {data.count} reports across {timespan}
            </div>

            {/* Parameter Selector Checkboxes */}
            <div className="flex flex-wrap gap-2.5 p-3 bg-secondary/30 rounded-2xl border border-border/40">
              {paramKeys.map((param, index) => {
                const color = LINE_COLORS[index % LINE_COLORS.length];
                const isChecked = selectedParams[param] !== false;
                return (
                  <label
                    key={param}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      isChecked
                        ? "bg-card border-primary/40 shadow-sm text-foreground"
                        : "bg-transparent border-transparent opacity-60 text-secondary-foreground"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleToggleParam(param)}
                      className="sr-only"
                    />
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span>{param}</span>
                  </label>
                );
              })}
            </div>

            {/* Recharts LineChart */}
            <div className="bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#7A8A92" fontSize={12} tickLine={false} />
                  <YAxis stroke="#7A8A92" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: "12px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      border: "1px solid #E2E8F0",
                    }}
                    formatter={(value, name) => [
                      `${value} ${paramsMap[name]?.unit || ""}`,
                      name,
                    ]}
                  />
                  <Legend verticalAlign="bottom" height={36} />

                  {paramKeys.map((param, index) => {
                    if (selectedParams[param] === false) return null;
                    const color = LINE_COLORS[index % LINE_COLORS.length];
                    return (
                      <Line
                        key={param}
                        type="monotone"
                        dataKey={param}
                        stroke={color}
                        strokeWidth={2.5}
                        dot={{ r: 5, fill: color }}
                        activeDot={{ r: 8 }}
                        connectNulls
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Trend Summary Indicators Table */}
            <div>
              <h4 className="text-sm font-bold font-display text-foreground mb-3">Parameter Trends Summary</h4>
              <div className="grid gap-2">
                {paramKeys.map((param, index) => {
                  const values = paramsMap[param].values.filter((v) => v !== null && v !== undefined);
                  if (values.length === 0) return null;

                  const firstVal = values[0];
                  const latestVal = values[values.length - 1];
                  const diff = latestVal - firstVal;
                  const percentChange = firstVal !== 0 ? (diff / firstVal) * 100 : 0;
                  const unit = paramsMap[param].unit || "";

                  const isStable = Math.abs(percentChange) < 5;
                  const isIncreasing = diff > 0;
                  const goodTrend = isIncreaseGood(param) ? isIncreasing : !isIncreasing;

                  let trendColor = "text-slate-500 bg-slate-50 border-slate-200";
                  let Icon = Minus;

                  if (!isStable) {
                    if (isIncreasing) {
                      Icon = ArrowUp;
                      trendColor = goodTrend
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-red-700 bg-red-50 border-red-200";
                    } else {
                      Icon = ArrowDown;
                      trendColor = goodTrend
                        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                        : "text-red-700 bg-red-50 border-red-200";
                    }
                  }

                  const color = LINE_COLORS[index % LINE_COLORS.length];

                  return (
                    <div
                      key={param}
                      className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl border border-border/40 text-sm"
                    >
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span>{param}</span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <span>
                          Current: <strong>{latestVal} {unit}</strong>
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border ${trendColor}`}>
                          <Icon className="w-3 h-3" />
                          {isStable ? "Stable" : `${Math.abs(percentChange).toFixed(1)}%`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
