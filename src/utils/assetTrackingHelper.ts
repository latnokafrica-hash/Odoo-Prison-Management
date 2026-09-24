import { EquipmentInventoryItem, AssetMaintenanceLog, AssetHistoryEvent } from '../types';

/**
 * Generates deterministic, high-fidelity maintenance logs and lifecycle history
 * for any equipment item in the prison facility.
 */
export function enrichEquipmentWithAssetData(item: EquipmentInventoryItem): EquipmentInventoryItem {
  const assetTag = item.assetTag || `AST-${item.category.slice(0, 3).toUpperCase()}-${item.id.replace('eq-', '').padStart(3, '0')}`;
  const qrCode = item.qrCode || `PRISON-FACILITY-ASSET//TAG:${assetTag}//ID:${item.id}//LOC:${encodeURIComponent(item.storageLocation)}`;

  // Default Manufacturer & Model based on category
  let manufacturer = item.manufacturer;
  let modelNumber = item.modelNumber;
  let assignedCustodian = item.assignedCustodian || (item.category.includes('armory') ? 'Armorer Sgt. Otieno (KP-5521)' : 'Capt. Marcus Vance (KP-8421)');

  if (!manufacturer || !modelNumber) {
    switch (item.category) {
      case 'keys_security':
        manufacturer = 'Medeco High Security Locks Inc.';
        modelNumber = 'MED-MAXUM-M3';
        break;
      case 'armory_firearms':
        if (item.name.toLowerCase().includes('glock')) {
          manufacturer = 'Glock Ges.m.b.H.';
          modelNumber = 'G19-GEN5-9X19';
        } else if (item.name.toLowerCase().includes('mossberg')) {
          manufacturer = 'O.F. Mossberg & Sons';
          modelNumber = 'M590A1-TACTICAL-12GA';
        } else {
          manufacturer = 'Defense Technology Corp.';
          modelNumber = 'DEF-TEC-SPEC-2024';
        }
        break;
      case 'tactical_protection':
        if (item.name.toLowerCase().includes('helmet')) {
          manufacturer = 'Galvion Tactical Armor Systems';
          modelNumber = 'BATLSKIN-VIPER-P2';
        } else if (item.name.toLowerCase().includes('shield')) {
          manufacturer = 'Paulson Manufacturing';
          modelNumber = 'BS-3-CLEAR-POLY-120';
        } else {
          manufacturer = 'ASP Tactical Systems';
          modelNumber = 'TALON-AIRWEIGHT-26';
        }
        break;
      case 'radios_comms':
        manufacturer = 'Motorola Solutions';
        modelNumber = 'MOTOTRBO-DP4801e-UHF';
        break;
      case 'body_cameras':
        manufacturer = 'Axon Enterprise';
        modelNumber = 'AXON-BODY-3-LTE';
        break;
      case 'restraints_cuffs':
        manufacturer = 'Smith & Wesson Precision Restraints';
        modelNumber = 'SW-M100-DOUBLE-LOCK';
        break;
      default:
        manufacturer = 'Government Tactical Supplies Ltd.';
        modelNumber = 'STD-FACILITY-GEN';
    }
  }

  // Generate realistic maintenance logs if none exist
  const maintenanceLogs: AssetMaintenanceLog[] = item.maintenanceLogs || [
    {
      id: `mlog-${item.id}-01`,
      date: '2026-09-22',
      technician: 'Tech. Aaron Mwangi (Armory Workshop)',
      serviceType: 'Routine Inspection',
      description: `Quarterly mechanical tolerances, hinge lubrication, and structural integrity assessment for ${item.name}.`,
      status: item.condition === 'damaged' ? 'escalated' : 'passed',
      workOrderRef: item.workOrderRef,
      partsReplaced: item.condition === 'damaged' ? ['Retention Rivet H-9', 'Clear Visor Plate'] : undefined,
      nextServiceDueDate: '2026-12-15',
    },
    {
      id: `mlog-${item.id}-02`,
      date: '2026-06-18',
      technician: 'Senior Armorer Sgt. Otieno',
      serviceType: 'Preventative Service',
      description: 'Ultrasonic cleaning, corrosion prevention treatment, and cryptographic/tamper seal validation.',
      status: 'passed',
      nextServiceDueDate: '2026-09-22',
    },
    {
      id: `mlog-${item.id}-03`,
      date: '2026-03-10',
      technician: 'External Certified Inspector J. Reynolds',
      serviceType: 'Routine Inspection',
      description: 'Annual statutory security equipment compliance audit. Verified against ISO-9001 and Prison Security Protocol §44.',
      status: 'passed',
      nextServiceDueDate: '2026-06-18',
    }
  ];

  // If item is currently damaged, prepend an active corrective repair log
  if (item.condition === 'damaged' && !maintenanceLogs.some(m => m.serviceType === 'Corrective Repair')) {
    maintenanceLogs.unshift({
      id: `mlog-${item.id}-damaged`,
      date: '2026-09-23',
      technician: 'Tech. Aaron Mwangi (Armory Workshop)',
      serviceType: 'Corrective Repair',
      description: item.discrepancyNote || 'Flagged as damaged during handover check. Corrective maintenance work order dispatched.',
      status: 'escalated',
      workOrderRef: item.workOrderRef || 'WO-2026-0894',
      partsReplaced: ['Polycarbonate Face Shield', 'Chinstrap Rivet Assembly'],
      nextServiceDueDate: '2026-09-25 (Urgent)',
    });
  }

  // Generate asset history events if none exist
  const assetHistory: AssetHistoryEvent[] = item.assetHistory || [
    {
      id: `hist-${item.id}-01`,
      timestamp: '2026-09-23 13:45',
      event: 'Shift Verified',
      officer: 'Capt. Marcus Vance (KP-8421)',
      location: item.storageLocation,
      details: `Physical inventory verified during Morning-to-Afternoon watch changeover. Count: ${item.countedQty}/${item.expectedQty} ${item.unit}.`,
    },
    {
      id: `hist-${item.id}-02`,
      timestamp: '2026-09-23 06:00',
      event: 'Shift Verified',
      officer: 'Lt. Sarah Jenkins (KP-9022)',
      location: item.storageLocation,
      details: 'Night-to-Morning handover verification logged. Security seals intact.',
    },
    {
      id: `hist-${item.id}-03`,
      timestamp: '2026-09-18 14:10',
      event: item.condition === 'damaged' ? 'Condition Flagged' : 'Audit Reconciled',
      officer: 'Capt. Jonathan Hayes (KP-7890)',
      location: item.storageLocation,
      details: item.condition === 'damaged' 
        ? `Asset flagged for inspection during cell block tactical drill. Work order ${item.workOrderRef || 'WO-2026-0894'} generated.`
        : 'Weekly Armory Commander physical count reconciled. Zero discrepancies found.',
    },
    {
      id: `hist-${item.id}-04`,
      timestamp: '2025-11-04 09:30',
      event: 'Deployed to Post',
      officer: 'Dep. Warden Patrick Okello',
      location: item.storageLocation,
      details: 'Formally commissioned into active prison security roster and registered in Central Armory ledger.',
    },
    {
      id: `hist-${item.id}-05`,
      timestamp: '2025-10-15 11:00',
      event: 'Initial Calibration',
      officer: 'Armorer Sgt. Otieno (KP-5521)',
      location: 'Central Armory Workshop',
      details: 'Factory acceptance testing, serial number laser etching, and initial security seal application.',
    },
    {
      id: `hist-${item.id}-06`,
      timestamp: '2025-10-01 08:00',
      event: 'Procured',
      officer: 'Logistics Procurement Bureau',
      location: 'Receiving Dock',
      details: `Received from ${manufacturer} under National Correctional Supply Contract #NC-4402.`,
    }
  ];

  return {
    ...item,
    assetTag,
    qrCode,
    manufacturer,
    modelNumber,
    assignedCustodian,
    nextServiceDueDate: item.nextServiceDueDate || '2026-12-15',
    maintenanceLogs,
    assetHistory,
  };
}
