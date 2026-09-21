import React, { useState } from 'react';
import { Inmate, InmatePropertyItem, Language } from '../../types';
import { 
  Lock, 
  Unlock, 
  FileDown, 
  Printer, 
  ShieldCheck, 
  Coins, 
  Watch, 
  Smartphone, 
  FileText, 
  Shirt, 
  Plus, 
  Search, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Building,
  KeyRound,
  CheckSquare,
  Square
} from 'lucide-react';
import { PropertyReportModal } from './PropertyReportModal';
import { downloadPropertyDischargePdf } from './propertyPdfGenerator';

interface PropertyVaultProps {
  inmate: Inmate;
  onUpdateInmate?: (updatedInmate: Inmate) => void;
  language?: Language;
  showDischargeActions?: boolean;
  onDischargeVerified?: () => void;
}

export const PropertyVault: React.FC<PropertyVaultProps> = ({
  inmate,
  onUpdateInmate,
  language = 'en',
  showDischargeActions = true,
  onDischargeVerified
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isExportingDirect, setIsExportingDirect] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [verifiedSeals, setVerifiedSeals] = useState<Record<string, boolean>>(() => {
    // Initial verification state for items
    const initial: Record<string, boolean> = {};
    inmate.propertyItems.forEach(item => {
      initial[item.id] = true;
    });
    return initial;
  });

  // New property item form state
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InmatePropertyItem['category']>('electronics');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemCondition, setNewItemCondition] = useState('Good condition');
  const [newItemSerial, setNewItemSerial] = useState('');
  const [newItemSeal, setNewItemSeal] = useState(`VAULT-SEC-${Math.floor(1000 + Math.random() * 9000)}`);

  // Filtered items
  const filteredItems = inmate.propertyItems.filter(item => {
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSeal = item.sealBagNumber.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchSerial = item.serialOrDetail?.toLowerCase().includes(q) || false;
      if (!matchSeal && !matchDesc && !matchSerial) return false;
    }
    return true;
  });

  // Calculate totals
  const totalItemsCount = inmate.propertyItems.reduce(
    (acc, p) => acc + (p.category === 'cash' ? 1 : p.quantity),
    0
  );
  const totalCashDeposited = inmate.propertyItems
    .filter(p => p.category === 'cash')
    .reduce((acc, p) => acc + p.quantity, 0);

  // Quick Direct PDF Export handler
  const handleDirectExportPdf = async () => {
    try {
      setIsExportingDirect(true);
      await downloadPropertyDischargePdf(inmate);
      if (onDischargeVerified) {
        onDischargeVerified();
      }
    } catch (err) {
      console.error('Error generating direct PDF:', err);
    } finally {
      setIsExportingDirect(false);
    }
  };

  // Toggle seal verification checkbox
  const handleToggleSealCheck = (itemId: string) => {
    setVerifiedSeals(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Toggle returned on exit
  const handleToggleReturnStatus = (item: InmatePropertyItem) => {
    if (!onUpdateInmate) return;
    const newStatus = item.status === 'returned_on_exit' ? 'held_in_vault' : 'returned_on_exit';
    const updatedItems = inmate.propertyItems.map(p => 
      p.id === item.id ? { ...p, status: newStatus as any } : p
    );
    onUpdateInmate({
      ...inmate,
      propertyItems: updatedItems
    });
  };

  // Add new item to vault
  const handleAddProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemDesc.trim() || !onUpdateInmate) return;

    const newItem: InmatePropertyItem = {
      id: `prop-${Date.now()}`,
      description: newItemDesc.trim(),
      category: newItemCategory,
      quantity: Number(newItemQty) || 1,
      condition: newItemCondition.trim() || 'Intact',
      serialOrDetail: newItemSerial.trim() || undefined,
      sealBagNumber: newItemSeal.trim() || `VAULT-BAG-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'held_in_vault'
    };

    const updatedInmate: Inmate = {
      ...inmate,
      propertyItems: [...inmate.propertyItems, newItem],
      chatterLogs: [
        {
          id: `ch-${Date.now()}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          author: 'Property Vault Custodian',
          message: `Added new sealed property item: ${newItem.description} (Bag: ${newItem.sealBagNumber})`,
          type: 'activity'
        },
        ...inmate.chatterLogs
      ]
    };

    onUpdateInmate(updatedInmate);
    setIsAddModalOpen(false);
    setNewItemDesc('');
    setNewItemSerial('');
    setNewItemSeal(`VAULT-SEC-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const getCategoryIcon = (category: InmatePropertyItem['category']) => {
    switch (category) {
      case 'cash':
        return <Coins className="w-4 h-4 text-emerald-600" />;
      case 'electronics':
        return <Smartphone className="w-4 h-4 text-blue-600" />;
      case 'jewelry':
        return <Watch className="w-4 h-4 text-amber-600" />;
      case 'documents':
        return <FileText className="w-4 h-4 text-purple-600" />;
      case 'clothing':
        return <Shirt className="w-4 h-4 text-slate-600" />;
      default:
        return <Lock className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Property Vault Header Card */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-700 border border-amber-200 rounded-lg">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  Property Vault & Secure Valuables Storage
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  BAY: LOCKER-{inmate.cellLocation.split('-')[0] || 'A1'}-{inmate.bookingNumber.slice(-3)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Official Prisons Act intake property repository. Tamper-evident bags catalogued for lawful custody & discharge restitution.
              </p>
            </div>
          </div>

          {/* Prominent Action Buttons: Export PDF & Preview */}
          <div className="flex items-center gap-2 flex-wrap">
            {onUpdateInmate && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Deposit</span>
              </button>
            )}

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              title="Preview formal sign-off document with official layout"
            >
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span>Preview Sign-Off Sheet</span>
            </button>

            <button
              onClick={handleDirectExportPdf}
              disabled={isExportingDirect}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Export formal, timestamped PDF report for discharge sign-off"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingDirect ? 'Exporting PDF...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Status Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500">Vaulted Containers</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5">
              {inmate.propertyItems.length} <span className="text-xs font-normal text-slate-500">bags</span>
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3 h-3" />
              <span>Tamper seals intact</span>
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500">Cash Currency (Vault)</div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 font-mono">
              KES {totalCashDeposited.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Liquidated upon gate release
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500">Labor Gratuity</div>
            <div className="text-lg font-bold text-emerald-700 mt-0.5 font-mono">
              ${inmate.gratuityBalance.toFixed(2)}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Discharge warrant payout
            </div>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-500">Discharge Sign-Off</div>
            <div className="text-xs font-bold text-amber-800 mt-1 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
              <span>FORM NPS-PR-7B</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              3 signatures + thumbprint
            </div>
          </div>
        </div>
      </div>

      {/* Discharge Handover Action Banner (When relevant to exit/discharge) */}
      {showDischargeActions && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 bg-amber-500 text-white rounded-md mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">
                Discharge Property Restitution Protocol & Exit Audit
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Generate the timestamped property report for physical counter-signature by the inmate, releasing custodian, and gate superintendent before unlocking locker.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-md border border-slate-300 shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Sign-Off Docket</span>
            </button>

            <button
              onClick={handleDirectExportPdf}
              disabled={isExportingDirect}
              className="px-3 py-1.5 bg-[#714B67] hover:bg-[#5e3c55] text-white text-xs font-bold rounded-md shadow-2xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>{isExportingDirect ? 'Exporting...' : 'Export PDF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {['ALL', 'cash', 'electronics', 'jewelry', 'documents', 'clothing'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md capitalize font-semibold transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search bag #, description, IMEI..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:border-amber-500 outline-none"
          />
        </div>
      </div>

      {/* Itemized Table of Vault Items */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-xs">
        {filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">#</th>
                  <th className="py-2.5 px-3">Seal Bag #</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Description & Specifications</th>
                  <th className="py-2.5 px-3">Intake Condition</th>
                  <th className="py-2.5 px-3 text-center">Qty / Denom</th>
                  <th className="py-2.5 px-3 text-center">Seal Verification</th>
                  <th className="py-2.5 px-3 text-center">Vault Status</th>
                  {onUpdateInmate && <th className="py-2.5 px-3 text-right">Action</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => {
                  const isSealVerified = verifiedSeals[item.id] !== false;
                  const isReturned = item.status === 'returned_on_exit';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-amber-600" />
                          <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {item.sealBagNumber}
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 capitalize font-medium text-slate-700">
                          {getCategoryIcon(item.category)}
                          <span>{item.category}</span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <div>{item.description}</div>
                        {item.serialOrDetail && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            Serial / Ref: {item.serialOrDetail}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-slate-600">
                        <span className="inline-block bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {item.condition || 'Good'}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.category === 'cash' ? `KES ${item.quantity.toLocaleString()}` : item.quantity}
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSealCheck(item.id)}
                          className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-semibold transition-colors ${
                            isSealVerified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                              : 'bg-amber-50 text-amber-700 border border-amber-300'
                          }`}
                        >
                          {isSealVerified ? (
                            <>
                              <CheckSquare className="w-3 h-3 text-emerald-600" />
                              <span>Seal Intact</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-3 h-3 text-amber-600" />
                              <span>Unverified</span>
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isReturned
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          {item.status.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {onUpdateInmate && (
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleToggleReturnStatus(item)}
                            className={`text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                              isReturned
                                ? 'text-amber-700 hover:bg-amber-50'
                                : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {isReturned ? 'Re-vault Item' : 'Mark Handed Over'}
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="font-semibold text-slate-700">No matching property items in vault</div>
            <p className="mt-1 text-slate-400">
              {searchQuery ? 'Try clearing the search filter.' : 'No property was deposited during intake.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal: Add Item to Vault */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h4 className="text-sm font-bold flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                Deposit Property to Vault
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProperty} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Seal Bag Number</label>
                <input
                  type="text"
                  value={newItemSeal}
                  onChange={e => setNewItemSeal(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Item Description</label>
                <input
                  type="text"
                  value={newItemDesc}
                  onChange={e => setNewItemDesc(e.target.value)}
                  placeholder="e.g. Leather Wallet with ID & Bank Cards"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded bg-white"
                  >
                    <option value="cash">Cash Money</option>
                    <option value="electronics">Electronics / Phone</option>
                    <option value="jewelry">Jewelry / Watch</option>
                    <option value="documents">Official Documents</option>
                    <option value="clothing">Civilian Clothing</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {newItemCategory === 'cash' ? 'Amount (KES)' : 'Quantity'}
                  </label>
                  <input
                    type="number"
                    value={newItemQty}
                    onChange={e => setNewItemQty(Number(e.target.value))}
                    min={1}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Serial No / IMEI / Distinguishing Marks
                </label>
                <input
                  type="text"
                  value={newItemSerial}
                  onChange={e => setNewItemSerial(e.target.value)}
                  placeholder="e.g. SN-492019, IMEI-358992..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Physical Condition</label>
                <input
                  type="text"
                  value={newItemCondition}
                  onChange={e => setNewItemCondition(e.target.value)}
                  placeholder="e.g. Good working order, pristine, minor scratches"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded"
                >
                  Confirm Vault Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Formal PDF Report & Print Modal */}
      <PropertyReportModal
        inmate={inmate}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onConfirmSignOff={() => {
          if (onDischargeVerified) {
            onDischargeVerified();
          }
        }}
      />
    </div>
  );
};
