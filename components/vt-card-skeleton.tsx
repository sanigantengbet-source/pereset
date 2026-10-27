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
      className="space-y-4"
    >
      <span className="sr-only">{label}</span>

      {Array.from({length: count}).map((_, index) => (
        <div
          key={`vt-skeleton-${index}`}
          className="bg-white border-2 border-[#111111] shadow-[4px_4px_0px_#111111] p-4 sm:p-5 space-y-4 animate-pulse"
        >
          {/* Neobrutalist Card Header Shimmer */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <div className="w-14 h-14 bg-[#F7B91C]/40 border-2 border-[#111111] shrink-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-40 sm:w-56 bg-[#111111]/15" />
                  <div className="h-4 w-16 bg-[#F7B91C]/40 border border-[#111111]" />
                </div>
                <div className="h-5 w-11/12 sm:w-4/5 bg-[#111111]/20" />
                <div className="h-3.5 w-2/3 sm:w-1/2 bg-[#111111]/10" />
              </div>
            </div>

            {/* Right Action Buttons Shimmer */}
            <div className="grid grid-cols-2 sm:flex items-center gap-2 shrink-0">
              <div className="col-span-2 sm:col-span-1 h-9 w-full sm:w-40 bg-[#F7B91C]/60 border-2 border-[#111111]" />
              <div className="h-9 w-full sm:w-24 bg-[#F6F5F0] border-2 border-[#111111]" />
              <div className="h-9 w-full sm:w-20 bg-[#F6F5F0] border-2 border-[#111111]" />
            </div>
          </div>

          {/* Filtered Preset Links Box Shimmer */}
          <div className="bg-[#F6F5F0] border-2 border-[#111111] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b-2 border-dashed border-[#111111]/30 pb-2">
              <div className="h-3.5 w-48 bg-[#111111]/15" />
              <div className="h-3.5 w-28 bg-[#111111]/15" />
            </div>

            <div className="space-y-2">
              {[0, 1, 2].map((rowIdx) => (
                <div
                  key={`skeleton-link-${index}-${rowIdx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 px-3 bg-white border-2 border-[#111111]"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className="h-3.5 w-3.5 bg-[#F25C05] border border-[#111111] shrink-0" />
                    <div className="h-3.5 w-28 bg-[#111111]/20 shrink-0" />
                    <div className="h-3.5 w-full max-w-md bg-[#111111]/10" />
                  </div>
                  <div className="flex items-center justify-end gap-1.5 shrink-0">
                    <div className="h-7 w-16 bg-[#F6F5F0] border border-[#111111]" />
                    <div className="h-7 w-16 bg-[#F7B91C]/50 border border-[#111111]" />
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
