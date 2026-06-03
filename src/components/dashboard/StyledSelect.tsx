"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface StyledSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  color?: string;
}

interface StyledSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: StyledSelectOption[];
  placeholder?: string;
}

export default function StyledSelect({ value, onChange, options, placeholder = "Select..." }: StyledSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium
          transition-all duration-200 cursor-pointer
          bg-gray-50 dark:bg-zinc-800
          ${open
            ? "border-purple-400 dark:border-purple-500 ring-2 ring-purple-500/20"
            : "border-gray-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-zinc-600"
          }
        `}
      >
        {selected?.icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${selected.color || "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
            {selected.icon}
          </span>
        )}
        <span className="flex-1 text-left text-gray-900 dark:text-white truncate">
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-1.5 max-h-[280px] overflow-y-auto styled-scrollbar">
            {options.map((option) => {
              const isActive = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150
                    ${isActive
                      ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-300"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800"
                    }
                  `}
                >
                  {option.icon && (
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm ${option.color || "bg-gradient-to-br from-purple-500 to-pink-500"}`}>
                      {option.icon}
                    </span>
                  )}
                  <span className="flex-1 text-left">{option.label}</span>
                  {isActive && (
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
