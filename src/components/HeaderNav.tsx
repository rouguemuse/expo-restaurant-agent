import React from 'react';
import {
  AlertTriangle,
  PhoneCall,
  GitPullRequest,
  Activity,
  Info,
} from 'lucide-react';

export function HeaderNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const tabs = [
    { id: 'incident-queue', label: 'Incidents Queue', badge: '7 Active', icon: AlertTriangle },
    { id: 'scenario-workbench', label: 'Scenario 1: Lost Modifier', badge: 'INC-8492', icon: GitPullRequest },
    { id: 'call-explorer', label: 'Call & Trace Explorer', icon: PhoneCall },
    { id: 'account-health', label: 'Account Health', badge: 'Sidecar Pizza', icon: Activity },
    { id: 'about-portfolio', label: 'About EXPO', icon: Info },
  ];

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black text-lg tracking-tighter shadow-md shadow-orange-950/50">
              EX
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold tracking-tight text-zinc-100 text-sm">EXPO</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                  Reliability Lab
                </span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80">
                  Live Cluster
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                Forward Deployed Engineering · Voice AI Systems
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center space-x-2 border-l border-zinc-800 pl-4 text-xs font-mono text-zinc-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>rest_sidecar_01</span>
          </div>
        </div>
      </div>
    </header>
  );
}
