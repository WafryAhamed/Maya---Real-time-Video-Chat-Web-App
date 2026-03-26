import React, { useCallback, useState, memo, Component } from 'react';
// ============================================
// Maya — QuickPoll Component
// ============================================
// Create and vote on instant polls during meetings.

import { BarChart3, Plus, X, Check, Vote } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { Separator } from './ui/Separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter } from
'./ui/Dialog';
import type { QuickPoll as QuickPollType, PollOption } from '../types';
import { POLL_TEMPLATES } from '../utils/constants';
interface QuickPollProps {
  poll: QuickPollType | null;
  currentUserId: string;
  onCreatePoll: (question: string, options: string[]) => void;
  onVote: (pollId: string, optionId: string) => void;
  onClosePoll: () => void;
}
/** Create poll dialog */
function CreatePollDialog({
  open,
  onOpenChange,
  onCreatePoll




}: {open: boolean;onOpenChange: (open: boolean) => void;onCreatePoll: (question: string, options: string[]) => void;}) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const handleAddOption = useCallback(() => {
    if (options.length < 5) {
      setOptions((prev) => [...prev, '']);
    }
  }, [options.length]);
  const handleRemoveOption = useCallback(
    (index: number) => {
      if (options.length > 2) {
        setOptions((prev) => prev.filter((_, i) => i !== index));
      }
    },
    [options.length]
  );
  const handleOptionChange = useCallback((index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => i === index ? value : o));
  }, []);
  const handleSubmit = useCallback(() => {
    const trimmedQ = question.trim();
    const trimmedOpts = options.map((o) => o.trim()).filter(Boolean);
    if (trimmedQ && trimmedOpts.length >= 2) {
      onCreatePoll(trimmedQ, trimmedOpts);
      setQuestion('');
      setOptions(['', '']);
      onOpenChange(false);
    }
  }, [question, options, onCreatePoll, onOpenChange]);
  const handleTemplate = useCallback(
    (template: {question: string;options: readonly string[];}) => {
      setQuestion(template.question);
      setOptions([...template.options]);
    },
    []
  );
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-maya-light border-0">
        <DialogHeader>
          <DialogTitle className="text-maya-dark font-heading flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-maya-primary" />
            Create Quick Poll
          </DialogTitle>
          <DialogDescription className="text-maya-text">
            Get instant feedback from participants.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Templates */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-maya-text">
              Quick Templates
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {POLL_TEMPLATES.map((t, i) =>
              <button
                key={i}
                onClick={() => handleTemplate(t)}
                className="text-xs px-2.5 py-1 rounded-full bg-white border border-maya-primary/20 text-maya-text hover:bg-maya-primary/5 hover:text-maya-primary transition-colors">
                
                  {t.question}
                </button>
              )}
            </div>
          </div>

          <Separator className="bg-maya-text/10" />

          {/* Question */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-maya-dark">
              Question
            </label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What would you like to ask?"
              className="bg-white border-maya-text/20 text-maya-dark" />
            
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-maya-dark">
              Options
            </label>
            {options.map((opt, i) =>
            <div key={i} className="flex gap-2">
                <Input
                value={opt}
                onChange={(e) => handleOptionChange(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 bg-white border-maya-text/20 text-maya-dark text-sm" />
              
                {options.length > 2 &&
              <Button
                size="icon-sm"
                variant="ghost"
                className="text-maya-text hover:text-maya-danger shrink-0"
                onClick={() => handleRemoveOption(i)}>
                
                    <X className="h-3.5 w-3.5" />
                  </Button>
              }
              </div>
            )}
            {options.length < 5 &&
            <Button
              size="sm"
              variant="ghost"
              className="text-maya-primary hover:bg-maya-primary/5 text-xs w-full"
              onClick={handleAddOption}>
              
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Option
              </Button>
            }
          </div>
        </div>

        <DialogFooter>
          <Button
            className="bg-maya-primary hover:bg-maya-primary/90 text-white border-0"
            onClick={handleSubmit}
            disabled={
            !question.trim() || options.filter((o) => o.trim()).length < 2
            }>
            
            <Vote className="h-4 w-4 mr-1.5" />
            Launch Poll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>);

}
/** Active poll display */
function ActivePoll({
  poll,
  currentUserId,
  onVote,
  onClose





}: {poll: QuickPollType;currentUserId: string;onVote: (pollId: string, optionId: string) => void;onClose: () => void;}) {
  const hasVoted = poll.options.some((o) => o.votes.includes(currentUserId));
  const totalVotes = poll.options.reduce((sum, o) => sum + o.votes.length, 0);
  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 w-80 bg-white rounded-2xl shadow-2xl shadow-black/20 border border-maya-primary/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-maya-primary to-purple-500 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-white" />
          <span className="text-white text-sm font-semibold">Quick Poll</span>
        </div>
        <Button
          size="icon-xs"
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 rounded-full h-6 w-6"
          onClick={onClose}>
          
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Question */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-maya-dark font-medium text-sm">{poll.question}</p>
        <p className="text-maya-text text-xs mt-0.5">
          {totalVotes} vote{totalVotes !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Options */}
      <div className="px-4 pb-4 space-y-2">
        {poll.options.map((option) => {
          const voteCount = option.votes.length;
          const percentage =
          totalVotes > 0 ? Math.round(voteCount / totalVotes * 100) : 0;
          const isMyVote = option.votes.includes(currentUserId);
          return (
            <button
              key={option.id}
              onClick={() => !hasVoted && onVote(poll.id, option.id)}
              disabled={hasVoted}
              className={`w-full relative rounded-xl overflow-hidden transition-all ${hasVoted ? 'cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-maya-primary/30'} ${isMyVote ? 'ring-2 ring-maya-primary' : ''}`}>
              
              {/* Progress bar background */}
              <div
                className={`absolute inset-0 transition-all duration-500 ${isMyVote ? 'bg-maya-primary/15' : 'bg-maya-accent/50'}`}
                style={{
                  width: hasVoted ? `${percentage}%` : '0%'
                }} />
              

              <div className="relative flex items-center justify-between px-3 py-2.5 border border-maya-text/10 rounded-xl">
                <div className="flex items-center gap-2">
                  {isMyVote &&
                  <Check className="h-3.5 w-3.5 text-maya-primary" />
                  }
                  <span
                    className={`text-sm ${isMyVote ? 'text-maya-primary font-medium' : 'text-maya-dark'}`}>
                    
                    {option.text}
                  </span>
                </div>
                {hasVoted &&
                <span className="text-xs text-maya-text font-medium">
                    {percentage}%
                  </span>
                }
              </div>
            </button>);

        })}
      </div>
    </div>);

}
export const QuickPoll = memo(function QuickPoll({
  poll,
  currentUserId,
  onCreatePoll,
  onVote,
  onClosePoll
}: QuickPollProps) {
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <>
      <CreatePollDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreatePoll={onCreatePoll} />
      
      {poll && poll.isActive &&
      <ActivePoll
        poll={poll}
        currentUserId={currentUserId}
        onVote={onVote}
        onClose={onClosePoll} />

      }
    </>);

});
/** Export the create dialog trigger for Controls */
export { CreatePollDialog };