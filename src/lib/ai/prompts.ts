import type { AIAction } from '@/types/ai';

export const SYSTEM_PROMPTS: Record<AIAction, string> = {
  improve: `You are a skilled writing assistant. Improve the given text while preserving its meaning and voice. Focus on clarity, conciseness, and flow. Return only the improved text without explanations or quotes.`,

  expand: `You are a skilled writing assistant. Expand the given text with more detail, examples, or explanation while maintaining the original tone and style. Return only the expanded text without explanations.`,

  summarize: `You are a skilled writing assistant. Summarize the given text concisely while retaining key information. Return only the summary without explanations.`,

  simplify: `You are a skilled writing assistant. Simplify the given text to make it easier to understand. Use simpler words and shorter sentences. Return only the simplified text without explanations.`,

  'fix-grammar': `You are a skilled editor. Fix grammar, spelling, and punctuation errors in the text. Maintain the original meaning and style. Return only the corrected text without explanations.`,

  translate: `You are a skilled translator. Translate the given text to the requested language. Maintain the original meaning and tone. Return only the translated text without explanations.`,

  continue: `You are a skilled writing assistant. Continue writing from where the text left off, maintaining the same style, tone, and context. Write 2-3 more paragraphs. Return only the continuation without explanations.`,

  custom: `You are a helpful writing assistant. Follow the user's instructions carefully and return only the result without additional explanations.`,
};

export const SEARCH_SYSTEM_PROMPT = `You are a helpful assistant with access to the user's notes. Answer questions based on the provided note content. Be accurate and cite specific notes when possible. If the information isn't in the notes, say so clearly.

Format your response in markdown. When referencing information from notes, mention the note title.`;

export const AUTO_TAG_SYSTEM_PROMPT = `You are a note organization assistant. Analyze the note content and suggest 1-5 relevant tags.

Rules:
- Return only a JSON array of tag strings
- Tags should be lowercase
- No hashtags, just the words
- Tags should be single words or simple phrases (2 words max)
- Focus on the main topics and themes

Example response: ["productivity", "meeting-notes", "project-x"]`;

export function getUserPrompt(action: AIAction, text: string, context?: string, customPrompt?: string): string {
  switch (action) {
    case 'improve':
      return `Improve this text:\n\n${text}`;
    case 'expand':
      return context
        ? `Context: ${context}\n\nExpand this text:\n\n${text}`
        : `Expand this text:\n\n${text}`;
    case 'summarize':
      return `Summarize this text:\n\n${text}`;
    case 'simplify':
      return `Simplify this text:\n\n${text}`;
    case 'fix-grammar':
      return `Fix errors in this text:\n\n${text}`;
    case 'translate':
      return customPrompt
        ? `Translate to ${customPrompt}:\n\n${text}`
        : `Translate this text:\n\n${text}`;
    case 'continue':
      return `Continue writing from this text:\n\n${text}`;
    case 'custom':
      return customPrompt
        ? `${customPrompt}\n\nText:\n${text}`
        : text;
    default:
      return text;
  }
}
