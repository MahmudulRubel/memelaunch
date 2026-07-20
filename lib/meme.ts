export interface MemeCaptionData {
  textAbove?: string;
  textBelow?: string;
  position: 'above' | 'below' | 'both';
  color: string;
  size: number; // font size in px
}

export function parseCaption(captionStr: string): MemeCaptionData {
  if (!captionStr) {
    return {
      textAbove: '',
      textBelow: '',
      position: 'below',
      color: '#ffffff',
      size: 20,
    };
  }

  const trimmed = captionStr.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      return {
        textAbove: parsed.textAbove || '',
        textBelow: parsed.textBelow || '',
        position: parsed.position || 'below',
        color: parsed.color || '#ffffff',
        size: typeof parsed.size === 'number' ? parsed.size : 20,
      };
    } catch (e) {
      // Ignore JSON parsing errors
    }
  }

  // Fallback to legacy plain text
  return {
    textAbove: '',
    textBelow: captionStr,
    position: 'below',
    color: '#ffffff',
    size: 20,
  };
}

export function getCaptionText(captionStr: string): string {
  const parsed = parseCaption(captionStr);
  if (parsed.position === 'both') {
    return `${parsed.textAbove || ''} ${parsed.textBelow || ''}`.trim();
  }
  if (parsed.position === 'above') {
    return parsed.textAbove || '';
  }
  return parsed.textBelow || '';
}
