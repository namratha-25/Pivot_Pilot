import React from 'react';
import { AlertCircle, RefreshCw, Sparkles } from 'lucide-react';

export const LoadingSkeleton: React.FC<{ rows?: number; title?: string }> = ({
  rows = 4,
  title = 'Analyzing with Gemini...',
}) => (
  <div className="bg-surface border border-line rounded-[20px] p-6 flex flex-col gap-5">
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-2 w-2/3">
        <div className="h-5 w-48 rounded-md bg-surface-mid animate-pulse" />
        <p className="text-sm text-ink-muted">{title}</p>
      </div>
      <div className="h-8 w-24 rounded-full bg-blush-tint animate-pulse" />
    </div>
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="h-14 rounded-[12px] bg-surface-low border border-line animate-pulse"
        />
      ))}
    </div>
  </div>
);

export const ErrorBanner: React.FC<{
  message: string;
  onRetry?: () => void;
  onEnableDemoMode?: () => void;
  demoMode?: boolean;
}> = ({ message, onRetry, onEnableDemoMode, demoMode }) => (
  <div
    role="alert"
    className="bg-danger-bg/60 border border-danger/30 rounded-[16px] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
  >
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-ink">AI request failed</span>
        <p className="text-sm text-ink-muted">{message}</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      {!demoMode && onEnableDemoMode && (
        <button
          type="button"
          onClick={onEnableDemoMode}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface border border-line text-ink text-xs font-medium hover:bg-surface-mid transition-colors whitespace-nowrap cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Use Demo Mode</span>
        </button>
      )}
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      )}
    </div>
  </div>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}> = ({ icon, title, description, actionLabel, onAction, secondaryLabel, onSecondary }) => (
  <div className="bg-surface border border-line rounded-[20px] p-8 sm:p-10 flex flex-col items-center text-center gap-4">
    <div className="w-12 h-12 rounded-[14px] bg-blush-tint text-primary flex items-center justify-center">
      {icon}
    </div>
    <div className="flex flex-col gap-1.5 max-w-md">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="text-sm text-ink-muted leading-relaxed">{description}</p>
    </div>
    <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
      {secondaryLabel && onSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-blush-soft text-primary-deep text-sm font-medium hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer"
        >
          {secondaryLabel}
        </button>
      )}
    </div>
  </div>
);

export const ReadinessRing: React.FC<{
  score: number;
  size?: number;
  subtitle?: string;
}> = ({ score, size = 172, subtitle = 'Readiness' }) => {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--pp-line)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--pp-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 400ms cubic-bezier(0.2, 0, 0, 1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-4xl font-bold text-ink tabular-nums tracking-tight">
          {clamped}%
        </span>
        <span className="text-xs font-medium text-ink-muted mt-0.5">{subtitle}</span>
      </div>
    </div>
  );
};
