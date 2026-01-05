// Re-export from shared package
export {
  getWordCount,
  getCharCount,
  getReadingTime,
  truncate,
  extractFirstLine,
  stripHtmlBasic,
  formatRelativeTime,
} from '@note-app/shared-utils';

// Web-specific implementation using DOM APIs
export function stripHtml(html: string): string {
  if (typeof document === 'undefined') {
    // SSR fallback to basic implementation
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim();
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}
