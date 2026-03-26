import React, { memo, Component } from 'react';
// ============================================
// Maya — SettingsDialog Component (NEW)
// ============================================
// Modal for camera/mic selection, layout mode, and preferences.

import { Camera, Mic, LayoutGrid, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter } from
'./ui/Dialog';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import type { UserPreferences } from '../types';
import { MOCK_CAMERAS, MOCK_MICROPHONES } from '../utils/constants';
interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: UserPreferences;
  onUpdatePreference: <K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K])
  => void;
  onReset: () => void;
}
export const SettingsDialog = memo(function SettingsDialog({
  open,
  onOpenChange,
  preferences,
  onUpdatePreference,
  onReset
}: SettingsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-maya-light border-0">
        <DialogHeader>
          <DialogTitle className="text-maya-dark font-heading">
            Settings
          </DialogTitle>
          <DialogDescription className="text-maya-text">
            Configure your camera, microphone, and layout preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Camera selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-maya-dark">
              <Camera className="h-4 w-4 text-maya-primary" />
              Camera
            </label>
            <select
              value={preferences.selectedCamera}
              onChange={(e) =>
              onUpdatePreference('selectedCamera', e.target.value)
              }
              className="w-full h-9 rounded-lg border border-maya-text/20 bg-white px-3 text-sm text-maya-dark focus:outline-none focus:ring-2 focus:ring-maya-primary/30">
              
              {MOCK_CAMERAS.map((cam) =>
              <option key={cam.id} value={cam.id}>
                  {cam.label}
                </option>
              )}
            </select>
          </div>

          {/* Microphone selection */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-maya-dark">
              <Mic className="h-4 w-4 text-maya-primary" />
              Microphone
            </label>
            <select
              value={preferences.selectedMicrophone}
              onChange={(e) =>
              onUpdatePreference('selectedMicrophone', e.target.value)
              }
              className="w-full h-9 rounded-lg border border-maya-text/20 bg-white px-3 text-sm text-maya-dark focus:outline-none focus:ring-2 focus:ring-maya-primary/30">
              
              {MOCK_MICROPHONES.map((mic) =>
              <option key={mic.id} value={mic.id}>
                  {mic.label}
                </option>
              )}
            </select>
          </div>

          <Separator className="bg-maya-text/10" />

          {/* Layout mode */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-maya-dark">
              <LayoutGrid className="h-4 w-4 text-maya-primary" />
              Video Layout
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['auto', 'grid', 'spotlight'] as const).map((mode) =>
              <button
                key={mode}
                onClick={() => onUpdatePreference('layoutMode', mode)}
                className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${preferences.layoutMode === mode ? 'bg-maya-primary text-white shadow-md' : 'bg-white text-maya-text hover:bg-maya-accent border border-maya-text/10'}`}>
                
                  {mode}
                </button>
              )}
            </div>
            <p className="text-xs text-maya-text">
              {preferences.layoutMode === 'auto' &&
              'Automatically adjusts based on participant count'}
              {preferences.layoutMode === 'grid' &&
              'Equal-sized tiles for all participants'}
              {preferences.layoutMode === 'spotlight' &&
              'Active speaker takes center stage'}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-maya-text/20 text-maya-text hover:bg-maya-accent"
            onClick={onReset}>
            
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            Reset
          </Button>
          <Button
            size="sm"
            className="bg-maya-primary hover:bg-maya-primary/90 text-white border-0"
            onClick={() => onOpenChange(false)}>
            
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

});