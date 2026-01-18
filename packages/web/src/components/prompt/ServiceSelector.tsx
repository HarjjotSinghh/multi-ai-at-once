'use client';

import { AIServiceName } from '@multi-ai/core';
import { getServiceMetadata, getAvailableServices } from '@/lib/services/constants';
import { useConfig, useAppStore } from '@/store';
import { cn } from '@/lib/utils/cn';

export function ServiceSelector() {
  const config = useConfig();
  const setSelectedServices = useAppStore((state) => state.setSelectedServices);

  const availableServices = getAvailableServices();
  const selectedServices = config.defaultServices;

  const toggleService = (service: AIServiceName) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {availableServices.map((service) => {
        const metadata = getServiceMetadata(service);
        const isSelected = selectedServices.includes(service);

        return (
          <button
            type="button"
            key={service}
            onClick={() => toggleService(service)}
            className={cn(
              'group flex items-center gap-3 px-4 py-2 border transition-all duration-200 font-mono text-xs uppercase tracking-widest relative overflow-hidden',
              isSelected
                ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-[0_0_15px_rgba(0,255,157,0.15)]'
                : 'border-white/10 bg-cyber-dark text-cyber-text-muted hover:border-neon-blue hover:text-neon-blue hover:bg-neon-blue/5'
            )}
            aria-pressed={isSelected}
          >
            {/* LED Indicator */}
            <span
              className={cn(
                "w-1.5 h-1.5 transition-all duration-300 shadow-[0_0_5px_currentColor]",
                isSelected ? "opacity-100 bg-current" : "opacity-30 bg-current group-hover:opacity-100"
              )}
            />
            
            <span>{metadata.displayName}</span>
            
            {/* Tech Decoration */}
            {isSelected && (
                <span className="absolute top-0 right-0 w-[2px] h-[2px] bg-current"></span>
            )}
             {isSelected && (
                <span className="absolute bottom-0 left-0 w-[2px] h-[2px] bg-current"></span>
            )}
          </button>
        );
      })}
    </div>
  );
}
