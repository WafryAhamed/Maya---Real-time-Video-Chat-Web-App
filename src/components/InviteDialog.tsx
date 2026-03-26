import React, { useCallback, useState, memo, Component } from 'react';
// ============================================
// Maya — InviteDialog Component (NEW)
// ============================================
// Modal to share room link with copy-to-clipboard.

import { Copy, Check, Link2, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
'./ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
}
export const InviteDialog = memo(function InviteDialog({
  open,
  onOpenChange,
  roomId
}: InviteDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareLink = `${window.location.origin}/#room/${roomId}`;
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {

      // Fallback — select the input text
    }setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareLink]);
  const handleCopyId = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(roomId);
    } catch {

      // Fallback
    }setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [roomId]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-maya-light border-0">
        <DialogHeader>
          <DialogTitle className="text-maya-dark font-heading flex items-center gap-2">
            <Share2 className="h-5 w-5 text-maya-primary" />
            Invite People
          </DialogTitle>
          <DialogDescription className="text-maya-text">
            Share this link with Sri Lankan colleagues to invite them to join.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Share link */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-maya-dark">
              <Link2 className="h-4 w-4 text-maya-primary" />
              Meeting Link
            </label>
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="flex-1 bg-white border-maya-text/20 text-maya-dark text-sm font-mono" />
              
              <Button
                className="bg-maya-primary hover:bg-maya-primary/90 text-white border-0 shrink-0"
                onClick={handleCopy}>
                
                {copied ?
                <Check className="h-4 w-4 mr-1.5 text-green-300" /> :

                <Copy className="h-4 w-4 mr-1.5" />
                }
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Room ID */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-maya-dark">
              Room ID
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-maya-text/20 rounded-lg px-3 py-2 text-sm font-mono text-maya-dark">
                {roomId}
              </code>
              <Button
                variant="outline"
                size="sm"
                className="border-maya-text/20 text-maya-text hover:bg-maya-accent shrink-0"
                onClick={handleCopyId}>
                
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>);

});