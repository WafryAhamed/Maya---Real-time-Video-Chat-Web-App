import React, { useState } from 'react';
import { AlertCircle, Camera, Mic } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/Dialog';
import { Button } from './ui/Button';

// ============================================
// Maya — Permission Handler
// ============================================
// Manages media permissions and displays user-friendly prompts

interface PermissionState {
  camera: 'granted' | 'denied' | 'prompt' | 'unknown';
  microphone: 'granted' | 'denied' | 'prompt' | 'unknown';
}

export const PermissionsDialog: React.FC<{
  onRequestPermissions: (constraints: MediaStreamConstraints) => Promise<void>;
}> = ({ onRequestPermissions }) => {
  const [permissions, setPermissions] = useState<PermissionState>({
    camera: 'unknown',
    microphone: 'unknown',
  });
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDevices, setSelectedDevices] = useState({
    camera: true,
    microphone: true,
  });
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkPermissions = async () => {
    try {
      // Check camera permission
      if ('permissions' in navigator) {
        const cameraStatus = await navigator.permissions.query({
          name: 'camera' as PermissionName,
        });
        setPermissions((prev) => ({
          ...prev,
          camera: cameraStatus.state as 'granted' | 'denied' | 'prompt',
        }));

        // Check microphone permission
        const micStatus = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        setPermissions((prev) => ({
          ...prev,
          microphone: micStatus.state as 'granted' | 'denied' | 'prompt',
        }));
      }
    } catch (err) {
      console.error('[PermissionsDialog] Error checking permissions:', err);
    }
  };

  const handleRequestPermissions = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      const constraints: MediaStreamConstraints = {
        audio: selectedDevices.microphone,
        video: selectedDevices.camera ? { width: 1280, height: 720 } : false,
      };

      console.log('[PermissionsDialog] Requesting permissions:', constraints);
      await onRequestPermissions(constraints);
      setShowDialog(false);
      await checkPermissions();
    } catch (err) {
      const error = err as DOMException;
      console.error('[PermissionsDialog] Permission request failed:', error.message);

      if (error.name === 'NotAllowedError') {
        setError('Permission denied by user. Please enable camera/microphone in settings.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera or microphone device found.');
      } else if (error.name === 'NotReadableError') {
        setError('Camera/microphone is already in use by another app.');
      } else {
        setError(`Permission error: ${error.message}`);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  React.useEffect(() => {
    checkPermissions();
  }, []);

  return (
    <>
      {/* Permission Status Indicators */}
      <div className="flex gap-2 mb-4">
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            permissions.camera === 'granted'
              ? 'bg-green-500/20 text-green-400'
              : permissions.camera === 'denied'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          <Camera className="w-4 h-4" />
          Camera: {permissions.camera === 'unknown' ? 'checking...' : permissions.camera}
        </div>

        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
            permissions.microphone === 'granted'
              ? 'bg-green-500/20 text-green-400'
              : permissions.microphone === 'denied'
                ? 'bg-red-500/20 text-red-400'
                : 'bg-yellow-500/20 text-yellow-400'
          }`}
        >
          <Mic className="w-4 h-4" />
          Microphone: {permissions.microphone === 'unknown' ? 'checking...' : permissions.microphone}
        </div>
      </div>

      {/* Request Button */}
      {(permissions.camera === 'prompt' || permissions.microphone === 'prompt') && (
        <Button
          onClick={() => setShowDialog(true)}
          className="w-full bg-maya-primary hover:bg-blue-600"
        >
          Enable Camera & Microphone
        </Button>
      )}

      {/* Permission Denied Warning */}
      {(permissions.camera === 'denied' || permissions.microphone === 'denied') && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-semibold text-sm">Permissions Denied</p>
            <p className="text-red-300 text-xs mt-1">
              Please enable camera and microphone permissions in your browser settings to use video chat.
            </p>
          </div>
        </div>
      )}

      {/* Permission Request Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable Media Devices</DialogTitle>
            <DialogDescription>
              Maya needs access to your camera and microphone to provide the best experience.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Device Selection */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDevices.camera}
                  onChange={(e) =>
                    setSelectedDevices((prev) => ({ ...prev, camera: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                <Camera className="w-4 h-4" />
                <span>Camera</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDevices.microphone}
                  onChange={(e) =>
                    setSelectedDevices((prev) => ({ ...prev, microphone: e.target.checked }))
                  }
                  className="w-4 h-4"
                />
                <Mic className="w-4 h-4" />
                <span>Microphone</span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestPermissions}
                disabled={isRequesting || (!selectedDevices.camera && !selectedDevices.microphone)}
                className="flex-1 bg-maya-primary hover:bg-blue-600"
              >
                {isRequesting ? 'Requesting...' : 'Request Access'}
              </Button>
            </div>

            {/* Security Notice */}
            <p className="text-xs text-gray-400">
              Your camera and microphone feed remain private and are only shared with participants in the room.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PermissionsDialog;
