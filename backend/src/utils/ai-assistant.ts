// ============================================
// Maya Backend — AI Assistant Utility (Mock)
// ============================================
// Provides mock responses for AI features
// Can be replaced with OpenAI API integration

export class AIAssistant {
  private static responses = {
    summarize: [
      'Based on our discussion, the key points were: 1) We discussed project timelines, 2) Allocated resources for Q1, 3) Set next meeting for follow-up. Overall, the team is aligned on priorities.',
      'Meeting summary: Team reviewed Q4 results, discussed budget allocation, and confirmed next steps. Team sentiment is positive, engagement level is high.',
      'Key discussion points: Product roadmap update, customer feedback analysis, and resource planning. Action items assigned to respective teams.',
    ],
    actions: [
      '1. Sarah to prepare detailed timeline by Friday\n2. John to coordinate with design team\n3. Team to review proposals before next meeting\n4. Schedule follow-up with stakeholders',
      '1. Complete project specification document\n2. Set up development environment\n3. Create testing plan\n4. Schedule checkpoint meeting',
    ],
    mood: [
      'The meeting mood is positive and productive! Team members are engaged and collaborative. Energy level is high.',
      'Atmosphere is focused and professional. Team is aligned on goals. Engagement is moderate-to-high.',
      'Upbeat and energetic! Team is excited about next steps. Collaboration is strong.',
    ],
    notes: [
      'Meeting held on time. Key stakeholders present. Good discussion on implementation approach. Team ready to move forward.',
      'Productive session. Covered all agenda items. Clear decisions made. Next steps well-defined.',
    ],
    translate: [
      'This appears to be in English already. Would you like me to translate it to another language?',
      'Language detection: English. Please specify target language for translation.',
    ],
    general: [
      'I\'m here to help! Try /summarize for meeting summary, /actions for action items, /mood for team mood, or /notes for meeting notes.',
      'How can I assist you today? You can use slash commands like /help for available features.',
      'I can help with meeting insights. Try asking about key points, action items, or meeting mood!',
    ],
  };

  /**
   * Get AI response for a query
   */
  static getResponse(command?: string): string {
    if (!command) {
      return this.randomPick(this.responses.general);
    }

    const key = command.replace('/', '') as keyof typeof AIAssistant.responses;
    const responses = (this.responses as any)[key];

    if (responses) {
      return this.randomPick(responses);
    }

    return this.randomPick(this.responses.general);
  }

  /**
   * Get welcome message
   */
  static getWelcomeMessage(): string {
    return '👋 Welcome to Maya AI Assistant! I can help you with meeting insights. Try commands like:\n\n/summarize - Get meeting summary\n/actions - List action items\n/mood - Detect team mood\n/notes - See meeting notes\n/translate - Translate content\n\nOr just chat with me!';
  }

  /**
   * Stream response character by character
   */
  static* streamResponse(text: string, charsPerTick: number = 5): Generator<string> {
    let charIndex = 0;
    while (charIndex < text.length) {
      charIndex = Math.min(charIndex + charsPerTick, text.length);
      yield text.slice(0, charIndex);
    }
  }

  /**
   * Generate action items
   */
  static generateActionItems(): Array<{
    id: string;
    text: string;
    assignee?: string;
    completed: boolean;
  }> {
    const actions = [
      'Prepare project proposal',
      'Review team feedback',
      'Coordinate with design',
      'Update documentation',
      'Schedule client meeting',
    ];

    return actions.map((text, idx) => ({
      id: `action-${idx}`,
      text,
      assignee: undefined,
      completed: false,
    }));
  }

  /**
   * Detect meeting mood
   */
  static detectMood(): 'positive' | 'neutral' | 'focused' | 'energetic' {
    const moods: Array<'positive' | 'neutral' | 'focused' | 'energetic'> = [
      'positive',
      'neutral',
      'focused',
      'energetic',
    ];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  /**
   * Calculate participation score
   */
  static calculateParticipationScore(speakerCount: number, totalParticipants: number): number {
    return Math.round((speakerCount / totalParticipants) * 100);
  }

  private static randomPick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
}

export default AIAssistant;
