export interface MemeCaptionData {
  textAbove?: string;
  textBelow?: string;
  position: 'above' | 'below' | 'both';
  color: string;
  size: number; // font size in px
  topAbove?: number;
  leftAbove?: number;
  topBelow?: number;
  leftBelow?: number;
  widthAbove?: number;
  widthBelow?: number;
  hideOverlay?: boolean;
}

export function parseCaption(captionStr: string): MemeCaptionData {
  if (!captionStr) {
    return {
      textAbove: '',
      textBelow: '',
      position: 'below',
      color: '#ffffff',
      size: 20,
      hideOverlay: false,
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
        topAbove: typeof parsed.topAbove === 'number' ? parsed.topAbove : undefined,
        leftAbove: typeof parsed.leftAbove === 'number' ? parsed.leftAbove : undefined,
        topBelow: typeof parsed.topBelow === 'number' ? parsed.topBelow : undefined,
        leftBelow: typeof parsed.leftBelow === 'number' ? parsed.leftBelow : undefined,
        widthAbove: typeof parsed.widthAbove === 'number' ? parsed.widthAbove : undefined,
        widthBelow: typeof parsed.widthBelow === 'number' ? parsed.widthBelow : undefined,
        hideOverlay: !!parsed.hideOverlay,
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
