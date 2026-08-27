'use client';

import React, { useState } from 'react';
import { CustomerImage } from '@/types/customer';
import {
  X,
  Download,
  Trash2,
  Edit2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Tag,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LightboxProps {
  image: CustomerImage | null;
  onClose: () => void;
  onDelete: (imageId: string) => void;
  onRename: (imageId: string, newName: string) => void;
}

export default function CustomerImageLightbox({
  image,
  onClose,
  onDelete,
  onRename,
}: LightboxProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(image?.name || '');

  if (!image) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `${image.name}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveRename = () => {
    if (newName.trim()) {
      onRename(image.id, newName.trim());
      setIsEditing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      {/* Top Header Control Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-8 bg-stone-900 border-stone-700 text-stone-100 text-xs w-64"
              />
              <Button size="sm" onClick={handleSaveRename} className="h-8 bg-amber-500 text-stone-950 font-bold text-xs">
                Save
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-100">{image.name}</h3>
              <button
                onClick={() => {
                  setNewName(image.name);
                  setIsEditing(true);
                }}
                className="text-stone-400 hover:text-amber-400"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            {image.category.replace('_', ' ')}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
            className="h-9 w-9 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg"
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-xs font-mono text-stone-400">{Math.round(zoom * 100)}%</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            className="h-9 w-9 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg"
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          {/* Rotate */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            className="h-9 w-9 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg"
          >
            <RotateCw className="w-4 h-4" />
          </Button>

          {/* Download */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDownload}
            className="h-9 w-9 text-stone-300 hover:text-white hover:bg-stone-800 rounded-lg"
          >
            <Download className="w-4 h-4" />
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              onDelete(image.id);
              onClose();
            }}
            className="h-9 w-9 text-red-400 hover:bg-red-950/40 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-9 w-9 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg ml-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Image Container */}
      <div className="w-full h-full flex items-center justify-center p-12 overflow-hidden cursor-grab active:cursor-grabbing">
        <img
          src={image.url}
          alt={image.name}
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.2s ease-out',
          }}
          className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Bottom Metadata Bar */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-stone-400 bg-stone-950/80 p-3 rounded-xl border border-stone-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Uploaded: {new Date(image.uploadedAt).toLocaleString()}</span>
          </div>
          {image.tags && image.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Tags: {image.tags.join(', ')}</span>
            </div>
          )}
        </div>
        <div>
          <span>Size: {(image.sizeBytes / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </div>
    </div>
  );
}
