"use client";

import React from "react";
import { Smartphone, Laptop, Tablet, Globe, MapPin } from "lucide-react";

interface DeviceItem {
  label: string;
  value: number;
}

interface CountryItem {
  name: string;
  count?: number;
  pct: number;
}

interface DeviceLocationBreakdownProps {
  devices: DeviceItem[];
  countries: CountryItem[];
}

const deviceIcons: Record<string, React.ComponentType<any>> = {
  Mobile: Smartphone,
  Desktop: Laptop,
  Tablet: Tablet,
  Other: Globe,
};

export function DeviceLocationBreakdown({
  devices,
  countries,
}: DeviceLocationBreakdownProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 1. Device Breakdown Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Device Breakdown
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Visitor distribution by hardware form factor
            </p>
          </div>
        </div>

        {devices.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
            No device telemetry captured yet.
          </div>
        ) : (
          <div className="space-y-4">
            {devices.map((device) => {
              const Icon = deviceIcons[device.label] || Globe;

              return (
                <div key={device.label} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-zinc-500" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {device.label}
                      </span>
                    </div>

                    <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                      {device.value}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-600 dark:bg-brand-500 transition-all duration-300"
                      style={{ width: `${Math.max(device.value, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Top Locations Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200/80 dark:border-zinc-800 p-5 sm:p-6 shadow-subtle space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-zinc-800/80 pb-3.5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              Top Locations
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">
              Geographic origins of profile visitors
            </p>
          </div>
        </div>

        {countries.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500">
            No geographical locations recorded yet.
          </div>
        ) : (
          <div className="space-y-3.5">
            {countries.map((country) => (
              <div key={country.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {country.name}
                  </span>

                  <span className="font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    {country.pct}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-500 dark:bg-sky-400 transition-all duration-300"
                    style={{ width: `${Math.max(country.pct, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
