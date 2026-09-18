import React from 'react';
import { 
  Plus, 
  List, 
  LayoutGrid, 
  SlidersHorizontal, 
  Download, 
  Printer, 
  RotateCw, 
  Search,
  Filter,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';

interface OdooSubNavbarProps {
  currentModule: string;
  viewMode: 'list' | 'kanban' | 'form';
  onViewModeChange: (mode: 'list' | 'kanban') => void;
  onNewClick: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
  totalRecords: number;
  filteredCount: number;
  title: string;
  onActionClick?: (action: string) => void;
}

export const OdooSubNavbar: React.FC<OdooSubNavbarProps> = ({
  currentModule,
  viewMode,
  onViewModeChange,
  onNewClick,
  searchTerm,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  totalRecords,
  filteredCount,
  title,
  onActionClick
}) => {
  const filterOptions = [
    { id: 'all', label: 'All Inmates' },
    { id: 'remand', label: 'Remand (Awaiting Trial)' },
    { id: 'convicted', label: 'Convicted (Serving)' },
    { id: 'cat_a', label: 'Category A (High Risk)' },
    { id: 'escaped', label: 'Escaped Alert' },
    { id: 'in_transit', label: 'In Transit' },
    { id: 'stage_4', label: 'Stage 4 (Pre-Release)' },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xs">
      {/* Left: Breadcrumbs & Action Buttons */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center space-x-2">
          <h1 className="text-base font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-medium">
            {filteredCount} {filteredCount === 1 ? 'record' : 'records'}
          </span>
        </div>

        {/* Action Buttons: New & Action dropdown */}
        <div className="flex items-center space-x-1.5">
          <button
            id="odoo-new-btn"
            onClick={onNewClick}
            className="flex items-center space-x-1 bg-[#714B67] hover:bg-[#5f3c54] text-white px-3 py-1.5 rounded text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Admission</span>
          </button>

          {/* Odoo Action dropdown */}
          <div className="relative group">
            <button
              className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded text-xs font-medium border border-slate-300/80 transition-colors"
            >
              <SlidersHorizontal className="w-3 h-3 text-slate-500" />
              <span>Action</span>
            </button>
            <div className="absolute left-0 mt-1 w-52 bg-white rounded-md shadow-lg border border-slate-200 py-1 hidden group-hover:block z-30">
              <button 
                onClick={() => onActionClick && onActionClick('export')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                Export Custody Roll (CSV)
              </button>
              <button 
                onClick={() => onActionClick && onActionClick('print_roll')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                Print National Muster Roll
              </button>
              <button 
                onClick={() => onActionClick && onActionClick('recalc_remission')}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <RotateCw className="w-3.5 h-3.5 text-purple-600" />
                Recalculate All Remissions
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Center/Right: Search, Filters & View Switchers */}
      <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap gap-y-2">
        {/* Search input with Odoo search badge */}
        <div className="relative flex-1 md:w-64 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="odoo-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search name, booking #, offense..."
            className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#714B67] focus:ring-1 focus:ring-[#714B67]"
          />
        </div>

        {/* Filter Quick Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto py-0.5">
          {filterOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectFilter(opt.id)}
              className={`px-2 py-1 rounded text-[11px] whitespace-nowrap transition-colors ${
                selectedFilter === opt.id
                  ? 'bg-[#714B67] text-white font-medium shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* View Switcher: List vs Kanban */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded border border-slate-200">
          <button
            id="view-list-btn"
            onClick={() => onViewModeChange('list')}
            className={`p-1 rounded ${
              viewMode === 'list' 
                ? 'bg-white text-[#714B67] shadow-xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="List (Tree) View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            id="view-kanban-btn"
            onClick={() => onViewModeChange('kanban')}
            className={`p-1 rounded ${
              viewMode === 'kanban' 
                ? 'bg-white text-[#714B67] shadow-xs font-bold' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Kanban Cards View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Pagination Indicator */}
        <div className="hidden sm:flex items-center space-x-1 text-xs text-slate-500 pl-1 border-l border-slate-200">
          <span>1 - {filteredCount} / {totalRecords}</span>
          <button className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button className="p-0.5 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
