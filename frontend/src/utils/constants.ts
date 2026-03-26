// ============================================
// Maya — Constants (Enhanced)
// ============================================

import type { MockDevice, UserPreferences } from '../types';

/** Socket server URL */
export const SOCKET_SERVER_URL = 'http://localhost:5000';

/** WebRTC ICE server configuration */
export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' }]

};

/** Media constraints for getUserMedia */
export const MEDIA_CONSTRAINTS: MediaStreamConstraints = {
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: 'user'
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true
  }
};

/** Maya brand colors */
export const MAYA_COLORS = {
  dark: '#0b3c5d',
  primary: '#328cc1',
  accent: '#d9e8f5',
  light: '#f4f4f4',
  text: '#707070',
  danger: '#e74c3c'
} as const;

/** Chat message max length */
export const MAX_MESSAGE_LENGTH = 500;

/** Common emoji list for quick picker */
export const EMOJI_LIST = [
'👍',
'😂',
'❤️',
'🔥',
'👏',
'🎉',
'😊',
'🤔',
'👋',
'✅',
'💯',
'🙌',
'😍',
'🤝',
'💪',
'🚀',
'⭐',
'🎯',
'💡',
'📌'] as
const;

/** Mock camera devices */
export const MOCK_CAMERAS: MockDevice[] = [
{ id: 'cam-1', label: 'FaceTime HD Camera' },
{ id: 'cam-2', label: 'Logitech C920 HD Pro' },
{ id: 'cam-3', label: 'USB Camera (External)' }];


/** Mock microphone devices */
export const MOCK_MICROPHONES: MockDevice[] = [
{ id: 'mic-1', label: 'Built-in Microphone' },
{ id: 'mic-2', label: 'Blue Yeti USB Microphone' },
{ id: 'mic-3', label: 'AirPods Pro' }];


/** Default user preferences */
export const DEFAULT_PREFERENCES: UserPreferences = {
  selectedCamera: 'cam-1',
  selectedMicrophone: 'mic-1',
  layoutMode: 'auto',
  theme: 'dark'
};

/** localStorage key for preferences */
export const PREFERENCES_STORAGE_KEY = 'maya-preferences';

// ============================================
// AI Assistant Constants
// ============================================

/** AI assistant name */
export const AI_ASSISTANT_NAME = 'Maya AI';

/** AI welcome message */
export const AI_WELCOME_MESSAGE = `Hi! I'm **Maya AI**, your Sri Lankan meeting assistant. I can help you with:

• **/summarize** — Get a summary of key discussions
• **/actions** — Extract team action items
• **/mood** — Analyze team sentiment
• **/notes** — Generate meeting notes
• **/translate [text]** — Translate to English
• **/help** — Show all commands

Ask me anything about your meeting! 💡`;

/** AI mock responses for different queries */
export const AI_RESPONSES = {
  summarize: [
  `📋 **Meeting Summary**\n\nThe team discussed project progress and upcoming milestones. Key topics included:\n\n• Sprint planning for next week\n• Design review feedback\n• Client presentation timeline\n\nOverall tone: Productive and collaborative.`,
  `📋 **Meeting Summary**\n\nParticipants covered several important topics:\n\n• Budget allocation for Q2\n• New feature prioritization\n• Team capacity planning\n\nThe discussion was focused and action-oriented.`],

  actions: [
  `✅ **Action Items Detected**\n\n1. **Review design mockups** — Assigned to team\n2. **Update project timeline** — Due by Friday\n3. **Schedule follow-up meeting** — Next week\n4. **Share meeting notes** — After this call`,
  `✅ **Action Items Detected**\n\n1. **Prepare demo for client** — Due Thursday\n2. **Fix reported bugs** — High priority\n3. **Update documentation** — By end of sprint\n4. **Send status report** — Today`],

  mood: [
  `🎭 **Meeting Mood Analysis**\n\n• **Overall Sentiment:** Positive 😊\n• **Energy Level:** High ⚡\n• **Engagement:** 85% active participation\n• **Collaboration Score:** 9/10\n\nThe team seems motivated and aligned!`,
  `🎭 **Meeting Mood Analysis**\n\n• **Overall Sentiment:** Focused 🎯\n• **Energy Level:** Moderate\n• **Engagement:** 72% active participation\n• **Collaboration Score:** 8/10\n\nGood productive energy in this meeting.`],

  notes: [
  `📝 **Auto-Generated Meeting Notes**\n\n**Date:** ${new Date().toLocaleDateString()}\n**Duration:** Active meeting\n**Participants:** All present\n\n**Discussion Points:**\n1. Project status update — on track\n2. Design feedback — minor revisions needed\n3. Next steps — sprint planning\n\n**Decisions Made:**\n• Proceed with current approach\n• Schedule design review for Thursday\n\n**Next Meeting:** TBD`],

  help: [
  `🤖 **Maya AI Commands**\n\n• **/summarize** — Summarize the conversation so far\n• **/actions** — Extract action items from the chat\n• **/mood** — Analyze the meeting mood & sentiment\n• **/notes** — Generate formatted meeting notes\n• **/translate [text]** — Translate text to English\n• **/help** — Show this help message\n\nYou can also ask me questions like:\n• "What were the main topics discussed?"\n• "Who has been most active?"\n• "Any decisions made?"`],

  translate: [
  `🌐 **Translation**\n\n*Original:* (detected language)\n*English:* "The project is progressing well and we should have the deliverables ready by next week."\n\n_Note: This is a simulated translation._`],

  general: [
  `That's a great question! Based on the meeting context, I'd suggest discussing this with the team and creating a specific action item for follow-up. Would you like me to add it to the action items list?`,
  `I've been tracking the conversation. The team seems aligned on the main objectives. Would you like me to generate a quick summary of what's been discussed so far?`,
  `Good point! I noticed several participants have mentioned similar concerns. It might be worth creating a poll to get everyone's input. Want me to help with that?`,
  `Based on the meeting flow, it looks like you're about halfway through the agenda. The energy level is good and participation is balanced. Keep it up! 🚀`,
  `I can help with that! Here are a few suggestions based on the current discussion:\n\n1. Create a shared document for tracking\n2. Assign clear owners for each task\n3. Set a follow-up checkpoint\n\nWould any of these be helpful?`]

} as const;

/** Reaction emojis for meeting reactions */
export const REACTION_EMOJIS = [
'👍',
'❤️',
'😂',
'🎉',
'🤔',
'👏',
'🔥',
'💯'] as
const;

/** Poll template questions */
export const POLL_TEMPLATES = [
{
  question: 'Should we continue the discussion?',
  options: [
  'Yes, 15 more minutes',
  "Let's finish up",
  "Schedule follow-up"]

},
{
  question: "How's the meeting flow?",
  options: ['Moving quickly', 'Just right', 'Too slow']
},
{
  question: 'Ready for next topic?',
  options: ['Yes', 'Need clarification', 'Move on']
}] as
const;