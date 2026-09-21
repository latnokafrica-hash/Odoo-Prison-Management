import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { PrisonFacility, Inmate } from '../../types';
import { 
  FacilityIncident, 
  FacilityMapZone, 
  FacilityIncidentCategory, 
  FacilityIncidentSeverity 
} from '../../types';
import { 
  DEFAULT_FACILITY_ZONES, 
  INITIAL_FACILITY_INCIDENTS,
  calculateZoneRiskMetrics,
  getFacilityHotspotSummary
} from '../../data/facilityHotspotData';
import { 
  ShieldAlert, 
  HeartPulse, 
  AlertTriangle, 
  Flame, 
  Eye, 
  Sliders, 
  Layers, 
  MapPin, 
  Building2, 
  User, 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertOctagon, 
  X, 
  Activity, 
  Lock, 
  Maximize2, 
  Minimize2, 
  ShieldCheck, 
  Compass, 
  ChevronRight,
  TrendingUp,
  Siren,
  Stethoscope,
  Radio,
  Printer,
  ZoomIn,
  ZoomOut,
  Move,
  RotateCcw,
  Target,
  Crosshair,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  Scan,
  Grid
} from 'lucide-react';

interface FacilityHotspotViewProps {
  facilities: PrisonFacility[];
  inmates: Inmate[];
  selectedFacilityId: string;
  onSelectFacility: (id: string) => void;
  onNavigateToTransfers?: (facilityId?: string) => void;
  onOpenTransferModal?: (inmate: Inmate) => void;
  securityHeatmapEnabled?: boolean;
  onToggleSecurityHeatmap?: (enabled: boolean) => void;
  securityHeatmapMetric?: 'composite' | 'density' | 'ratio' | 'incidents';
  onSelectSecurityHeatmapMetric?: (metric: 'composite' | 'density' | 'ratio' | 'incidents') => void;
}

