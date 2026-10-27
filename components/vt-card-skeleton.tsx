'use client';

import React from 'react';

interface VtCardSkeletonGridProps {
  count?: number;
  label?: string;
}

export function VtCardSkeletonGrid({
  count = 4,
  label = 'Memuat repositori preset VT & menyaring tautan...',
}: VtCardSkeletonGridProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="space-y-3"
    >
      <span className="sr-only">{label}</span>

      {Array.from({length: count}).map((_, index) => (
        <div
          key={`vt-skeleton-${index}`}
          className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3.5 animate-pulse"
        >
          {/* GitHub Repo Header Row Shimmer */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-2 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-[#30363d] rounded" />
                <div className="h-4 w-48 sm:w-64 bg-[#30363d] rounded" />
                <div className="h-4 w-16 bg-[#21262d] border border-[#30363d] rounded-full" />
              </div>

              <div className="space-y-1.5">
                <div className="h-4 w-11/12 sm:w-4/5 bg-[#21262d] rounded" />
                <div className="h-3.5 w-2/3 sm:w-1/2 bg-[#21262d] rounded" />
              </div>

              {/* GitHub Repo Bottom Metadata Row Shimmer */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <div className="h-3.5 w-24 bg-[#30363d] rounded" />
                <div className="h-3.5 w-20 bg-[#30363d] rounded" />
                <div className="h-3.5 w-20 bg-[#21262d] rounded" />
                <div className="h-3.5 w-24 bg-[#21262d] rounded" />
              </div>
            </div>

            {/* Right Action Buttons Shimmer */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
              <div className="col-span-2 sm:col-span-1 h-8 w-full sm:w-36 bg-[#238636]/40 rounded-md" />
              <div className="h-8 w-full sm:w-24 bg-[#21262d] border border-[#30363d] rounded-md" />
              <div className="h-8 w-full sm:w-20 bg-[#21262d] border border-[#30363d] rounded-md" />
            </div>
          </div>

          {/* Filtered Preset Links Box Shimmer */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
              <div className="h-3.5 w-48 bg-[#21262d] rounded" />
              <div className="h-3.5 w-28 bg-[#21262d] rounded" />
            </div>

            <div className="space-y-1.5">
              {[0, 1, 2].map((rowIdx) => (
                <div
                  key={`skeleton-link-${index}-${rowIdx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 px-2.5 rounded bg-[#161b22] border border-[#30363d]/70"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-3.5 w-3.5 bg-[#30363d] rounded shrink-0" />
                    <div className="h-3.5 w-28 bg-[#30363d] rounded shrink-0" />
                    <div className="h-3.5 w-full max-w-md bg-[#21262d] rounded" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5 shrink-0">
                    <div className="h-6 w-14 bg-[#21262d] rounded" />
                    <div className="h-6 w-14 bg-[#21262d] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
