import React, {
  useCallback,
  useEffect,
  useState,
  useRef,
  memo,
  Component } from
'react';
// ============================================
// Maya — MeetingReactions Component
// ============================================
// Floating emoji reactions that animate across the video grid,
// plus a reaction picker in the controls bar.

import type { MeetingReaction } from '../types';
interface MeetingReactionsProps {
  reactions: MeetingReaction[];
}
/** Single floating reaction with CSS animation */
function FloatingReaction({ reaction }: {reaction: MeetingReaction;}) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, []);
  if (!visible) return null;
  return (
    <div
      className="absolute bottom-0 pointer-events-none animate-float-up"
      style={{
        left: `${reaction.x}%`,
        animationDuration: `${2.5 + Math.random()}s`
      }}>
      
      <div className="flex flex-col items-center gap-1">
        <span className="text-3xl drop-shadow-lg">{reaction.emoji}</span>
        <span className="text-[10px] text-white/70 bg-black/30 rounded-full px-2 py-0.5 whitespace-nowrap">
          {reaction.userName}
        </span>
      </div>
    </div>);

}
export const MeetingReactions = memo(function MeetingReactions({
  reactions
}: MeetingReactionsProps) {
  // Only show reactions from last 4 seconds
  const recentReactions = reactions.filter(
    (r) => Date.now() - r.timestamp < 4000
  );
  if (recentReactions.length === 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {recentReactions.map((reaction) =>
      <FloatingReaction key={reaction.id} reaction={reaction} />
      )}
    </div>);

});