export const FacilityHotspotView: React.FC<FacilityHotspotViewProps> = ({
  facilities,
  inmates,
  selectedFacilityId,
  onSelectFacility,
  onNavigateToTransfers,
  onOpenTransferModal,
  securityHeatmapEnabled,
  onToggleSecurityHeatmap,
  securityHeatmapMetric,
  onSelectSecurityHeatmapMetric
}) => {
  // Current active facility (defaults to selected or first facility)
  const currentFacilityId = selectedFacilityId || (facilities[0]?.id ?? 'FAC-01');
  const facility = facilities.find(f => f.id === currentFacilityId) || facilities[0];

  // Incidents state (initialized with built-in historical data)
  const [incidents, setIncidents] = useState<FacilityIncident[]>(INITIAL_FACILITY_INCIDENTS);

  // Filters & display toggles
  const [categoryFilter, setCategoryFilter] = useState<FacilityIncidentCategory | 'all'>('all');
  const [timeframe, setTimeframe] = useState<'all' | '12m' | '6m' | '30d'>('all');
  const [severityFilter, setSeverityFilter] = useState<FacilityIncidentSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Security Heatmap Overlay State & Metric Controls
  const [internalHeatmapEnabled, setInternalHeatmapEnabled] = useState(true);
  const [internalHeatmapMetric, setInternalHeatmapMetric] = useState<'composite' | 'density' | 'ratio' | 'incidents'>('composite');

  const isSecurityHeatmapActive = securityHeatmapEnabled !== undefined ? securityHeatmapEnabled : internalHeatmapEnabled;
  const activeHeatmapMetric = securityHeatmapMetric !== undefined ? securityHeatmapMetric : internalHeatmapMetric;

  const toggleSecurityHeatmap = (val?: boolean) => {
    const next = val !== undefined ? val : !isSecurityHeatmapActive;
    if (onToggleSecurityHeatmap) {
      onToggleSecurityHeatmap(next);
    }
    setInternalHeatmapEnabled(next);
  };

  const selectHeatmapMetric = (metric: 'composite' | 'density' | 'ratio' | 'incidents') => {
    if (onSelectSecurityHeatmapMetric) {
      onSelectSecurityHeatmapMetric(metric);
    }
    setInternalHeatmapMetric(metric);
  };

  // Map layers and overlay toggles
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [heatIntensity, setHeatIntensity] = useState<number>(75); // 25 to 100
  const [showIncidentMarkers, setShowIncidentMarkers] = useState(true);
  const [showZones, setShowZones] = useState(true);
  const [showGuardSightlines, setShowGuardSightlines] = useState(true);
  const [mapTheme, setMapTheme] = useState<'tactical_dark' | 'blueprint_light'>('tactical_dark');

  // Zoom & Pan System (Scale from 1.0x overview to 4.5x detailed cell blocks)
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 500, y: 325 });
  const [isPanning, setIsPanning] = useState(false);
  const [isPanModeActive, setIsPanModeActive] = useState(false);
  const [dragStart, setDragStart] = useState<{ clientX: number; clientY: number; startPanX: number; startPanY: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('overview');
  const [showMiniMap, setShowMiniMap] = useState(true);

  // Base canvas dimensions
  const BASE_WIDTH = 1000;
  const BASE_HEIGHT = 650;

  // Compute dynamic viewBox coordinates based on zoom and pan
  const visibleWidth = BASE_WIDTH / zoom;
  const visibleHeight = BASE_HEIGHT / zoom;

  const minCenterX = visibleWidth / 2 - 50;
  const maxCenterX = BASE_WIDTH - visibleWidth / 2 + 50;
  const minCenterY = visibleHeight / 2 - 40;
  const maxCenterY = BASE_HEIGHT - visibleHeight / 2 + 40;

  const clampedCenterX = Math.max(minCenterX, Math.min(maxCenterX, pan.x));
  const clampedCenterY = Math.max(minCenterY, Math.min(maxCenterY, pan.y));

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef({ x: clampedCenterX, y: clampedCenterY });
  panRef.current = { x: clampedCenterX, y: clampedCenterY };

  const vbX = clampedCenterX - visibleWidth / 2;
  const vbY = clampedCenterY - visibleHeight / 2;
  const currentViewBox = `${vbX} ${vbY} ${visibleWidth} ${visibleHeight}`;

  // Selected item state for inspection drawer
  const [selectedIncident, setSelectedIncident] = useState<FacilityIncident | null>(null);
  const [selectedZone, setSelectedZone] = useState<FacilityMapZone | null>(null);
  const [hoveredIncident, setHoveredIncident] = useState<FacilityIncident | null>(null);
  const [hoveredZone, setHoveredZone] = useState<FacilityMapZone | null>(null);

  // Convert client cursor coordinates to 1000x650 SVG space
  const getSvgCoordinates = useCallback((clientX: number, clientY: number) => {
    if (!svgRef.current) return null;
    const pt = svgRef.current.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return null;
    const svgP = pt.matrixTransform(ctm.inverse());
    const pctX = Math.max(0, Math.min(100, (svgP.x / BASE_WIDTH) * 100));
    const pctY = Math.max(0, Math.min(100, (svgP.y / BASE_HEIGHT) * 100));
    return {
      svgX: svgP.x,
      svgY: svgP.y,
      pctX: Number(pctX.toFixed(1)),
      pctY: Number(pctY.toFixed(1))
    };
  }, []);

  // Zoom control helpers
  const zoomTo = useCallback((newZoom: number, targetX?: number, targetY?: number) => {
    const clampedZoom = Math.max(1.0, Math.min(5.0, Number(newZoom.toFixed(2))));
    setZoom(clampedZoom);
    if (targetX !== undefined && targetY !== undefined) {
      setPan({ x: targetX, y: targetY });
    }
    if (clampedZoom === 1.0) {
      setActivePreset('overview');
    } else {
      setActivePreset('custom');
    }
  }, []);

  const handleZoomIn = () => zoomTo(zoom + 0.5);
  const handleZoomOut = () => zoomTo(zoom - 0.5);
  const handleResetView = () => {
    setZoom(1.0);
    setPan({ x: 500, y: 325 });
    setActivePreset('overview');
  };

  const handleNudgePan = (dx: number, dy: number) => {
    const stepX = visibleWidth * 0.25;
    const stepY = visibleHeight * 0.25;
    setPan(prev => ({
      x: prev.x + dx * stepX,
      y: prev.y + dy * stepY
    }));
    setActivePreset('custom');
  };

  const focusOnZone = useCallback((zone: FacilityMapZone, targetZoom = 2.8) => {
    const targetX = ((zone.bounds.x + zone.bounds.width / 2) / 100) * BASE_WIDTH;
    const targetY = ((zone.bounds.y + zone.bounds.height / 2) / 100) * BASE_HEIGHT;
    setPan({ x: targetX, y: targetY });
    setZoom(targetZoom);
    setSelectedZone(zone);
    setSelectedIncident(null);
    setActivePreset(zone.id);
  }, []);

  const focusOnIncident = useCallback((incident: FacilityIncident, targetZoom = 3.2) => {
    const targetX = (incident.coordinates.x / 100) * BASE_WIDTH;
    const targetY = (incident.coordinates.y / 100) * BASE_HEIGHT;
    setPan({ x: targetX, y: targetY });
    setZoom(targetZoom);
    setSelectedIncident(incident);
    setSelectedZone(null);
    setActivePreset('custom');
  }, []);

  // Mouse & Touch Drag Pan event handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsPanning(true);
    setHasDragged(false);
    setDragStart({
      clientX: e.clientX,
      clientY: e.clientY,
      startPanX: clampedCenterX,
      startPanY: clampedCenterY
    });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isPanning || !dragStart || !svgRef.current) return;
    const dx = e.clientX - dragStart.clientX;
    const dy = e.clientY - dragStart.clientY;
    if (Math.hypot(dx, dy) > 4) {
      setHasDragged(true);
    }
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = visibleWidth / svgRect.width;
    const scaleY = visibleHeight / svgRect.height;
    setPan({
      x: dragStart.startPanX - dx * scaleX,
      y: dragStart.startPanY - dy * scaleY
    });
    setActivePreset('custom');
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  const handleTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsPanning(true);
      setHasDragged(false);
      setDragStart({
        clientX: touch.clientX,
        clientY: touch.clientY,
        startPanX: clampedCenterX,
        startPanY: clampedCenterY
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    if (!isPanning || !dragStart || !svgRef.current || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStart.clientX;
    const dy = touch.clientY - dragStart.clientY;
    if (Math.hypot(dx, dy) > 5) {
      setHasDragged(true);
    }
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = visibleWidth / svgRect.width;
    const scaleY = visibleHeight / svgRect.height;
    setPan({
      x: dragStart.startPanX - dx * scaleX,
      y: dragStart.startPanY - dy * scaleY
    });
    setActivePreset('custom');
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    setDragStart(null);
  };

  // Wheel zoom with passive: false to prevent background document scrolling
  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const svgRect = svgEl.getBoundingClientRect();
      if (!svgRect.width || !svgRect.height) return;

      const currentZ = zoomRef.current;
      const currentPan = panRef.current;

      const zoomFactor = e.deltaY < 0 ? 1.18 : 0.84;
      const nextZoom = Math.max(1.0, Math.min(5.0, Number((currentZ * zoomFactor).toFixed(2))));
      if (nextZoom === currentZ) return;

      // Mouse position within the SVG bounding box [0, 1]
      const mousePctX = Math.max(0, Math.min(1, (e.clientX - svgRect.left) / svgRect.width));
      const mousePctY = Math.max(0, Math.min(1, (e.clientY - svgRect.top) / svgRect.height));

      // Current visible dimensions and top-left corner
      const oldVbW = BASE_WIDTH / currentZ;
      const oldVbH = BASE_HEIGHT / currentZ;
      const oldVbX = currentPan.x - oldVbW / 2;
      const oldVbY = currentPan.y - oldVbH / 2;

      // Point in SVG coordinate space under the cursor
      const cursorSvgX = oldVbX + mousePctX * oldVbW;
      const cursorSvgY = oldVbY + mousePctY * oldVbH;

      // New visible dimensions
      const newVbW = BASE_WIDTH / nextZoom;
      const newVbH = BASE_HEIGHT / nextZoom;

      // Compute new top-left corner so cursorSvgX/Y remains at mousePctX/Y
      const newVbX = cursorSvgX - mousePctX * newVbW;
      const newVbY = cursorSvgY - mousePctY * newVbH;

      const newCenterX = newVbX + newVbW / 2;
      const newCenterY = newVbY + newVbH / 2;

      setZoom(nextZoom);
      setPan({ x: newCenterX, y: newCenterY });
      setActivePreset(nextZoom === 1.0 ? 'overview' : 'custom');
    };
    svgEl.addEventListener('wheel', onWheelNative, { passive: false });
    return () => {
      svgEl.removeEventListener('wheel', onWheelNative);
    };
  }, []);

  // Mini-map click jumps main viewport to coordinate
  const handleMiniMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    e.stopPropagation();
    const miniRect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - miniRect.left) / miniRect.width) * BASE_WIDTH;
    const clickY = ((e.clientY - miniRect.top) / miniRect.height) * BASE_HEIGHT;
    setPan({ x: clickX, y: clickY });
    setActivePreset('custom');
  };

  // New incident modal state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newIncidentCoords, setNewIncidentCoords] = useState<{ x: number; y: number } | null>(null);
  const [newCategory, setNewCategory] = useState<FacilityIncidentCategory>('escape_attempt');
  const [newSeverity, setNewSeverity] = useState<FacilityIncidentSeverity>('HIGH');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newMethod, setNewMethod] = useState('');
  const [newInmateName, setNewInmateName] = useState('');
  const [newZoneId, setNewZoneId] = useState('zone-perim-north');
  const [newActionTaken, setNewActionTaken] = useState('');
  const [newDirective, setNewDirective] = useState('');

  // Calculate zones & incident metrics for the active facility
  const activeZones = useMemo(() => {
    return DEFAULT_FACILITY_ZONES.map(z => ({ ...z, facilityId: currentFacilityId }));
  }, [currentFacilityId]);

  // Filtered facility incidents
  const facilityIncidents = useMemo(() => {
    return incidents.filter(inc => {
      if (inc.facilityId !== currentFacilityId) return false;
      if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
      if (severityFilter !== 'all' && inc.severity !== severityFilter) return false;

      // Timeframe filtering
      if (timeframe !== 'all') {
        const incDate = new Date(inc.incidentDate).getTime();
        const now = new Date('2026-09-20').getTime(); // App reference time
        const daysDiff = (now - incDate) / (1000 * 60 * 60 * 24);
        if (timeframe === '30d' && daysDiff > 30) return false;
        if (timeframe === '6m' && daysDiff > 180) return false;
        if (timeframe === '12m' && daysDiff > 365) return false;
      }

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = inc.title.toLowerCase().includes(q);
        const matchesInmate = inc.inmateName?.toLowerCase().includes(q) ?? false;
        const matchesZone = inc.locationZoneName.toLowerCase().includes(q);
        const matchesMethod = inc.methodOrCause.toLowerCase().includes(q);
        if (!matchesTitle && !matchesInmate && !matchesZone && !matchesMethod) return false;
      }

      return true;
    });
  }, [incidents, currentFacilityId, categoryFilter, severityFilter, timeframe, searchQuery]);

  // Raw all-time incidents for this facility (for metrics calculation)
  const allFacilityIncidents = useMemo(() => {
    return incidents.filter(i => i.facilityId === currentFacilityId);
  }, [incidents, currentFacilityId]);

  const zonesWithRisk = useMemo(() => {
    return calculateZoneRiskMetrics(activeZones, allFacilityIncidents);
  }, [activeZones, allFacilityIncidents]);

  // Comprehensive Security Heatmap Calculation Engine:
  // Visualizes facility density, officer-to-inmate ratios, and incident frequency as color-coded gradients (green to red)
  const zoneSecurityMetrics = useMemo(() => {
    const facCap = facility?.capacity || 1000;
    const facInmates = facility?.currentInmates || 850;
    const facOfficers = facility?.activeOfficers || Math.max(1, Math.round(facCap / 6));

    return zonesWithRisk.map(zone => {
      // 1. Zone Incident Frequency
      const zoneIncidents = allFacilityIncidents.filter(inc => {
        if (inc.locationZoneId === zone.id) return true;
        const { x, y, width, height } = zone.bounds;
        return (
          inc.coordinates.x >= x &&
          inc.coordinates.x <= x + width &&
          inc.coordinates.y >= y &&
          inc.coordinates.y <= y + height
        );
      });
      const incidentCount = zoneIncidents.length;

      // 2. Zone Density & Staffing
      let zoneCapacity = 100;
      let zoneInmates = 50;
      let zoneOfficers = zone.guardCount || 3;

      if (zone.type === 'cell_block') {
        if (zone.id.includes('block-b') || zone.code.includes('REM')) {
          // Remand dormitories - high congestion / severe overcrowding
          zoneCapacity = Math.round(facCap * 0.40);
          zoneInmates = Math.round(facInmates * 0.55);
          zoneOfficers = zone.guardCount || Math.max(4, Math.round(facOfficers * 0.22));
        } else if (zone.id.includes('block-a') || zone.code.includes('MAX')) {
          // Supermax / Solitary confinement
          zoneCapacity = Math.round(facCap * 0.16);
          zoneInmates = Math.round(facInmates * 0.16);
          zoneOfficers = zone.guardCount || Math.max(6, Math.round(facOfficers * 0.25));
        } else {
          zoneCapacity = Math.round(facCap * 0.20);
          zoneInmates = Math.round(facInmates * 0.20);
          zoneOfficers = zone.guardCount || 4;
        }
      } else if (zone.type === 'exercise_yard') {
        zoneCapacity = Math.round(facCap * 0.35);
        zoneInmates = Math.round(facInmates * 0.28);
        zoneOfficers = zone.guardCount || 5;
      } else if (zone.type === 'medical_clinic') {
        zoneCapacity = 35;
        zoneInmates = Math.min(35, Math.round(facInmates * 0.04) + 10);
        zoneOfficers = zone.guardCount || 4;
      } else if (zone.type === 'sallyport') {
        zoneCapacity = 25;
        zoneInmates = 15;
        zoneOfficers = zone.guardCount || 5;
      } else if (zone.type === 'perimeter_fence' || zone.type === 'watchtower') {
        zoneCapacity = 10;
        zoneInmates = 0;
        zoneOfficers = zone.guardCount || 3;
      } else {
        zoneCapacity = Math.round(facCap * 0.05);
        zoneInmates = Math.round(facInmates * 0.04);
        zoneOfficers = zone.guardCount || 2;
      }

      const densityPercent = zoneCapacity > 0 ? Math.round((zoneInmates / zoneCapacity) * 100) : 0;
      const ratio = zoneOfficers > 0 ? Number((zoneInmates / zoneOfficers).toFixed(1)) : 0;

      // 3. Component normalized scores (0 to 100)
      // Density Score (Green: <75% -> Yellow/Amber: 75-90% -> Red: >90%)
      let densityScore = 15;
      if (densityPercent < 75) {
        densityScore = Math.max(10, Math.round((densityPercent / 75) * 35));
      } else if (densityPercent <= 90) {
        densityScore = Math.round(35 + ((densityPercent - 75) / 15) * 34);
      } else {
        densityScore = Math.min(100, Math.round(70 + ((densityPercent - 90) / 25) * 30));
      }

      // Officer-to-Inmate Ratio Score (Green: <=5:1 -> Yellow/Amber: 6-9:1 -> Red: >=10:1)
      let ratioScore = 15;
      if (ratio <= 5.0) {
        ratioScore = Math.max(10, Math.round((ratio / 5.0) * 35));
      } else if (ratio < 10.0) {
        ratioScore = Math.round(35 + ((ratio - 5.0) / 5.0) * 34);
      } else {
        ratioScore = Math.min(100, Math.round(70 + ((ratio - 10.0) / 10.0) * 30));
      }

      // Incident Frequency Score (0 -> 10, 1 -> 35, 2 -> 55, 3 -> 75, 4+ -> 95)
      let incidentScore = 10;
      if (incidentCount === 0) incidentScore = 10;
      else if (incidentCount === 1) incidentScore = 35;
      else if (incidentCount === 2) incidentScore = 55;
      else if (incidentCount === 3) incidentScore = 75;
      else incidentScore = Math.min(100, 75 + incidentCount * 6);

      // Composite Score (35% density, 35% ratio, 30% incident frequency)
      const compositeScore = Math.min(100, Math.round(densityScore * 0.35 + ratioScore * 0.35 + incidentScore * 0.30));

      // Active Metric Score
      let activeScore = compositeScore;
      if (activeHeatmapMetric === 'density') activeScore = densityScore;
      else if (activeHeatmapMetric === 'ratio') activeScore = ratioScore;
      else if (activeHeatmapMetric === 'incidents') activeScore = incidentScore;

      // Color-Coded Gradient Palette (Green to Red)
      let colorStart = '#10b981'; // Green
      let colorMid = '#22c55e';
      let colorEnd = '#059669';
      let tier: 'low' | 'moderate' | 'high' | 'critical' = 'low';
      let tierLabel = 'Safe / Low Strain';

      if (activeScore >= 75) {
        tier = 'critical';
        tierLabel = 'CRITICAL RED ALERT';
        colorStart = '#f97316'; // Orange
        colorMid = '#ef4444';   // Red
        colorEnd = '#991b1b';   // Dark Crimson
      } else if (activeScore >= 55) {
        tier = 'high';
        tierLabel = 'Elevated Risk';
        colorStart = '#eab308'; // Yellow
        colorMid = '#f97316';   // Orange
        colorEnd = '#ef4444';   // Red
      } else if (activeScore >= 35) {
        tier = 'moderate';
        tierLabel = 'Moderate Strain';
        colorStart = '#10b981'; // Emerald
        colorMid = '#eab308';   // Yellow
        colorEnd = '#f59e0b';   // Amber
      }

      return {
        ...zone,
        densityPercent,
        inmates: zoneInmates,
        officers: zoneOfficers,
        ratio,
        incidentCount,
        densityScore,
        ratioScore,
        incidentScore,
        compositeScore,
        activeScore,
        colorStart,
        colorMid,
        colorEnd,
        tier,
        tierLabel,
      };
    });
  }, [zonesWithRisk, facility, allFacilityIncidents, activeHeatmapMetric]);

  const metrics = useMemo(() => {
    return getFacilityHotspotSummary(currentFacilityId, allFacilityIncidents);
  }, [currentFacilityId, allFacilityIncidents]);

  const focusOnHighestRiskHotspot = useCallback(() => {
    if (!zonesWithRisk || zonesWithRisk.length === 0) return;
    const highestZone = [...zonesWithRisk].sort((a, b) => b.calculatedRiskScore - a.calculatedRiskScore)[0];
    if (highestZone) {
      focusOnZone(highestZone, 2.8);
      setActivePreset('hotspot');
    }
  }, [zonesWithRisk, focusOnZone]);

  // Handle map click for incident placement or inspection (respects zoom/pan transform)
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If the user was dragging/panning the map, don't trigger click action
    if (hasDragged) {
      setHasDragged(false);
      return;
    }

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    const clickX = coords.pctX;
    const clickY = coords.pctY;

    // Determine which zone this falls into
    const matchedZone = activeZones.find(z => {
      return (
        clickX >= z.bounds.x &&
        clickX <= z.bounds.x + z.bounds.width &&
        clickY >= z.bounds.y &&
        clickY <= z.bounds.y + z.bounds.height
      );
    });

    setNewIncidentCoords({ x: Math.round(clickX), y: Math.round(clickY) });
    if (matchedZone) {
      setNewZoneId(matchedZone.id);
    }
  };

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const matchedZone = activeZones.find(z => z.id === newZoneId) || activeZones[0];
    const coords = newIncidentCoords || {
      x: matchedZone.bounds.x + matchedZone.bounds.width / 2,
      y: matchedZone.bounds.y + matchedZone.bounds.height / 2
    };

    const newInc: FacilityIncident = {
      id: `inc-cust-${Date.now()}`,
      facilityId: currentFacilityId,
      facilityName: facility?.name || 'Selected Facility',
      title: newTitle,
      category: newCategory,
      severity: newSeverity,
      incidentDate: '2026-09-20',
      incidentTime: '11:45',
      locationZoneId: matchedZone.id,
      locationZoneName: matchedZone.name,
      coordinates: coords,
      inmateName: newInmateName || undefined,
      description: newDescription || 'Logged by duty officer during multi-prison hotspot surveillance muster.',
      methodOrCause: newMethod || 'Under administrative security review.',
      status: 'active_investigation',
      actionTaken: newActionTaken || 'Immediate perimeter muster called and cell block lockdown verified.',
      superintendentDirective: newDirective || 'Deploy tactical sentries and initiate formal institutional enquiry.',
      densityWeight: newSeverity === 'CRITICAL' ? 5 : newSeverity === 'HIGH' ? 4 : 3,
      reportedByOfficer: 'Superintendent on Duty'
    };

    setIncidents(prev => [newInc, ...prev]);
    setSelectedIncident(newInc);
    setIsLogModalOpen(false);
    // Reset form
    setNewTitle('');
    setNewDescription('');
    setNewMethod('');
    setNewInmateName('');
    setNewActionTaken('');
    setNewDirective('');
    setNewIncidentCoords(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Superintendent Command Header */}
      <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] bg-rose-600 text-white font-mono font-bold px-2 py-0.5 rounded tracking-wide uppercase flex items-center gap-1">
                <Siren className="w-3 h-3 animate-pulse" />
                TACTICAL SPATIAL SURVEILLANCE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                model: prison.facility.hotspot.map
              </span>
              <span className="text-xs bg-slate-800 text-amber-400 border border-slate-700 px-2 py-0.5 rounded font-mono">
                {facility?.securityRating || 'Supermax'}
              </span>
            </div>

            <h2 className="text-xl font-bold mt-1 text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              Facility Hotspot & Historical Incident Density Heatmap
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
              Spatial overlay of historical escape attempts, critical medical alerts, and perimeter breaches onto the facility compound layout. Helps superintendents pinpoint vulnerability blindspots and deploy tactical resources.
            </p>
          </div>

          {/* Facility Selection Dropdown & Log Button */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="bg-slate-800/90 border border-slate-700 rounded-lg p-1.5 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400 ml-1.5" />
              <select
                value={currentFacilityId}
                onChange={e => onSelectFacility(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold rounded px-2 py-1 border-0 focus:ring-1 focus:ring-amber-500 outline-hidden cursor-pointer"
              >
                {facilities.map(fac => (
                  <option key={fac.id} value={fac.id} className="bg-slate-900 text-white">
                    {fac.name} ({fac.code})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => {
                setNewIncidentCoords(null);
                setIsLogModalOpen(true);
              }}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Log Incident onto Map</span>
            </button>
          </div>
        </div>

        {/* Superintendent Threat Advisory Bar */}
        <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              Historical Incidents
            </div>
            <div className="text-lg font-mono font-extrabold text-white mt-0.5">
              {metrics.totalIncidents}
            </div>
            <div className="text-[10px] text-slate-500">In institutional registry</div>
          </div>

          <div className="bg-slate-800/60 border border-rose-900/40 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-500" />
              Escape Attempts
            </div>
            <div className="text-lg font-mono font-extrabold text-rose-400 mt-0.5">
              {metrics.escapeAttempts}
            </div>
            <div className="text-[10px] text-slate-500">Breaches & perimeter scaling</div>
          </div>

          <div className="bg-slate-800/60 border border-amber-900/40 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <HeartPulse className="w-3 h-3 text-amber-500" />
              Medical Alerts
            </div>
            <div className="text-lg font-mono font-extrabold text-amber-400 mt-0.5">
              {metrics.medicalAlerts}
            </div>
            <div className="text-[10px] text-slate-500">Resuscitations & code reds</div>
          </div>

          <div className="bg-slate-800/60 border border-purple-900/40 p-2.5 rounded-lg">
            <div className="text-[10px] uppercase font-bold text-purple-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-purple-500" />
              Security Clashes
            </div>
            <div className="text-lg font-mono font-extrabold text-purple-400 mt-0.5">
              {metrics.violenceContraband}
            </div>
            <div className="text-[10px] text-slate-500">Weapons & drone drops</div>
          </div>

          <div className="bg-slate-800/60 border border-amber-500/40 p-2.5 rounded-lg col-span-2 md:col-span-1">
            <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-500" />
              Highest Hotspot
            </div>
            <div className="text-xs font-bold text-white truncate mt-1" title={metrics.highestRiskZoneName}>
              {metrics.highestRiskZoneName}
            </div>
            <div className="text-[10px] text-amber-400/80 font-mono font-semibold mt-0.5">
              Risk Index: {metrics.overallFacilityRiskScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip: Filters, Layer Toggles & Timeframe */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Incident Type Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Layer:
          </span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all ${
              categoryFilter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Incidents ({allFacilityIncidents.length})
          </button>
          <button
            onClick={() => setCategoryFilter('escape_attempt')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'escape_attempt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Escapes ({metrics.escapeAttempts})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('medical_alert')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'medical_alert'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-amber-500" />
            <span>Medical Alerts ({metrics.medicalAlerts})</span>
          </button>
          <button
            onClick={() => setCategoryFilter('violence_contraband')}
            className={`px-2.5 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
              categoryFilter === 'violence_contraband'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-purple-500" />
            <span>Security & Clashes ({metrics.violenceContraband})</span>
          </button>
        </div>

        {/* Timeframe & Overlay Toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Timeframe selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setTimeframe('all')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                timeframe === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeframe('12m')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                timeframe === '12m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12 Months
            </button>
            <button
              onClick={() => setTimeframe('6m')}
              className={`px-2 py-1 rounded font-semibold transition-colors ${
                timeframe === '6m' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              6 Months
            </button>
          </div>

          {/* Security Heatmap Overlay Toggle & Metric Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => toggleSecurityHeatmap()}
              className={`px-3 py-1.5 rounded-md font-bold flex items-center gap-1.5 transition-all ${
                isSecurityHeatmapActive
                  ? 'bg-gradient-to-r from-emerald-600 via-amber-600 to-rose-600 text-white shadow-xs ring-1 ring-rose-400/50'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle Security Heatmap: visualizes facility density, officer-to-inmate ratios, and incident frequency as color-coded gradients (green to red)"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Security Heatmap:</span>
              <span className={`text-[10px] font-mono px-1 rounded font-bold ${
                isSecurityHeatmapActive ? 'bg-black/40 text-amber-300' : 'bg-slate-200 text-slate-700'
              }`}>
                {isSecurityHeatmapActive ? 'ENABLED' : 'OFF'}
              </span>
            </button>

            {isSecurityHeatmapActive && (
              <div className="flex items-center gap-1 pl-1 pr-1">
                <button
                  onClick={() => selectHeatmapMetric('composite')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                    activeHeatmapMetric === 'composite'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Composite Threat Index (Density + Guard Ratios + Incident Frequency)"
                >
                  Composite
                </button>
                <button
                  onClick={() => selectHeatmapMetric('density')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                    activeHeatmapMetric === 'density'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Facility & Zone Bed Density (% Occupancy)"
                >
                  Density
                </button>
                <button
                  onClick={() => selectHeatmapMetric('ratio')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                    activeHeatmapMetric === 'ratio'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Officer-to-Inmate Supervision Ratios"
                >
                  Guard Ratio
                </button>
                <button
                  onClick={() => selectHeatmapMetric('incidents')}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-all ${
                    activeHeatmapMetric === 'incidents'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Incident Frequency & Clashes"
                >
                  Incidents
                </button>
              </div>
            )}
          </div>

          {/* Map theme toggle */}
          <button
            onClick={() => setMapTheme(mapTheme === 'tactical_dark' ? 'blueprint_light' : 'tactical_dark')}
            className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1"
            title="Switch Map Theme (Tactical Dark / Technical Blueprint)"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{mapTheme === 'tactical_dark' ? 'Dark Tactical' : 'Blueprint'}</span>
          </button>
        </div>
      </div>

      {/* Quick-Jump Tactical Focus Presets Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 shadow-sm">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-semibold">
            <Scan className="w-4 h-4 text-amber-400" />
            <span className="text-white font-bold">Tactical Focus Presets:</span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">Jump directly to specific cell blocks & perimeter breach zones</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="text-amber-400 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Zoom: {Math.round(zoom * 100)}%
            </span>
            <span className="hidden sm:inline bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Grid: [{Math.round(clampedCenterX)}, {Math.round(clampedCenterY)}]
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {/* Quick Dropdown: Jump to Any Cell Block or Sector */}
          <div className="relative shrink-0 flex items-center">
            <select
              value={zonesWithRisk.some(z => z.id === activePreset) ? activePreset : ''}
              onChange={(e) => {
                const targetZone = zonesWithRisk.find(z => z.id === e.target.value);
                if (targetZone) {
                  focusOnZone(targetZone, 3.2);
                }
              }}
              className="bg-slate-800 text-amber-300 font-bold text-xs py-1.5 px-2.5 rounded-lg border border-amber-500/40 hover:border-amber-400 focus:outline-hidden cursor-pointer shadow-xs"
              title="Jump directly to inspect any cell block or compound sector"
            >
              <option value="" disabled>🔍 Zoom to Any Cell Block or Sector...</option>
              <optgroup label="Cell Blocks & Isolation Wings">
                {zonesWithRisk.filter(z => z.type === 'cell_block').map(z => (
                  <option key={z.id} value={z.id}>
                    {z.code}: {z.name} [Risk {z.calculatedRiskScore}/100]
                  </option>
                ))}
              </optgroup>
              <optgroup label="High-Risk Perimeter & Breach Sectors">
                {zonesWithRisk.filter(z => z.type === 'perimeter_fence' || z.type === 'watchtower' || z.type === 'sallyport').map(z => (
                  <option key={z.id} value={z.id}>
                    {z.code}: {z.name} [Risk {z.calculatedRiskScore}/100]
                  </option>
                ))}
              </optgroup>
              <optgroup label="Compound Common Areas">
                {zonesWithRisk.filter(z => z.type !== 'cell_block' && z.type !== 'perimeter_fence' && z.type !== 'watchtower' && z.type !== 'sallyport').map(z => (
                  <option key={z.id} value={z.id}>
                    {z.code}: {z.name} [Risk {z.calculatedRiskScore}/100]
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Preset: Overview */}
          <button
            onClick={handleResetView}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'overview' && zoom === 1.0
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Full Compound (1.0x)</span>
          </button>

          {/* Preset: Block A (Supermax) */}
          <button
            onClick={() => {
              const zoneA = activeZones.find(z => z.id === 'zone-block-a') || activeZones[0];
              focusOnZone(zoneA, 2.8);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'zone-block-a'
                ? 'bg-rose-600 text-white border-rose-500 shadow-xs ring-1 ring-rose-400'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Block A: Supermax (2.8x)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-rose-950 text-rose-300 font-mono">
              Solitary & Cells
            </span>
          </button>

          {/* Preset: Block B (Remand Wing) */}
          <button
            onClick={() => {
              const zoneB = activeZones.find(z => z.id === 'zone-block-b') || activeZones[1];
              focusOnZone(zoneB, 2.8);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'zone-block-b'
                ? 'bg-purple-600 text-white border-purple-500 shadow-xs ring-1 ring-purple-400'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-purple-400" />
            <span>Block B: Remand Wing (2.8x)</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-mono">
              Dorms & Muster
            </span>
          </button>

          {/* Preset: Highest Risk Hotspot */}
          <button
            onClick={focusOnHighestRiskHotspot}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'hotspot'
                ? 'bg-rose-500 text-slate-950 border-rose-400 shadow-xs animate-pulse'
                : 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900'
            }`}
            title="Automatically center on the facility zone with highest calculated threat score"
          >
            <Target className="w-3.5 h-3.5 text-rose-400" />
            <span>Highest Risk Hotspot (Target)</span>
          </button>

          {/* Preset: North Perimeter & Breach Point */}
          <button
            onClick={() => {
              const zoneNorth = activeZones.find(z => z.id === 'zone-perim-north') || activeZones[0];
              focusOnZone(zoneNorth, 2.5);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'zone-perim-north'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>North Perimeter Breach Zone</span>
          </button>

          {/* Preset: Exercise Yard */}
          <button
            onClick={() => {
              const zoneYard = activeZones.find(z => z.id === 'zone-yard') || activeZones[2];
              focusOnZone(zoneYard, 2.4);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'zone-yard'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Exercise Yard & Catwalk</span>
          </button>

          {/* Preset: Medical Clinic */}
          <button
            onClick={() => {
              const zoneClinic = activeZones.find(z => z.id === 'zone-clinic') || activeZones[3];
              focusOnZone(zoneClinic, 2.6);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'zone-clinic'
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
            <span>Hospital Clinic</span>
          </button>

          {/* Preset: Sallyport Gate */}
          <button
            onClick={() => {
              const zoneSallyport = activeZones.find(z => z.id === 'zone-sallyport') || activeZones[4];
              focusOnZone(zoneSallyport, 2.6);
            }}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 border ${
              activePreset === 'zone-sallyport'
                ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Sallyport Gate</span>
          </button>
        </div>
      </div>

      {/* Security Heatmap Color-Coded Gradient Legend & Facility Risk Metrics Banner */}
      {isSecurityHeatmapActive && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 shadow-sm text-xs space-y-2.5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-white font-bold tracking-wide uppercase text-[11px] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Security Heatmap Active:
              </span>
              <span className="text-slate-300 font-medium">
                {activeHeatmapMetric === 'composite' && 'Composite Threat Index (Density + Guard Ratios + Incident Frequency)'}
                {activeHeatmapMetric === 'density' && 'Facility & Zone Bed Occupancy Density (%)'}
                {activeHeatmapMetric === 'ratio' && 'Officer-to-Inmate Custodial Supervision Ratios'}
                {activeHeatmapMetric === 'incidents' && 'Incident Frequency & Perimeter Breach Events'}
              </span>
            </div>

            {/* Quick Metric Switcher Pills */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono px-1.5 font-bold uppercase">Metric:</span>
              <button
                onClick={() => selectHeatmapMetric('composite')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  activeHeatmapMetric === 'composite'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Composite
              </button>
              <button
                onClick={() => selectHeatmapMetric('density')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  activeHeatmapMetric === 'density'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Density
              </button>
              <button
                onClick={() => selectHeatmapMetric('ratio')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  activeHeatmapMetric === 'ratio'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Guard Ratio
              </button>
              <button
                onClick={() => selectHeatmapMetric('incidents')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                  activeHeatmapMetric === 'incidents'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Incidents
              </button>
            </div>
          </div>

          {/* Continuous Green-to-Red Color Spectrum Bar with Risk Thresholds */}
          <div className="space-y-1">
            <div className="relative h-2.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 via-orange-500 to-rose-600 shadow-inner" />
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 flex-wrap gap-1">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span>●</span> Low Risk (Safe Ratio ≤5:1, Density &lt;75%, 0 Incidents)
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <span>●</span> Moderate Load (Ratio 6-9:1, Density 75-90%)
              </span>
              <span className="flex items-center gap-1 text-rose-400 font-bold">
                <span>●</span> CRITICAL HAZARD (Ratio ≥10:1, Density &gt;90%, Clashes)
              </span>
            </div>
          </div>

          {/* Real-time Facility Metrics Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800/80 text-[11px]">
            <div className="bg-slate-950/70 border border-slate-800 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-slate-400">Facility Density:</span>
              <span className={`font-mono font-bold ${
                (facility.currentInmates / facility.capacity) >= 0.9 ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {Math.round((facility.currentInmates / facility.capacity) * 100)}% ({facility.currentInmates}/{facility.capacity})
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-slate-400">Staffing Ratio:</span>
              <span className={`font-mono font-bold ${
                (facility.currentInmates / Math.max(1, facility.activeOfficers || 1)) >= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
              }`}>
                {(facility.currentInmates / Math.max(1, facility.activeOfficers || 1)).toFixed(1)} : 1
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-slate-400">Security Incidents:</span>
              <span className="font-mono font-bold text-amber-400">
                {allFacilityIncidents.length} recorded
              </span>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 rounded-md p-1.5 flex items-center justify-between">
              <span className="text-slate-400">Critical Red Zones:</span>
              <span className="font-mono font-bold text-rose-400">
                {zoneSecurityMetrics.filter(z => z.tier === 'critical').length} sectors
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Tactical Map & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Map Canvas (8 Columns) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Map Surface Container */}
          <div className={`relative rounded-xl border overflow-hidden shadow-sm select-none transition-colors ${
            mapTheme === 'tactical_dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-900 border-slate-700'
          }`}>
            {/* Map Header Status Indicator */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none">
              <span className="text-[10px] font-mono font-bold bg-slate-900/90 text-white px-2 py-1 rounded border border-slate-700 flex items-center gap-1.5 backdrop-blur-xs">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                <span>{facility.code} COMPOUND TACTICAL GRID</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-slate-900/90 px-2 py-1 rounded border border-slate-700 font-bold hidden sm:inline-block">
                Zoom: {Math.round(zoom * 100)}%
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900/80 px-2 py-1 rounded border border-slate-700 hidden sm:inline-block">
                Showing {facilityIncidents.length} incidents
              </span>
            </div>

            {/* Map Top-Right Quick Legend & Interaction Mode */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
              <div className="bg-slate-900/90 border border-slate-700 rounded-md px-2 py-1 text-[10px] text-slate-300 flex items-center gap-2 backdrop-blur-xs pointer-events-none">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span className="text-rose-400 font-bold">Escape</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-amber-400 font-bold">Medical</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-purple-400 font-bold">Violence</span>
                </span>
              </div>

              {/* Pan mode toggle button */}
              <button
                onClick={() => setIsPanModeActive(!isPanModeActive)}
                className={`p-1.5 rounded-md border text-[11px] font-bold flex items-center gap-1 transition-all ${
                  isPanModeActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-xs'
                    : 'bg-slate-900/90 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
                title={isPanModeActive ? 'Pan Mode Active: Click & Drag to Pan' : 'Click to Toggle Pan Mode'}
              >
                <Move className="w-3.5 h-3.5" />
                <span className="hidden md:inline">{isPanModeActive ? 'Pan Mode' : 'Pan'}</span>
              </button>
            </div>

            {/* SVG Interactive Prison Layout */}
            <div className="w-full aspect-[4/3] sm:aspect-[16/10] relative">
              <svg
                ref={svgRef}
                viewBox={currentViewBox}
                className={`w-full h-full transition-[cursor] ${
                  isPanning ? 'cursor-grabbing' : isPanModeActive ? 'cursor-grab' : 'cursor-crosshair'
                }`}
                onClick={handleMapClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <defs>
                  {/* Grid pattern */}
                  <pattern id="tacticalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke={mapTheme === 'tactical_dark' ? '#1e293b' : '#334155'}
                      strokeWidth="0.7"
                    />
                  </pattern>

                  {/* Sentry searchlight gradient */}
                  <radialGradient id="searchlight" cx="0%" cy="0%" r="100%">
                    <stop offset="0%" stopColor="#fef08a" stopOpacity="0.25" />
                    <stop offset="60%" stopColor="#fef08a" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
                  </radialGradient>

                  {/* Heatmap dynamic gradients for incidents */}
                  <radialGradient id="heatCritical" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={`${heatIntensity / 100 * 0.85}`} />
                    <stop offset="40%" stopColor="#f97316" stopOpacity={`${heatIntensity / 100 * 0.55}`} />
                    <stop offset="70%" stopColor="#eab308" stopOpacity={`${heatIntensity / 100 * 0.25}`} />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="heatWarning" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={`${heatIntensity / 100 * 0.8}`} />
                    <stop offset="50%" stopColor="#eab308" stopOpacity={`${heatIntensity / 100 * 0.4}`} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                  </radialGradient>

                  <radialGradient id="heatMedical" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ec4899" stopOpacity={`${heatIntensity / 100 * 0.85}`} />
                    <stop offset="45%" stopColor="#f43f5e" stopOpacity={`${heatIntensity / 100 * 0.5}`} />
                    <stop offset="80%" stopColor="#fb923c" stopOpacity={`${heatIntensity / 100 * 0.2}`} />
                    <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                  </radialGradient>

                  {/* Razor wire fence pattern */}
                  <pattern id="razorWire" width="10" height="10" patternUnits="userSpaceOnUse">
                    <line x1="0" y1="0" x2="10" y2="10" stroke="#475569" strokeWidth="0.8" />
                    <line x1="10" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="0.8" />
                  </pattern>

                  {/* Dynamic Security Heatmap Gradients (Color-Coded Green to Red) */}
                  {zoneSecurityMetrics.map(zm => (
                    <React.Fragment key={`secGradDef-${zm.id}`}>
                      <linearGradient id={`secHeatGrad-${zm.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={zm.colorStart} stopOpacity={`${(heatIntensity / 100) * 0.75}`} />
                        <stop offset="50%" stopColor={zm.colorMid} stopOpacity={`${(heatIntensity / 100) * 0.70}`} />
                        <stop offset="100%" stopColor={zm.colorEnd} stopOpacity={`${(heatIntensity / 100) * 0.85}`} />
                      </linearGradient>
                      <radialGradient id={`secHeatRadial-${zm.id}`} cx="50%" cy="50%" r="70%">
                        <stop offset="0%" stopColor={zm.colorEnd} stopOpacity={`${(heatIntensity / 100) * 0.80}`} />
                        <stop offset="50%" stopColor={zm.colorMid} stopOpacity={`${(heatIntensity / 100) * 0.40}`} />
                        <stop offset="100%" stopColor={zm.colorStart} stopOpacity="0" />
                      </radialGradient>
                    </React.Fragment>
                  ))}
                </defs>

                {/* Base background & tactical grid */}
                <rect width="1000" height="650" fill={mapTheme === 'tactical_dark' ? '#090d16' : '#0f172a'} />
                <rect width="1000" height="650" fill="url(#tacticalGrid)" />

                {/* Outer Perimeter Wall & Sterile Buffer Zone */}
                <rect
                  x="20"
                  y="20"
                  width="960"
                  height="610"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="6"
                  rx="12"
                />
                {/* Secondary inner razor-wire fence */}
                <rect
                  x="38"
                  y="38"
                  width="924"
                  height="574"
                  fill="none"
                  stroke="#475569"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  rx="8"
                />

                {/* Perimeter Patrol Road strip */}
                <rect
                  x="42"
                  y="42"
                  width="916"
                  height="566"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="12"
                  rx="6"
                />

                {/* Corner Watchtowers & Sentry Light Cones */}
                {/* Tower 1 (North-West) */}
                <g>
                  <path d="M 50 50 L 250 20 L 220 220 Z" fill="url(#searchlight)" />
                  <rect x="25" y="25" width="40" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                  <circle cx="45" cy="45" r="10" fill="#ef4444" opacity="0.8" />
                  <text x="45" y="48" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">T-1</text>
                </g>

                {/* Tower 2 (North-East) */}
                <g>
                  <path d="M 950 50 L 750 20 L 780 220 Z" fill="url(#searchlight)" />
                  <rect x="935" y="25" width="40" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                  <circle cx="955" cy="45" r="10" fill="#ef4444" opacity="0.8" />
                  <text x="955" y="48" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">T-2</text>
                </g>

                {/* Tower 3 (South-East) */}
                <g>
                  <path d="M 950 600 L 750 630 L 780 430 Z" fill="url(#searchlight)" />
                  <rect x="935" y="585" width="40" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                  <circle cx="955" cy="605" r="10" fill="#ef4444" opacity="0.8" />
                  <text x="955" y="608" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">T-3</text>
                </g>

                {/* Tower 4 (South-West) */}
                <g>
                  <path d="M 50 600 L 250 630 L 220 430 Z" fill="url(#searchlight)" />
                  <rect x="25" y="585" width="40" height="40" fill="#1e293b" stroke="#64748b" strokeWidth="2" rx="4" />
                  <circle cx="45" cy="605" r="10" fill="#ef4444" opacity="0.8" />
                  <text x="45" y="608" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">T-4</text>
                </g>

                {/* Tactical Zones & Buildings Layer */}
                {zonesWithRisk.map(zone => {
                  const x = (zone.bounds.x / 100) * 1000;
                  const y = (zone.bounds.y / 100) * 650;
                  const w = (zone.bounds.width / 100) * 1000;
                  const h = (zone.bounds.height / 100) * 650;
                  const isHovered = hoveredZone?.id === zone.id;
                  const isSelected = selectedZone?.id === zone.id;
                  const isHighRisk = zone.calculatedRiskScore >= 50;
                  const isCriticalRisk = zone.calculatedRiskScore >= 75;

                  // Zone color theme
                  let baseFill = '#1e293b';
                  let strokeColor = '#334155';

                  if (zone.type === 'cell_block') {
                    baseFill = isCriticalRisk ? '#450a0a' : isHighRisk ? '#2e1065' : '#1e1b4b';
                    strokeColor = isCriticalRisk ? '#dc2626' : isHighRisk ? '#9333ea' : '#4338ca';
                  } else if (zone.type === 'medical_clinic') {
                    baseFill = '#064e3b';
                    strokeColor = '#10b981';
                  } else if (zone.type === 'exercise_yard') {
                    baseFill = '#14532d';
                    strokeColor = '#22c55e';
                  } else if (zone.type === 'sallyport') {
                    baseFill = '#312e81';
                    strokeColor = '#6366f1';
                  } else if (zone.type === 'watchtower' || zone.type === 'perimeter_fence') {
                    baseFill = isCriticalRisk ? '#450a0a' : '#1e293b';
                    strokeColor = isCriticalRisk ? '#f43f5e' : '#64748b';
                  }

                  return (
                    <g
                      key={zone.id}
                      onClick={(e) => {
                        if (hasDragged) return;
                        e.stopPropagation();
                        setSelectedZone(zone);
                        setSelectedIncident(null);
                      }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        focusOnZone(zone, 3.2);
                      }}
                      onMouseEnter={() => setHoveredZone(zone)}
                      onMouseLeave={() => setHoveredZone(null)}
                      className="cursor-pointer transition-all duration-200"
                    >
                      <title>{`${zone.name} (${zone.code}) - Risk Score: ${zone.calculatedRiskScore}/100. Click to inspect, double-click to zoom into this block.`}</title>
                      {/* Zone Building Body */}
                      <rect
                        x={x}
                        y={y}
                        width={w}
                        height={h}
                        fill={baseFill}
                        fillOpacity={isHovered || isSelected ? 0.95 : 0.75}
                        stroke={isSelected ? '#f59e0b' : isHovered ? '#38bdf8' : strokeColor}
                        strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                        rx="8"
                      />

                      {/* Basic architectural lines when zoomed out */}
                      {zoom < 1.5 && (
                        <>
                          {zone.type === 'cell_block' && (
                            <g opacity="0.3">
                              <line x1={x + 10} y1={y + h / 2} x2={x + w - 10} y2={y + h / 2} stroke="#ffffff" strokeWidth="1" strokeDasharray="3 3" />
                              <line x1={x + w / 3} y1={y + 8} x2={x + w / 3} y2={y + h - 8} stroke="#ffffff" strokeWidth="0.8" />
                              <line x1={x + (w / 3) * 2} y1={y + 8} x2={x + (w / 3) * 2} y2={y + h - 8} stroke="#ffffff" strokeWidth="0.8" />
                            </g>
                          )}

                          {zone.type === 'exercise_yard' && (
                            <g opacity="0.3">
                              <circle cx={x + w / 2} cy={y + h / 2} r={Math.min(w, h) * 0.25} fill="none" stroke="#ffffff" strokeWidth="1" />
                              <line x1={x + 10} y1={y + h / 2} x2={x + w - 10} y2={y + h / 2} stroke="#ffffff" strokeWidth="1" />
                            </g>
                          )}
                        </>
                      )}

                      {/* Deep Architectural Zoom Layer (Rendered when zoom >= 1.5) */}
                      {zoom >= 1.5 && (
                        <g className="transition-opacity duration-300 pointer-events-none">
                          {/* BLOCK A: SUPERMAX & ISOLATION PODS */}
                          {(zone.id === 'zone-block-a' || zone.code.includes('BLK-A')) && (
                            <g>
                              {/* Central Secure Catwalk Corridor */}
                              <rect
                                x={x + 12}
                                y={y + h / 2 - 12}
                                width={w - 24}
                                height={24}
                                fill="#0f172a"
                                stroke="#f59e0b"
                                strokeWidth="0.8"
                                strokeDasharray="3 3"
                              />
                              <text
                                x={x + w / 2}
                                y={y + h / 2 + 3}
                                fill="#f59e0b"
                                fontSize="7"
                                fontWeight="bold"
                                fontFamily="monospace"
                                textAnchor="middle"
                                opacity="0.85"
                              >
                                SECURE ESCORT CORRIDOR [RESTRICTED]
                              </text>

                              {/* North Tier Cells (Cells 101-104) */}
                              {[0, 1, 2, 3].map(idx => {
                                const cellW = (w - 36) / 4;
                                const cellX = x + 12 + idx * (cellW + 3);
                                const cellY = y + 42;
                                const cellH = (h / 2) - 58;
                                const isSolitary = idx === 0;
                                return (
                                  <g key={`cell-n-${idx}`}>
                                    <rect
                                      x={cellX}
                                      y={cellY}
                                      width={cellW}
                                      height={cellH}
                                      fill={isSolitary ? '#450a0a' : '#020617'}
                                      stroke={isSolitary ? '#f43f5e' : '#475569'}
                                      strokeWidth={isSolitary ? 1.5 : 0.8}
                                      rx="2"
                                    />
                                    <rect x={cellX + 2} y={cellY + 2} width={cellW * 0.45} height={cellH * 0.35} fill="#334155" rx="1" />
                                    <line x1={cellX} y1={cellY + cellH} x2={cellX + cellW} y2={cellY + cellH} stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 1" />
                                    <text
                                      x={cellX + cellW / 2}
                                      y={cellY + cellH - 4}
                                      fill={isSolitary ? '#fca5a5' : '#cbd5e1'}
                                      fontSize="6.5"
                                      fontWeight="bold"
                                      fontFamily="monospace"
                                      textAnchor="middle"
                                    >
                                      {isSolitary ? 'S-1 [ISO]' : `C-${101 + idx}`}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* South Tier Cells (Cells 105-106 & S-2) */}
                              {[0, 1, 2, 3].map(idx => {
                                const cellW = (w - 36) / 4;
                                const cellX = x + 12 + idx * (cellW + 3);
                                const cellY = y + h / 2 + 16;
                                const cellH = (h / 2) - 46;
                                const isSolitary = idx === 3;
                                return (
                                  <g key={`cell-s-${idx}`}>
                                    <rect
                                      x={cellX}
                                      y={cellY}
                                      width={cellW}
                                      height={cellH}
                                      fill={isSolitary ? '#450a0a' : '#020617'}
                                      stroke={isSolitary ? '#f43f5e' : '#475569'}
                                      strokeWidth={isSolitary ? 1.5 : 0.8}
                                      rx="2"
                                    />
                                    <rect x={cellX + 2} y={cellY + cellH - cellH * 0.38} width={cellW * 0.45} height={cellH * 0.35} fill="#334155" rx="1" />
                                    <line x1={cellX} y1={cellY} x2={cellX + cellW} y2={cellY} stroke="#94a3b8" strokeWidth="2" strokeDasharray="2 1" />
                                    <text
                                      x={cellX + cellW / 2}
                                      y={cellY + 10}
                                      fill={isSolitary ? '#fca5a5' : '#cbd5e1'}
                                      fontSize="6.5"
                                      fontWeight="bold"
                                      fontFamily="monospace"
                                      textAnchor="middle"
                                    >
                                      {isSolitary ? 'S-2 [ISO]' : `C-${105 + idx}`}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Interlock Console & CCTV Node */}
                              <g transform={`translate(${x + w - 42}, ${y + h / 2 - 10})`}>
                                <rect width="30" height="20" fill="#020617" stroke="#10b981" strokeWidth="1" rx="2" />
                                <circle cx="6" cy="6" r="2" fill="#10b981" />
                                <text x="12" y="8" fill="#10b981" fontSize="5.5" fontWeight="bold">LOCK</text>
                                <text x="6" y="16" fill="#e2e8f0" fontSize="5" fontWeight="mono">PTZ-CAM</text>
                              </g>
                            </g>
                          )}

                          {/* BLOCK B: REMAND DORMITORIES & OVERCROWDING ALERTS */}
                          {(zone.id === 'zone-block-b' || zone.code.includes('BLK-B')) && (
                            <g>
                              {/* 3 Dormitory Bays */}
                              {[
                                { name: 'Bay B-1 (Remand)', alert: '142% CAP - HIGH TENSION', isAlert: true },
                                { name: 'Bay B-2 (General)', alert: '98% CAP - NORMAL', isAlert: false },
                                { name: 'Bay B-3 (Trustee)', alert: '85% CAP - LABOR', isAlert: false },
                              ].map((bay, idx) => {
                                const bayW = (w - 24) / 3;
                                const bayX = x + 8 + idx * (bayW + 4);
                                const bayY = y + 42;
                                const bayH = h - 70;
                                return (
                                  <g key={`bay-${idx}`}>
                                    <rect
                                      x={bayX}
                                      y={bayY}
                                      width={bayW}
                                      height={bayH}
                                      fill={bay.isAlert ? '#2d0606' : '#090d16'}
                                      stroke={bay.isAlert ? '#ef4444' : '#334155'}
                                      strokeWidth={bay.isAlert ? 1.2 : 0.8}
                                      rx="3"
                                    />
                                    <g opacity="0.4">
                                      <line x1={bayX + 6} y1={bayY + 16} x2={bayX + bayW - 6} y2={bayY + 16} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                                      <line x1={bayX + 6} y1={bayY + 30} x2={bayX + bayW - 6} y2={bayY + 30} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                                      <line x1={bayX + 6} y1={bayY + 44} x2={bayX + bayW - 6} y2={bayY + 44} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                                    </g>
                                    <text x={bayX + 6} y={bayY + 10} fill="#f1f5f9" fontSize="7" fontWeight="bold">
                                      {bay.name}
                                    </text>
                                    <text
                                      x={bayX + 6}
                                      y={bayY + bayH - 6}
                                      fill={bay.isAlert ? '#f87171' : '#94a3b8'}
                                      fontSize="5.5"
                                      fontWeight="bold"
                                      fontFamily="monospace"
                                    >
                                      {bay.alert}
                                    </text>
                                  </g>
                                );
                              })}
                              {/* Night Muster Inspection Line */}
                              <line x1={x + 12} y1={y + h - 18} x2={x + w - 12} y2={y + h - 18} stroke="#eab308" strokeWidth="1" strokeDasharray="4 2" />
                              <text x={x + 16} y={y + h - 9} fill="#eab308" fontSize="6" fontWeight="bold" fontFamily="monospace">
                                DAILY MUSTER LINE • GUARD CHECKPOINT
                              </text>
                            </g>
                          )}

                          {/* NORTH PERIMETER & BREACH POINT DETAIL */}
                          {zone.id === 'zone-perim-north' && (
                            <g>
                              {/* Double Razor Wire Coils */}
                              <path
                                d={`M ${x + 20} ${y + 16} Q ${x + 40} ${y + 8} ${x + 60} ${y + 16} T ${x + 100} ${y + 16} T ${x + 140} ${y + 16} T ${x + 180} ${y + 16} T ${x + 220} ${y + 16} T ${x + 260} ${y + 16} T ${x + 300} ${y + 16} T ${x + 340} ${y + 16} T ${x + 380} ${y + 16}`}
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="1.2"
                                opacity="0.6"
                              />
                              {/* Seismic Sensor detection beam */}
                              <line x1={x + 15} y1={y + h - 16} x2={x + w - 15} y2={y + h - 16} stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="6 3" />
                              <text x={x + 20} y={y + h - 6} fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                                SEISMIC SENSOR BEAM [ARMED / ONLINE]
                              </text>

                              {/* Critical Blindspot Warning Box behind Transformer */}
                              <g transform={`translate(${x + 140}, ${y + 32})`}>
                                <rect width="230" height="46" fill="#450a0a" stroke="#f43f5e" strokeWidth="1.5" rx="3" fillOpacity="0.95" />
                                <text x="8" y="13" fill="#fecdd3" fontSize="6.5" fontWeight="bold">
                                  ⚠️ VULNERABILITY BLINDSPOT: Transformer Substation
                                </text>
                                <text x="8" y="24" fill="#fda4af" fontSize="5.5">
                                  Obstructs Tower 1 sentry sightline (3 historical breaches logged)
                                </text>
                                <text x="8" y="36" fill="#fb7185" fontSize="5.5" fontWeight="bold" fontFamily="monospace">
                                  BREACH ESCAPE VECTOR: Scaling outer fence at 02:00-04:00h
                                </text>
                                {/* Escape Trajectory Vector Arrow */}
                                <line x1="220" y1="24" x2="220" y2="-18" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 2" />
                                <polygon points="217,-16 220,-22 223,-16" fill="#f43f5e" />
                              </g>
                            </g>
                          )}

                          {/* EXERCISE YARD DETAIL */}
                          {zone.id === 'zone-yard' && (
                            <g>
                              {/* Catwalk Sniper Post */}
                              <rect x={x + w / 2 - 35} y={y + 8} width="70" height="18" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" rx="2" />
                              <circle cx={x + w / 2 - 20} cy={y + 17} r="3" fill="#ef4444" />
                              <text x={x + w / 2 - 12} y={y + 20} fill="#f8fafc" fontSize="6.5" fontWeight="bold">
                                SNIPER POST
                              </text>
                              {/* Basketball & Muster Grid */}
                              <rect x={x + 20} y={y + 40} width={w - 40} height={h - 65} fill="none" stroke="#22c55e" strokeWidth="0.8" strokeDasharray="4 2" opacity="0.4" />
                              <text x={x + w / 2} y={y + h - 12} fill="#86efac" fontSize="6.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                                SQUAD MUSTER BOXES [ALPHA • BRAVO • CHARLIE]
                              </text>
                            </g>
                          )}

                          {/* CLINIC DETAIL */}
                          {zone.id === 'zone-clinic' && (
                            <g>
                              {/* Emergency Triage Bay */}
                              <rect x={x + 12} y={y + 42} width={w * 0.44} height={h - 60} fill="#022c22" stroke="#10b981" strokeWidth="0.8" rx="2" />
                              <text x={x + 16} y={y + 54} fill="#6ee7b7" fontSize="6.5" fontWeight="bold">TRIAGE BAY 1 & 2</text>
                              <text x={x + 16} y={y + 66} fill="#a7f3d0" fontSize="5.5">Crash Cart / CPR</text>

                              {/* Locked Pharmacy Vault */}
                              <rect x={x + w * 0.44 + 18} y={y + 42} width={w * 0.44} height={h - 60} fill="#022c22" stroke="#059669" strokeWidth="0.8" rx="2" />
                              <text x={x + w * 0.44 + 22} y={y + 54} fill="#6ee7b7" fontSize="6.5" fontWeight="bold">NARCOTICS VAULT</text>
                              <text x={x + w * 0.44 + 22} y={y + 66} fill="#a7f3d0" fontSize="5.5">Class-A Bio-Logged</text>
                            </g>
                          )}

                          {/* SALLYPORT GATE DETAIL */}
                          {zone.id === 'zone-sallyport' && (
                            <g>
                              {/* Dual Gate Interlock */}
                              <line x1={x + 10} y1={y + 10} x2={x + 10} y2={y + h - 10} stroke="#ef4444" strokeWidth="3" />
                              <line x1={x + w - 10} y1={y + 10} x2={x + w - 10} y2={y + h - 10} stroke="#ef4444" strokeWidth="3" />
                              <text x={x + 15} y={y + 20} fill="#fca5a5" fontSize="6" fontWeight="bold">GATE 1 [HYDRAULIC]</text>
                              <text x={x + w - 85} y={y + 20} fill="#fca5a5" fontSize="6" fontWeight="bold">GATE 2 [INTERLOCK]</text>
                              {/* Undercarriage pit */}
                              <rect x={x + 40} y={y + h / 2 - 8} width={w - 80} height="16" fill="#1e1b4b" stroke="#818cf8" strokeWidth="0.8" rx="1" />
                              <text x={x + w / 2} y={y + h / 2 + 3} fill="#c7d2fe" fontSize="6" fontWeight="bold" textAnchor="middle">
                                UNDERCARRIAGE MIRROR INSPECTION PIT
                              </text>
                            </g>
                          )}
                        </g>
                      )}

                      {/* Zone Label & Code */}
                      <text
                        x={x + 10}
                        y={y + 20}
                        fill="#f8fafc"
                        fontSize="11"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {zone.code}
                      </text>
                      <text
                        x={x + 10}
                        y={y + 34}
                        fill="#94a3b8"
                        fontSize="9.5"
                        fontWeight="500"
                      >
                        {zone.name.split('-')[0].trim()}
                      </text>

                      {/* Risk Index Badge */}
                      <g transform={`translate(${x + w - 55}, ${y + 8})`}>
                        <rect
                          width="46"
                          height="18"
                          rx="4"
                          fill={
                            isCriticalRisk
                              ? '#dc2626'
                              : isHighRisk
                              ? '#d97706'
                              : '#16a34a'
                          }
                          fillOpacity="0.9"
                        />
                        <text
                          x="23"
                          y="12"
                          fill="#ffffff"
                          fontSize="8.5"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          RISK {zone.calculatedRiskScore}
                        </text>
                      </g>

                      {/* Incident count pill inside zone */}
                      {zone.incidentCount > 0 && (
                        <g transform={`translate(${x + 10}, ${y + h - 22})`}>
                          <rect
                            width={zone.incidentCount > 9 ? 75 : 68}
                            height="15"
                            rx="3"
                            fill="#0f172a"
                            stroke={isCriticalRisk ? '#f43f5e' : '#64748b'}
                            strokeWidth="0.8"
                          />
                          <text
                            x="6"
                            y="11"
                            fill={isCriticalRisk ? '#fca5a5' : '#e2e8f0'}
                            fontSize="8"
                            fontWeight="bold"
                            fontFamily="monospace"
                          >
                            ⚠️ {zone.incidentCount} INCIDENTS
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* SECURITY HEATMAP COLOR-CODED OVERLAY LAYER (GREEN TO RED GRADIENTS) */}
                {isSecurityHeatmapActive && (
                  <g className="pointer-events-none transition-all duration-300">
                    {zoneSecurityMetrics.map(zm => {
                      const x = (zm.bounds.x / 100) * 1000;
                      const y = (zm.bounds.y / 100) * 650;
                      const w = (zm.bounds.width / 100) * 1000;
                      const h = (zm.bounds.height / 100) * 650;

                      return (
                        <g key={`secHeatOverlay-${zm.id}`}>
                          {/* Radial Heat Bloom extending outwards */}
                          <circle
                            cx={x + w / 2}
                            cy={y + h / 2}
                            r={Math.max(w, h) * 0.72}
                            fill={`url(#secHeatRadial-${zm.id})`}
                            className="mix-blend-screen"
                          />

                          {/* Zone Rect Heat Gradient Wash */}
                          <rect
                            x={x}
                            y={y}
                            width={w}
                            height={h}
                            fill={`url(#secHeatGrad-${zm.id})`}
                            fillOpacity={0.65}
                            stroke={zm.colorEnd}
                            strokeWidth={zm.tier === 'critical' ? 2.5 : 1.2}
                            strokeDasharray={zm.tier === 'critical' ? '6 3' : undefined}
                            rx="6"
                          />

                          {/* Critical Animated Pulse Border for High Hazard Zones */}
                          {zm.tier === 'critical' && (
                            <rect
                              x={x - 2}
                              y={y - 2}
                              width={w + 4}
                              height={h + 4}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="2"
                              rx="8"
                              className="animate-pulse"
                              opacity="0.8"
                            />
                          )}

                          {/* Floating Tactical Zone Heatmap Telemetry Badge */}
                          <g transform={`translate(${x + 8}, ${y + 26})`}>
                            <rect
                              width="122"
                              height="38"
                              fill="#020617"
                              fillOpacity="0.94"
                              stroke={zm.colorEnd}
                              strokeWidth="1.2"
                              rx="4"
                            />
                            {/* Header line with status indicator & score */}
                            <circle cx="9" cy="10" r="3.5" fill={zm.colorEnd} />
                            <text x="16" y="12.5" fill="#ffffff" fontSize="7.5" fontWeight="bold">
                              {zm.tierLabel}
                            </text>
                            <text x="114" y="12.5" fill={zm.colorEnd} fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="end">
                              {zm.activeScore}/100
                            </text>

                            {/* 3 Metrics: Density, Ratio, Incidents */}
                            <text x="8" y="24" fill="#cbd5e1" fontSize="6.5" fontFamily="monospace">
                              D: <tspan fill={zm.densityPercent >= 90 ? '#f87171' : zm.densityPercent >= 75 ? '#fbbf24' : '#4ade80'} fontWeight="bold">{zm.densityPercent}%</tspan>
                              {' '}| R: <tspan fill={zm.ratio >= 10 ? '#f87171' : zm.ratio >= 6 ? '#fbbf24' : '#4ade80'} fontWeight="bold">{zm.ratio}:1</tspan>
                              {' '}| I: <tspan fill={zm.incidentCount >= 3 ? '#f87171' : zm.incidentCount >= 1 ? '#fbbf24' : '#4ade80'} fontWeight="bold">{zm.incidentCount}</tspan>
                            </text>

                            <text x="8" y="33" fill="#94a3b8" fontSize="6">
                              {zm.inmates} inmates • {zm.officers} guards
                            </text>
                          </g>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* DENSITY HEATMAP GRADIENT OVERLAY LAYER */}
                {showHeatmap && (
                  <g className="pointer-events-none transition-opacity duration-300">
                    {facilityIncidents.map(inc => {
                      const cx = (inc.coordinates.x / 100) * 1000;
                      const cy = (inc.coordinates.y / 100) * 650;
                      // Radius scales based on severity and density weight
                      const radius = inc.severity === 'CRITICAL' ? 140 : inc.severity === 'HIGH' ? 110 : 85;
                      const heatFill =
                        inc.category === 'escape_attempt'
                          ? 'url(#heatCritical)'
                          : inc.category === 'medical_alert'
                          ? 'url(#heatMedical)'
                          : 'url(#heatWarning)';

                      return (
                        <circle
                          key={`heat-${inc.id}`}
                          cx={cx}
                          cy={cy}
                          r={radius}
                          fill={heatFill}
                          className="mix-blend-screen"
                        />
                      );
                    })}
                  </g>
                )}

                {/* INTERACTIVE INCIDENT MARKERS LAYER */}
                {showIncidentMarkers && (
                  <g>
                    {facilityIncidents.map(inc => {
                      const cx = (inc.coordinates.x / 100) * 1000;
                      const cy = (inc.coordinates.y / 100) * 650;
                      const isSelected = selectedIncident?.id === inc.id;
                      const isHovered = hoveredIncident?.id === inc.id;
                      const isEscape = inc.category === 'escape_attempt';
                      const isMedical = inc.category === 'medical_alert';

                      const markerColor = isEscape ? '#ef4444' : isMedical ? '#f59e0b' : '#a855f7';
                      const markerBg = isEscape ? '#7f1d1d' : isMedical ? '#78350f' : '#581c87';

                      return (
                        <g
                          key={`marker-${inc.id}`}
                          transform={`translate(${cx}, ${cy})`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncident(inc);
                            setSelectedZone(null);
                          }}
                          onMouseEnter={() => setHoveredIncident(inc)}
                          onMouseLeave={() => setHoveredIncident(null)}
                          className="cursor-pointer group"
                        >
                          {/* Pulsing ring for critical/active incidents */}
                          {(inc.severity === 'CRITICAL' || isSelected) && (
                            <circle
                              r="22"
                              fill="none"
                              stroke={markerColor}
                              strokeWidth="2"
                              className="animate-ping opacity-75"
                            />
                          )}

                          {/* Outer halo */}
                          <circle
                            r={isSelected ? 18 : isHovered ? 16 : 14}
                            fill={markerBg}
                            stroke={isSelected ? '#ffffff' : markerColor}
                            strokeWidth={isSelected ? 3 : 2}
                            className="shadow-lg transition-all"
                          />

                          {/* Center Iconography */}
                          {isEscape ? (
                            <text
                              x="0"
                              y="4"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              🚨
                            </text>
                          ) : isMedical ? (
                            <text
                              x="0"
                              y="4"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              🩺
                            </text>
                          ) : (
                            <text
                              x="0"
                              y="4"
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              ⚠️
                            </text>
                          )}

                          {/* Hover Tooltip Label */}
                          {(isHovered || isSelected) && (
                            <g transform="translate(0, -26)" className="pointer-events-none z-50">
                              <rect
                                x="-80"
                                y="-24"
                                width="160"
                                height="22"
                                rx="4"
                                fill="#0f172a"
                                stroke="#f59e0b"
                                strokeWidth="1"
                                className="shadow-2xl"
                              />
                              <text
                                x="0"
                                y="-9"
                                fill="#f8fafc"
                                fontSize="9"
                                fontWeight="bold"
                                textAnchor="middle"
                              >
                                {inc.title.slice(0, 24)}...
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* Click Marker preview when setting new incident coords */}
                {newIncidentCoords && (
                  <g transform={`translate(${(newIncidentCoords.x / 100) * 1000}, ${(newIncidentCoords.y / 100) * 650})`}>
                    <circle r="18" fill="none" stroke="#38bdf8" strokeWidth="2" className="animate-ping" />
                    <circle r="8" fill="#38bdf8" />
                    <text x="0" y="24" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                      NEW TARGET
                    </text>
                  </g>
                )}

                {/* Tactical Dynamic Scale Bar & Compass (SVG Inset) */}
                <g transform={`translate(${vbX + 20}, ${vbY + visibleHeight - 20})`} className="pointer-events-none opacity-90">
                  {(() => {
                    const scaleWidthInSvgUnits = 100;
                    const dynamicMeters = Math.round(50 / zoom);
                    return (
                      <g>
                        <rect x="-4" y="-16" width="130" height="22" fill="#020617" fillOpacity="0.8" rx="3" stroke="#334155" strokeWidth="0.8" />
                        <line x1="4" y1="-5" x2={scaleWidthInSvgUnits} y2="-5" stroke="#f8fafc" strokeWidth="2" />
                        <line x1="4" y1="-9" x2="4" y2="-1" stroke="#f8fafc" strokeWidth="2" />
                        <line x1={scaleWidthInSvgUnits} y1="-9" x2={scaleWidthInSvgUnits} y2="-1" stroke="#f8fafc" strokeWidth="2" />
                        <text x={scaleWidthInSvgUnits / 2} y="-8" fill="#f8fafc" fontSize="7.5" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {dynamicMeters} METERS
                        </text>
                      </g>
                    );
                  })()}
                </g>
              </svg>

              {/* Tactical Radar Mini-Map Overlay (Bottom-Left) */}
              <div className="absolute bottom-3 left-3 z-30 flex flex-col items-start select-none">
                {showMiniMap ? (
                  <div className="bg-slate-950/95 border border-slate-700 rounded-lg p-1.5 shadow-xl backdrop-blur-md">
                    <div className="flex items-center justify-between pb-1 px-1 border-b border-slate-800 text-[10px] text-slate-300 font-mono">
                      <span className="flex items-center gap-1 font-bold text-amber-400">
                        <Radio className="w-3 h-3 text-amber-400 animate-pulse" />
                        TACTICAL RADAR
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMiniMap(false);
                        }}
                        className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
                        title="Minimize Radar"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </button>
                    </div>
                    {/* Mini SVG Viewport */}
                    <div className="mt-1 relative cursor-pointer" title="Click anywhere on radar to jump viewport">
                      <svg
                        viewBox="0 0 1000 650"
                        className="w-36 h-24 sm:w-44 sm:h-28 bg-slate-900 rounded border border-slate-800"
                        onClick={handleMiniMapClick}
                      >
                        {/* Mini zones */}
                        {zonesWithRisk.map(z => {
                          const zX = (z.bounds.x / 100) * 1000;
                          const zY = (z.bounds.y / 100) * 650;
                          const zW = (z.bounds.width / 100) * 1000;
                          const zH = (z.bounds.height / 100) * 650;
                          const isCrit = z.calculatedRiskScore >= 75;
                          const isHigh = z.calculatedRiskScore >= 50;
                          return (
                            <rect
                              key={`mini-${z.id}`}
                              x={zX}
                              y={zY}
                              width={zW}
                              height={zH}
                              fill={isCrit ? '#ef4444' : isHigh ? '#f59e0b' : '#3b82f6'}
                              fillOpacity="0.5"
                              stroke={isCrit ? '#ef4444' : '#64748b'}
                              strokeWidth="2"
                              rx="4"
                            />
                          );
                        })}
                        {/* Mini Incidents */}
                        {facilityIncidents.map(inc => (
                          <circle
                            key={`mini-inc-${inc.id}`}
                            cx={(inc.coordinates.x / 100) * 1000}
                            cy={(inc.coordinates.y / 100) * 650}
                            r="8"
                            fill={inc.category === 'escape_attempt' ? '#f43f5e' : inc.category === 'medical_alert' ? '#f59e0b' : '#a855f7'}
                          />
                        ))}
                        {/* Active Viewport Rectangle */}
                        <rect
                          x={vbX}
                          y={vbY}
                          width={visibleWidth}
                          height={visibleHeight}
                          fill="#f59e0b"
                          fillOpacity="0.2"
                          stroke="#f59e0b"
                          strokeWidth="10"
                          rx="6"
                        />
                      </svg>
                      <div className="absolute bottom-1 right-1 px-1 py-0.2 bg-slate-900/80 rounded text-[9px] font-mono text-slate-400 pointer-events-none">
                        Click to jump
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowMiniMap(true)}
                    className="bg-slate-950/90 hover:bg-slate-900 border border-slate-700 text-slate-300 px-2 py-1 rounded-md text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs cursor-pointer"
                    title="Open Radar Mini-Map"
                  >
                    <Grid className="w-3.5 h-3.5 text-amber-400" />
                    <span>Radar Mini-Map</span>
                  </button>
                )}
              </div>

              {/* Floating Tactical Zoom & Pan Controls (Bottom-Right) */}
              <div className="absolute bottom-3 right-3 z-30 flex flex-col items-end gap-2 select-none">
                {/* D-Pad Pan Nudge Controls */}
                <div className="bg-slate-950/90 border border-slate-700 rounded-lg p-1 shadow-lg backdrop-blur-xs flex flex-col items-center">
                  <button
                    onClick={() => handleNudgePan(0, -1)}
                    className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                    title="Pan Up"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleNudgePan(-1, 0)}
                      className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                      title="Pan Left"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleResetView}
                      className="px-1 py-0.5 hover:bg-slate-800 text-amber-400 hover:text-amber-300 rounded font-mono text-[9px] font-bold cursor-pointer"
                      title="Recenter & Reset Compound (1.0x)"
                    >
                      FIT
                    </button>
                    <button
                      onClick={() => handleNudgePan(1, 0)}
                      className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                      title="Pan Right"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleNudgePan(0, 1)}
                    className="p-1 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                    title="Pan Down"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Zoom In, Out, Slider, Hotspot Reticle, Reset Stack */}
                <div className="bg-slate-950/90 border border-slate-700 rounded-lg p-1.5 shadow-lg backdrop-blur-xs flex flex-col items-center gap-1.5">
                  <button
                    onClick={handleZoomIn}
                    disabled={zoom >= 5.0}
                    className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                    title="Zoom In (+0.5x)"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>

                  <div className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-400 bg-slate-900 rounded border border-slate-800">
                    {Math.round(zoom * 100)}%
                  </div>

                  <input
                    type="range"
                    min="1.0"
                    max="5.0"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => zoomTo(parseFloat(e.target.value))}
                    className="w-16 accent-amber-500 cursor-pointer h-1 my-1"
                    title={`Drag to zoom: ${zoom.toFixed(1)}x`}
                  />

                  <button
                    onClick={handleZoomOut}
                    disabled={zoom <= 1.0}
                    className="p-1.5 hover:bg-slate-800 text-slate-200 hover:text-white disabled:opacity-40 disabled:hover:bg-transparent rounded transition-colors cursor-pointer"
                    title="Zoom Out (-0.5x)"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>

                  <div className="w-4 border-t border-slate-800 my-0.5" />

                  <button
                    onClick={focusOnHighestRiskHotspot}
                    className="p-1.5 hover:bg-rose-950 text-rose-400 hover:text-rose-300 rounded transition-colors cursor-pointer"
                    title="Target Highest Risk Hotspot"
                  >
                    <Target className="w-4 h-4 animate-pulse" />
                  </button>

                  <button
                    onClick={handleResetView}
                    className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded transition-colors cursor-pointer"
                    title="Reset to Full Compound Overview"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Map Status Footer */}
            <div className="p-3 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="hidden sm:inline">Scroll wheel or slider to zoom (1.0x - 5.0x). Drag or use D-pad to pan. Double-click any cell block to zoom in.</span>
                <span className="sm:hidden">Drag to pan • Double-tap to zoom • Pinch</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono text-amber-400">
                  [{Math.round(clampedCenterX)}, {Math.round(clampedCenterY)}] @ {zoom.toFixed(1)}x
                </span>
                <span className="text-slate-600">|</span>
                <button
                  onClick={() => {
                    setSelectedIncident(null);
                    setSelectedZone(null);
                  }}
                  className="text-amber-400 hover:underline font-semibold cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>

          {/* Security Heatmap Intensity & Overlay Controls */}
          <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 flex-wrap flex-1">
              <label className="flex items-center gap-2 cursor-pointer select-none font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={isSecurityHeatmapActive}
                  onChange={e => toggleSecurityHeatmap(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  Security Heatmap
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  isSecurityHeatmapActive ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isSecurityHeatmapActive ? 'ACTIVE (Green→Red)' : 'OFF'}
                </span>
              </label>

              <span className="text-slate-300 hidden sm:inline">|</span>

              <span className="font-bold text-slate-700 flex items-center gap-1.5 shrink-0">
                <Sliders className="w-3.5 h-3.5 text-amber-600" />
                Heat Intensity:
              </span>
              <input
                type="range"
                min="20"
                max="100"
                value={heatIntensity}
                onChange={e => setHeatIntensity(Number(e.target.value))}
                className="w-28 accent-amber-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-slate-800">{heatIntensity}%</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={showIncidentMarkers}
                  onChange={e => setShowIncidentMarkers(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Pin Markers</span>
              </label>
              <span className="text-slate-300">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={showGuardSightlines}
                  onChange={e => setShowGuardSightlines(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Sentry Towers</span>
              </label>
              <span className="text-slate-300">|</span>
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-medium">
                <input
                  type="checkbox"
                  checked={showHeatmap}
                  onChange={e => setShowHeatmap(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Raw Clusters</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Inspector Drawer & Incident Intelligence (4 Columns) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Active Selection Dossier */}
          {selectedIncident ? (
            /* Selected Incident Card */
            <div className="bg-white border-2 border-amber-400 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    selectedIncident.category === 'escape_attempt' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    selectedIncident.category === 'medical_alert' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-purple-100 text-purple-800 border border-purple-300'
                  }`}>
                    {selectedIncident.category.replace('_', ' ')}
                  </span>
                  <span className="ml-1.5 text-[10px] font-mono text-slate-500">
                    {selectedIncident.id}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedIncident(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedIncident.title}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {selectedIncident.incidentDate} {selectedIncident.incidentTime && `at ${selectedIncident.incidentTime}`}
                  </span>
                  <span>•</span>
                  <span className="font-medium text-slate-700">{selectedIncident.locationZoneName}</span>
                </div>

                <button
                  onClick={() => focusOnIncident(selectedIncident, 3.2)}
                  className="w-full py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5" />
                  <span>Zoom & Center on Incident Site (3.2x)</span>
                </button>
              </div>

              {/* Inmate Info if linked */}
              {selectedIncident.inmateName && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 flex items-center justify-between">
                    <span>Inmate Involved</span>
                    {selectedIncident.bookingNumber && (
                      <span className="font-mono text-slate-700">{selectedIncident.bookingNumber}</span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    {selectedIncident.inmateName}
                  </div>
                </div>
              )}

              {/* Method & Description */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Method / Cause of Occurrence:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
                    {selectedIncident.methodOrCause}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block text-[11px]">Incident Chronology:</span>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">
                    {selectedIncident.description}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-emerald-800 block text-[11px]">Action Taken by Guard Detail:</span>
                  <p className="text-emerald-900 mt-0.5 bg-emerald-50/80 p-2 rounded border border-emerald-200">
                    {selectedIncident.actionTaken}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-rose-900 block text-[11px]">Superintendent Remedial Directive:</span>
                  <p className="text-rose-950 mt-0.5 bg-rose-50/80 p-2 rounded border border-rose-200 font-medium">
                    {selectedIncident.superintendentDirective}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Reported by: <strong>{selectedIncident.reportedByOfficer}</strong></span>
                <span className={`font-bold uppercase text-[10px] px-2 py-0.5 rounded ${
                  selectedIncident.status === 'foiled' || selectedIncident.status === 'recaptured' || selectedIncident.status === 'resolved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {selectedIncident.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ) : selectedZone ? (
            /* Selected Zone Card */
            <div className="bg-white border-2 border-slate-400 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {selectedZone.code}
                  </span>
                  <span className="ml-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    {selectedZone.securityTier}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedZone(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedZone.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedZone.description}</p>
                <button
                  onClick={() => focusOnZone(selectedZone, 2.8)}
                  className="mt-2.5 w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs border border-slate-700 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Zoom & Focus on this Cell Block (2.8x)</span>
                </button>
              </div>

              {/* Zone Security Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">CCTV Surveillance</span>
                  <strong className={`font-mono text-xs ${
                    selectedZone.cctvCoverage === 'FULL' ? 'text-emerald-700' :
                    selectedZone.cctvCoverage === 'PARTIAL' ? 'text-amber-700' : 'text-rose-700'
                  }`}>
                    {selectedZone.cctvCoverage}
                  </strong>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase block">Assigned Sentries</span>
                  <strong className="font-mono text-xs text-slate-800">{selectedZone.guardCount} Officers</strong>
                </div>
              </div>

              {/* Incidents in this zone */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Incidents Recorded in this Zone ({
                    allFacilityIncidents.filter(i => i.locationZoneId === selectedZone.id).length
                  })
                </h4>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {allFacilityIncidents
                    .filter(i => i.locationZoneId === selectedZone.id)
                    .map(inc => (
                      <div
                        key={inc.id}
                        onClick={() => setSelectedIncident(inc)}
                        className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            inc.category === 'escape_attempt' ? 'bg-rose-100 text-rose-800' :
                            inc.category === 'medical_alert' ? 'bg-amber-100 text-amber-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {inc.category.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">{inc.incidentDate}</span>
                        </div>
                        <div className="font-bold text-slate-900 mt-1">{inc.title}</div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* Default Superintendent Intelligence Brief */
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tactical Threat Assessment</h3>
                  <p className="text-[11px] text-slate-500">Superintendent Risk Intelligence Summary</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-amber-50/80 rounded-lg border border-amber-200">
                  <span className="font-bold text-amber-900 block text-[11px] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Top Perimeter Vulnerability
                  </span>
                  <p className="text-amber-950 mt-1 leading-relaxed">
                    <strong>North Perimeter Wall (SEC-NW-01)</strong> exhibits the highest concentration of attempted escapes during power fluctuations and weather storms. Night spotlight battery backups must be inspected every Thursday.
                  </p>
                </div>

                <div className="p-3 bg-rose-50/80 rounded-lg border border-rose-200">
                  <span className="font-bold text-rose-900 block text-[11px] flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                    Medical Emergency Pattern
                  </span>
                  <p className="text-rose-950 mt-1 leading-relaxed">
                    <strong>Block A & Block B cells</strong> generate 65% of midnight medical code reds (cardiac collapses and asthma attacks). Orderly night rounds are mandated at 01:00 and 04:00.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="font-bold text-slate-800 block text-[11px]">Instructional Tip:</span>
                  <p className="text-slate-600 mt-1 leading-relaxed">
                    Click anywhere on the tactical map to inspect individual buildings, or click <strong className="text-slate-900">"Log Incident onto Map"</strong> to record a newly verified incident at precise coordinates.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick List of High Risk Hotspots Table */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Facility Risk Ranking</span>
              <span className="text-[10px] text-slate-400 font-mono">By Incident Density</span>
            </h4>
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {zonesWithRisk
                .sort((a, b) => b.calculatedRiskScore - a.calculatedRiskScore)
                .map(z => (
                  <div
                    key={z.id}
                    onClick={() => {
                      setSelectedZone(z);
                      setSelectedIncident(null);
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      selectedZone?.id === z.id
                        ? 'bg-amber-50 border-amber-400 shadow-2xs'
                        : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <span>{z.name}</span>
                        {z.cctvCoverage === 'BLINDSPOT' && (
                          <span className="text-[9px] px-1 py-0.2 bg-rose-100 text-rose-800 rounded font-mono">
                            BLINDSPOT
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {z.incidentCount} incidents • {z.guardCount} sentries
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-1.5">
                      <span className={`text-xs font-mono font-extrabold px-1.5 py-0.5 rounded ${
                        z.calculatedRiskScore >= 70 ? 'bg-rose-100 text-rose-800' :
                        z.calculatedRiskScore >= 40 ? 'bg-amber-100 text-amber-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {z.calculatedRiskScore}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          focusOnZone(z, 2.8);
                        }}
                        className="p-1 hover:bg-slate-200 text-slate-500 hover:text-slate-900 rounded transition-colors"
                        title={`Zoom into ${z.name}`}
                      >
                        <Crosshair className="w-3.5 h-3.5 text-amber-600" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: LOG NEW INCIDENT ONTO MAP */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-lg">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Log Facility Incident</h3>
                  <p className="text-xs text-slate-500">Record a new occurrence onto the tactical map coordinates</p>
                </div>
              </div>
              <button
                onClick={() => setIsLogModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Incident Category *</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as FacilityIncidentCategory)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                  >
                    <option value="escape_attempt">Escape Attempt / Perimeter Breach</option>
                    <option value="medical_alert">Medical Alert / Emergency Crisis</option>
                    <option value="violence_contraband">Violence, Weapons or Contraband</option>
                    <option value="structural_breach">Structural or Lock Malfunction</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Threat Severity *</label>
                  <select
                    value={newSeverity}
                    onChange={e => setNewSeverity(e.target.value as FacilityIncidentSeverity)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-bold"
                  >
                    <option value="CRITICAL">CRITICAL (Immediate Lockdown)</option>
                    <option value="HIGH">HIGH (High Priority Muster)</option>
                    <option value="MODERATE">MODERATE (Standard Review)</option>
                    <option value="LOW">LOW (Routine Log)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Location Zone *</label>
                <select
                  value={newZoneId}
                  onChange={e => setNewZoneId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-medium"
                >
                  {activeZones.map(z => (
                    <option key={z.id} value={z.id}>
                      {z.code} - {z.name}
                    </option>
                  ))}
                </select>
                {newIncidentCoords && (
                  <p className="text-[11px] text-emerald-700 font-mono mt-1">
                    ✓ Custom map coordinates set at: X={newIncidentCoords.x}%, Y={newIncidentCoords.y}%
                  </p>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Incident Headline / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sentry Tower 2 Razor Wire Scaling Attempt"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Inmate Involved (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Stephen Wanyonyi (INM-2022-0198)"
                    value={newInmateName}
                    onChange={e => setNewInmateName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Method / Cause</label>
                  <input
                    type="text"
                    placeholder="e.g., Smuggled hacksaw blade; rope ladder"
                    value={newMethod}
                    onChange={e => setNewMethod(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description & Circumstances</label>
                <textarea
                  rows={2}
                  placeholder="Chronological narrative of the occurrence..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Immediate Action Taken</label>
                <input
                  type="text"
                  placeholder="e.g., Fired warning shot; patient stabilized with CPR"
                  value={newActionTaken}
                  onChange={e => setNewActionTaken(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Superintendent Directive & Mitigations</label>
                <input
                  type="text"
                  placeholder="e.g., Reinforce sentry night watches; install anti-ligature fixtures"
                  value={newDirective}
                  onChange={e => setNewDirective(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pin to Tactical Map</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
