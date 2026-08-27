'use client';

import React, { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { 
  RotateCcw, ZoomIn, ZoomOut, Plus, Pencil, Save, X, User, Users, ChevronDown, Eye, RotateCw, Maximize2, AlignCenter, Crosshair
} from 'lucide-react';

const TailorMannequin = dynamic(() => import('./3d/TailorMannequin'), { ssr: false });

const MALE_PARTS = [
  { id: 'neck', label: 'Neck', color: '#3b82f6', number: 1, default: 15.5 },
  { id: 'chest', label: 'Chest', color: '#22c55e', number: 2, default: 40.0 },
  { id: 'waist', label: 'Waist', color: '#eab308', number: 3, default: 34.0 },
  { id: 'hip', label: 'Hip', color: '#a855f7', number: 4, default: 39.0 },
  { id: 'shoulder', label: 'Shoulder', color: '#ef4444', number: 5, default: 18.0 },
  { id: 'sleeve', label: 'Sleeve Length', color: '#f97316', number: 6, default: 24.5 },
  { id: 'pantLength', label: 'Pant Length', color: '#8b5cf6', number: 7, default: 40.0 },
  { id: 'thigh', label: 'Thigh', color: '#14b8a6', number: 8, default: 23.0 },
  { id: 'bottomWidth', label: 'Bottom Width', color: '#ec4899', number: 9, default: 15.5 },
  { id: 'footWidth', label: 'Foot Width', color: '#06b6d4', number: 10, default: 10.0 },
];

const FEMALE_PARTS = [
  { id: 'bust', label: 'Bust', color: '#3b82f6', number: 1, default: 36.0 },
  { id: 'waist', label: 'Waist', color: '#22c55e', number: 2, default: 28.0 },
  { id: 'hip', label: 'Hip', color: '#eab308', number: 3, default: 38.0 },
  { id: 'shoulder', label: 'Shoulder', color: '#a855f7', number: 4, default: 15.5 },
  { id: 'sleeve', label: 'Sleeve Length', color: '#ef4444', number: 5, default: 22.0 },
  { id: 'kurtiLength', label: 'Kurti Length', color: '#f97316', number: 6, default: 38.0 },
  { id: 'trouserLength', label: 'Trouser Length', color: '#8b5cf6', number: 7, default: 38.0 },
  { id: 'thigh', label: 'Thigh', color: '#14b8a6', number: 8, default: 21.0 },
  { id: 'bottomWidth', label: 'Bottom Width', color: '#ec4899', number: 9, default: 13.0 },
];

const MALE_MARKERS: Record<string, { x: number, y: number }> = {
  neck: { x: 50, y: 12 },
  chest: { x: 38, y: 26 },
  waist: { x: 44, y: 43 },
  hip: { x: 42, y: 54 },
  shoulder: { x: 68, y: 18 },
  sleeve: { x: 75, y: 38 },
  pantLength: { x: 28, y: 72 },
  thigh: { x: 62, y: 66 },
  bottomWidth: { x: 55, y: 87 },
  footWidth: { x: 60, y: 93 },
};

const FEMALE_MARKERS: Record<string, { x: number, y: number }> = {
  bust: { x: 40, y: 25 },
  waist: { x: 43, y: 40 },
  hip: { x: 40, y: 52 },
  shoulder: { x: 68, y: 18 },
  sleeve: { x: 74, y: 36 },
  kurtiLength: { x: 30, y: 60 },
  trouserLength: { x: 28, y: 75 },
  thigh: { x: 62, y: 64 },
  bottomWidth: { x: 55, y: 86 },
};

export default function MeasurementStudio3D() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [selectedPart, setSelectedPart] = useState<string|null>(null);
  const [hoveredPart, setHoveredPart] = useState<string|null>(null);
  const [unit, setUnit] = useState<'in'|'cm'>('in');
  const [view, setView] = useState<'3d'|'side'|'back'>('3d');
  
  const partsConfig = gender === 'male' ? MALE_PARTS : FEMALE_PARTS;
  const markersConfig = gender === 'male' ? MALE_MARKERS : FEMALE_MARKERS;
  
  const initialMeasurements = partsConfig.reduce((acc, part) => {
    acc[part.id] = part.default;
    return acc;
  }, {} as Record<string, number>);

  const [measurements, setMeasurements] = useState<Record<string,number>>(initialMeasurements);
  const [notes, setNotes] = useState('');
  const [editValue, setEditValue] = useState('');
  const [mounted, setMounted] = useState(false);
  const orbitRef = useRef<any>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Reset measurements when gender changes
    const newInitial = (gender === 'male' ? MALE_PARTS : FEMALE_PARTS).reduce((acc, part) => {
      acc[part.id] = part.default;
      return acc;
    }, {} as Record<string, number>);
    setMeasurements(newInitial);
    setSelectedPart(null);
  }, [gender]);

  const handlePartClick = (id: string) => {
    setSelectedPart(id);
    setEditValue(measurements[id]?.toString() || '');
  };

  const handleSavePart = () => {
    if (selectedPart && editValue) {
      setMeasurements(prev => ({
        ...prev,
        [selectedPart]: parseFloat(editValue) || 0
      }));
    }
    setSelectedPart(null);
  };

  const startEdit = (id: string) => {
    setSelectedPart(id);
    setEditValue(measurements[id]?.toString() || '');
  };

  const selectedPartConfig = partsConfig.find(p => p.id === selectedPart);
  
  let popupX = 0;
  let popupY = 0;
  if (selectedPart && markersConfig[selectedPart]) {
    popupX = markersConfig[selectedPart].x;
    popupY = markersConfig[selectedPart].y;
  }

  const handleRotateLeft = () => {
    if (orbitRef.current) {
      orbitRef.current.setAzimuthalAngle(orbitRef.current.getAzimuthalAngle() - Math.PI / 4);
      orbitRef.current.update();
    }
  };

  const handleRotateRight = () => {
    if (orbitRef.current) {
      orbitRef.current.setAzimuthalAngle(orbitRef.current.getAzimuthalAngle() + Math.PI / 4);
      orbitRef.current.update();
    }
  };

  const handleZoomIn = () => {
    if (orbitRef.current && orbitRef.current.object) {
      orbitRef.current.object.position.z -= 0.5;
      orbitRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (orbitRef.current && orbitRef.current.object) {
      orbitRef.current.object.position.z += 0.5;
      orbitRef.current.update();
    }
  };

  const handleResetView = () => {
    if (orbitRef.current) {
      orbitRef.current.reset();
      setView('3d');
    }
  };

  const setCameraView = (newView: '3d' | 'side' | 'back') => {
    setView(newView);
    if (!orbitRef.current) return;
    
    switch(newView) {
      case '3d':
        orbitRef.current.setAzimuthalAngle(0);
        break;
      case 'side':
        orbitRef.current.setAzimuthalAngle(Math.PI / 2);
        break;
      case 'back':
        orbitRef.current.setAzimuthalAngle(Math.PI);
        break;
    }
    orbitRef.current.update();
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customer..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setGender('male')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${gender === 'male' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Male
            </button>
            <button 
              onClick={() => setGender('female')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${gender === 'female' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Female
            </button>
          </div>
          
          <div className="flex items-center gap-2 border-l border-gray-200 pl-6">
            <button 
              onClick={() => setCameraView('3d')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === '3d' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              3D View
            </button>
            <button 
              onClick={() => setCameraView('side')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'side' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Side View
            </button>
            <button 
              onClick={() => setCameraView('back')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${view === 'back' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              Back View
            </button>
          </div>
        </div>
        
        <button className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          New Measurement
        </button>
      </div>
      
      {/* Three column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-5 flex flex-col gap-6">
          {/* How to use card */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-600" />
              How to Use
            </h3>
            <ul className="text-sm text-gray-600 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="bg-teal-100 text-teal-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                Select customer gender and type
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-100 text-teal-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                Click on the colored markers on the 3D model
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-100 text-teal-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                Enter accurate measurements
              </li>
              <li className="flex items-start gap-2">
                <span className="bg-teal-100 text-teal-800 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                Save the profile
              </li>
            </ul>
          </div>
          
          {/* Model controls */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-teal-600" />
              Model Controls
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={handleRotateLeft} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-teal-200 transition-colors">
                <RotateCcw className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Rotate L</span>
              </button>
              <button onClick={handleRotateRight} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-teal-200 transition-colors">
                <RotateCw className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Rotate R</span>
              </button>
              <button onClick={handleZoomIn} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-teal-200 transition-colors">
                <ZoomIn className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Zoom In</span>
              </button>
              <button onClick={handleZoomOut} className="flex flex-col items-center justify-center gap-1.5 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-teal-200 transition-colors">
                <ZoomOut className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Zoom Out</span>
              </button>
            </div>
            <button onClick={handleResetView} className="mt-2 w-full flex items-center justify-center gap-2 p-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700">
              <Maximize2 className="w-4 h-4" />
              Reset View
            </button>
          </div>
        </div>
        
        {/* Center - 3D Model */}
        <div className="flex-1 relative bg-gradient-to-b from-gray-50 to-gray-100">
          <TailorMannequin gender={gender} orbitRef={orbitRef} />
          
          {/* SVG Overlay for markers */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
            {partsConfig.map(part => {
              const marker = markersConfig[part.id];
              if (!marker) return null;
              
              const isSelected = selectedPart === part.id;
              const cx = `${marker.x}%`;
              const cy = `${marker.y}%`;
              
              return (
                <g 
                  key={part.id} 
                  className="pointer-events-auto cursor-pointer transition-transform hover:scale-110" 
                  onClick={() => handlePartClick(part.id)}
                  style={{ transformOrigin: `${marker.x}% ${marker.y}%` }}
                >
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={16} 
                    fill={part.color} 
                    opacity={isSelected ? 1 : 0.85}
                    stroke="white"
                    strokeWidth="2"
                    className="shadow-sm"
                  />
                  <text 
                    x={cx} 
                    y={cy} 
                    textAnchor="middle" 
                    dominantBaseline="central" 
                    fill="white" 
                    fontSize="13" 
                    fontWeight="700"
                    style={{ pointerEvents: 'none' }}
                  >
                    {part.number}
                  </text>
                  
                  {/* Dashed line pointing inwards slightly */}
                  <line 
                    x1={cx} 
                    y1={cy} 
                    x2={`${marker.x > 50 ? marker.x - 3 : marker.x + 3}%`} 
                    y2={`${marker.y}%`}
                    stroke={part.color}
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    opacity="0.6"
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Measurement Input Popup */}
          {selectedPart && selectedPartConfig && (
            <div 
              className="absolute bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 z-20 transition-all animate-in fade-in zoom-in-95 duration-200" 
              style={{ 
                left: `calc(${popupX}% + 20px)`, 
                top: `calc(${popupY}% - 10px)`,
                transform: popupX > 70 ? 'translateX(-100%) translateX(-40px)' : 'none'
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: selectedPartConfig.color }}>
                    {selectedPartConfig.number}
                  </span>
                  <h3 className="font-semibold text-gray-800">{selectedPartConfig.label}</h3>
                </div>
                <button onClick={() => setSelectedPart(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex gap-2 mb-4">
                <input 
                  type="number" 
                  step="0.5"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent" 
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSavePart()}
                  autoFocus
                />
                <select 
                  className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-gray-50"
                  value={unit}
                  onChange={e => setUnit(e.target.value as 'in'|'cm')}
                >
                  <option value="in">in</option>
                  <option value="cm">cm</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleSavePart} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2 text-sm font-medium transition-colors flex items-center justify-center gap-1.5">
                  <Save className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Right Panel */}
        <div className="w-[320px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto p-5 flex flex-col h-full">
          <h2 className="font-bold text-gray-900 mb-4 text-lg border-b border-gray-100 pb-3 flex items-center gap-2">
            <AlignCenter className="w-5 h-5 text-teal-600" />
            Measurements ({unit})
          </h2>
          
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-1">
            {partsConfig.map(part => (
              <div 
                key={part.id}
                className={`group flex items-center justify-between py-2.5 px-3 rounded-lg transition-all cursor-pointer ${
                  selectedPart === part.id 
                    ? 'bg-teal-50 ring-1 ring-teal-200' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => startEdit(part.id)}
              >
                <div className="flex items-center gap-3">
                  <span 
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm" 
                    style={{ backgroundColor: part.color }}
                  >
                    {part.number}
                  </span>
                  <span className="text-sm font-medium text-gray-700">{part.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${measurements[part.id] !== part.default ? 'text-gray-900' : 'text-gray-400'}`}>
                    {measurements[part.id]?.toFixed(1) || part.default.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400 w-3">{unit}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); startEdit(part.id); }} 
                    className={`p-1.5 rounded-md transition-colors ${selectedPart === part.id ? 'text-teal-600 bg-teal-100' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-gray-200 hover:text-gray-700'}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Measurement Notes</label>
            <textarea 
              className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none bg-gray-50"
              rows={3}
              placeholder="Add any specific fitting notes here..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setMeasurements(initialMeasurements)}
                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl py-2.5 text-sm font-medium transition-colors"
              >
                Reset
              </button>
              <button 
                className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-xl py-2.5 text-sm font-medium transition-colors shadow-sm"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
