'use client';

import React, { useState } from 'react';
import { Icons } from '../ui/Icons';

export interface PrerequisiteAssetItem {
  id: string;
  name: string;
  status: 'Received' | 'Pending';
}

interface PrerequisiteAssetsCardProps {
  onToast?: (msg: string) => void;
}

export const PrerequisiteAssetsCard: React.FC<PrerequisiteAssetsCardProps> = ({
  onToast,
}) => {
  const [assets, setAssets] = useState<PrerequisiteAssetItem[]>([
    {
      id: 'asset_1',
      name: '1. Master Figma Design Kit & Tokens',
      status: 'Received',
    },
    {
      id: 'asset_2',
      name: '2. Lottie Motion Specs & Sound Assets',
      status: 'Received',
    },
    {
      id: 'asset_3',
      name: '3. Brand Colour Codes & Guideline PDF',
      status: 'Pending',
    },
  ]);

  const [isAdding, setIsAdding] = useState(false);
  const [newAssetName, setNewAssetName] = useState('');

  const handleToggleStatus = (id: string) => {
    setAssets((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const newStatus = item.status === 'Received' ? 'Pending' : 'Received';
        if (onToast) {
          onToast(
            `Marked "${item.name}" as ${
              newStatus === 'Received' ? 'Received ✓' : 'Pending'
            }`
          );
        }
        return { ...item, status: newStatus };
      })
    );
  };

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;
    const newItem: PrerequisiteAssetItem = {
      id: `asset_${Date.now()}`,
      name: `${assets.length + 1}. ${newAssetName.trim()}`,
      status: 'Pending',
    };
    setAssets((prev) => [...prev, newItem]);
    setNewAssetName('');
    setIsAdding(false);
    if (onToast) {
      onToast(`Added required prerequisite asset from client!`);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-slate-100">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
          Prerequisite Assets
        </h3>
        <span className="text-[11px] font-medium text-slate-400">
          Received from client
        </span>
      </div>

      {/* Asset List */}
      <div className="space-y-2.5">
        {assets.map((asset) => {
          const isReceived = asset.status === 'Received';
          return (
            <div
              key={asset.id}
              className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/70 hover:bg-slate-50 border border-slate-100 transition-colors"
            >
              <span className="text-xs font-medium text-slate-800 leading-snug">
                {asset.name}
              </span>

              <button
                type="button"
                onClick={() => handleToggleStatus(asset.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer shadow-2xs active:scale-[0.98] ${
                  isReceived
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200/70'
                    : 'bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200/70'
                }`}
                title="Click to toggle status"
              >
                {isReceived ? 'Received ✓' : 'Pending'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Add New Prerequisite Item */}
      {isAdding ? (
        <form onSubmit={handleAddAsset} className="mt-3 flex items-center gap-2">
          <input
            type="text"
            placeholder="e.g. 4K Raw Footage B-Roll Drive Link"
            value={newAssetName}
            onChange={(e) => setNewAssetName(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-2.5 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="mt-3 pt-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            <Icons.Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Request Additional Asset</span>
          </button>

          <span className="text-[10px] text-slate-400">
            Click badge to toggle status
          </span>
        </div>
      )}
    </div>
  );
};

