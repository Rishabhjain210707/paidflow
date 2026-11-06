import React from 'react';
import { Icons } from './Icons';

interface EmptyStateProps {
  icon?: keyof typeof Icons;
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: keyof typeof Icons;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/**
 * EmptyState displays helpful contextual guidance when a list, filter,
 * or pipeline has no active records, preventing awkward blank spaces.
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'FileText',
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}) => {
  const IconComponent = Icons[icon] || Icons.FileText;
  const PrimaryActionIcon = primaryAction?.icon ? Icons[primaryAction.icon] : null;

  return (
    <div
      className={`bg-white rounded-2xl border border-dashed border-slate-300 p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-2xs ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4 shadow-2xs">
        <IconComponent className="w-7 h-7 stroke-[2]" />
      </div>

      <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mb-1.5">
        {title}
      </h4>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mb-6">
        {description}
      </p>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full justify-center">
          {primaryAction && (
            <button
              type="button"
              onClick={primaryAction.onClick}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {PrimaryActionIcon && <PrimaryActionIcon className="w-3.5 h-3.5" />}
              <span>{primaryAction.label}</span>
            </button>
          )}

          {secondaryAction && (
            <button
              type="button"
              onClick={secondaryAction.onClick}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-[0.98] text-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <span>{secondaryAction.label}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

