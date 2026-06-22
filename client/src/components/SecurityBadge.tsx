import { Shield, ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react';
import { useState } from 'react';
import type { SecurityScore, SecurityScoreBreakdown } from '../types';
import { getGradeStyle, SCORE_DIMENSION_LABELS, getScoreColor } from '../security';

interface SecurityBadgeProps {
  score: SecurityScore;
  size?: 'sm' | 'md';
  showTooltip?: boolean;
}

const ShieldIconByGrade = {
  'A+': ShieldCheck,
  'A': ShieldCheck,
  'B': Shield,
  'C': Shield,
  'D': ShieldAlert,
  'F': ShieldX,
};

export default function SecurityBadge({ score, size = 'sm', showTooltip = true }: SecurityBadgeProps) {
  const [hover, setHover] = useState(false);
  const style = getGradeStyle(score.grade);
  const ShieldIcon = ShieldIconByGrade[score.grade] || Shield;

  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs gap-1'
    : 'px-3 py-1 text-sm gap-1.5';

  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <div className="relative inline-block">
      <span
        className={`badge inline-flex items-center border ${style.badgeClass} ${sizeClasses}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <ShieldIcon size={iconSize} />
        <span className="font-bold tracking-wide">{style.label}</span>
        <span className="opacity-80 font-normal">{score.total}</span>
      </span>

      {showTooltip && hover && (
        <div className="absolute z-50 top-full left-0 mt-2 w-72 p-3 bg-white border border-slate-200 rounded-lg shadow-xl">
          <div className="flex items-start gap-2 pb-2 border-b border-slate-100">
            <div className={`p-1.5 rounded-lg ${style.bgClass}`}>
              <ShieldIcon size={16} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${style.textClass}`}>
                  {style.label} 级安全评分
                </span>
                <span className="text-lg font-bold text-slate-800">{score.total}</span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{style.description}</p>
            </div>
          </div>

          <div className="pt-2 space-y-1.5">
            {(Object.keys(score.breakdown) as Array<keyof SecurityScoreBreakdown>).map((key) => {
              const dim = SCORE_DIMENSION_LABELS[key];
              const value = score.breakdown[key];
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="w-14 shrink-0 text-slate-400">{dim.icon} {dim.label}</span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${value}%`,
                        background: getScoreColor(value),
                      }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-slate-600">{value}</span>
                  <span className="w-8 text-right text-slate-400">{dim.weight}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center gap-1 text-[10px] text-slate-400">
            <Info size={10} />
            悬停查看各维度详细评分
          </div>
        </div>
      )}
    </div>
  );
}
