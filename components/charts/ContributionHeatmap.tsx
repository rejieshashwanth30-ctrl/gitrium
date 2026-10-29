"use client";

import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { GitCommit, Flame, TrendingUp, Loader2 } from "lucide-react";
import { gitriumApi, ContributionData } from "@/lib/services/gitriumApiService";

export function ContributionHeatmap() {
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);
  const [data, setData] = useState<ContributionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadContributions() {
      setIsLoading(true);
      try {
        const res = await gitriumApi.getContributions();
        if (res) {
          setData(res);
        }
      } catch (err) {
        console.warn("Contribution heatmap query error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadContributions();
  }, []);

  const heatmapDays = useMemo(() => data?.heatmapDays || [], [data?.heatmapDays]);

  // Split into 52 weeks (7 days per week)
  const weeks = useMemo(() => {
    const result = [];
    for (let i = 0; i < heatmapDays.length; i += 7) {
      result.push(heatmapDays.slice(i, i + 7));
    }
    return result;
  }, [heatmapDays]);

  const totalContributions = data?.totalContributions || 0;
  const currentStreak = data?.currentStreak || 0;

  // Contribution Heatmap Color Ramp
  const getLevelColor = (level: number) => {
    switch (level) {
      case 0:
        return "bg-[#303934] hover:bg-[#3D4943]"; // Empty
      case 1:
        return "bg-[#104938] hover:bg-[#165E49]"; // Low (Dark Emerald)
      case 2:
        return "bg-[#0E7051] hover:bg-[#138E67]"; // Medium (Deep Rich Green)
      case 3:
        return "bg-[#159A72] hover:bg-[#1BB687]"; // High (Emerald)
      case 4:
        return "bg-[#10B981] hover:bg-[#34D399]"; // Very High (Bright Non-Neon Emerald)
      default:
        return "bg-[#303934]";
    }
  };

  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

  return (
    <div className="w-full rounded-[11px] border border-[#27382F] bg-[#18201C] p-5 sm:p-6 text-[#F7F6F1] shadow-subtle">
      {/* Header and KPI summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-[#24352C]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#F7F6F1] flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-[#159A72]" />
            <span>Contribution Activity Cadence</span>
          </h3>
          <p className="text-xs text-[#A8B3AC] mt-0.5">
            Verified Git commits, pull requests, and AST transformations over the past 365 days
          </p>
        </div>

        {/* Subtle Ivory/Green Badges */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          {/* Streak Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#151A17] border border-[#27382F]">
            <Flame className="w-3.5 h-3.5 text-[#D97745]" />
            <span className="text-[#A8B3AC] text-[11px]">{currentStreak} DAY STREAK</span>
          </div>

          {/* Total Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-[5px] bg-[#18352B] border border-[#159A72]/30">
            <TrendingUp className="w-3.5 h-3.5 text-[#159A72]" />
            <span className="text-[#F7F6F1] font-bold text-[11px]">{totalContributions} CONTRIBUTIONS</span>
          </div>
        </div>
      </div>

      {/* Month Labels Bar */}
      <div className="hidden sm:flex justify-between text-[11px] text-[#7A857E] font-mono mb-2 px-1">
        {months.map((m, idx) => (
          <span key={idx}>{m}</span>
        ))}
      </div>

      {/* Grid Canvas — Horizontal Scroll Container without Page Overflow */}
      {isLoading ? (
        <div className="flex items-center justify-center h-28 font-mono text-xs text-[#7A857E] gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#159A72]" />
          <span>Indexing temporal commits...</span>
        </div>
      ) : heatmapDays.length === 0 ? (
        <div className="flex items-center justify-center h-28 font-mono text-xs text-[#7A857E]">
          <span>No contribution events recorded yet. Synchronize your repositories to populate cadence.</span>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2 scrollbar-thin">
          <div className="flex gap-[3px] min-w-[680px] justify-between">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-[3px]">
                {week.map((cell, dIdx) => (
                  <div
                    key={dIdx}
                    onMouseEnter={() => setHoveredCell({ date: cell.date, count: cell.count })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={cn(
                      "w-3 h-3 rounded-[2.5px] transition-transform duration-100 cursor-pointer hover:scale-125 hover:z-20",
                      getLevelColor(cell.level)
                    )}
                    title={`${cell.date}: ${cell.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Info & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-[#24352C] text-xs font-mono text-[#7A857E]">
        <div>
          {hoveredCell ? (
            <span className="text-[#F7F6F1]">
              <strong className="text-[#159A72]">{hoveredCell.count}</strong> contributions on {hoveredCell.date}
            </span>
          ) : (
            <span>Hover over squares to inspect daily audit nodes</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <span className="text-[10px]">Less</span>
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#303934]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#104938]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#0E7051]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#159A72]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#10B981]" />
          <span className="text-[10px]">More</span>
        </div>
      </div>
    </div>
  );
}
