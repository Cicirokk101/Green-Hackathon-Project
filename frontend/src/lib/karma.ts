// ===== Karma design tokens (JS mirror of styles/tokens for inline styles) =====
export const K = {
  // surfaces
  paper: '#FFF6EC',
  card: '#FFFFFF',
  border: '#EFEAE2',
  borderWarm: '#E4D8C4',
  // ink / text
  ink: '#221A12',
  text: '#3A2E20',
  muted: '#6F6253',
  faint: '#9A8C79',
  // brand
  orange: '#F26A21',
  orangeDeep: '#C75A12',
  terra: '#C6532A',
  terraDeep: '#B5472A',
  leaf: '#1F8A52',
  forest: '#2F6B45',
  leafBg: '#DCF3E4',
  gold: '#F7B53B',
  goldDeep: '#D99A2B',
  goldText: '#7A4E07',
  orangeBg: '#FFF1DF',
  // fonts
  serif: "'Newsreader', Georgia, serif",
  sans: "'Hanken Grotesk', system-ui, sans-serif",
  shadow: '0 6px 22px rgba(43,34,24,0.08)',
  shadowLg: '0 14px 40px rgba(43,34,24,0.16)',
} as const;

// category color map (used on cards / chips / tags)
export type CategoryName = 'Garden' | 'Cleanup' | 'Repair' | 'Skill-share' | 'Mutual aid';

export const CAT: Record<CategoryName, { fg: string; g: [string, string] }> = {
  Garden:        { fg: '#1F8A52', g: ['#1F8A52', '#5BB47A'] },
  Cleanup:       { fg: '#2F6B45', g: ['#2F6B45', '#5BB47A'] },
  Repair:        { fg: '#C6532A', g: ['#C6532A', '#F0903F'] },
  'Skill-share': { fg: '#B5862A', g: ['#D99A2B', '#F7B53B'] },
  'Mutual aid':  { fg: '#C6532A', g: ['#B5472A', '#E0673A'] },
};

// avatar background colors keyed by initials
export const AV: Record<string, string> = {
  DA: '#C6532A', JK: '#2F6B45', PL: '#C6532A', SM: '#2F6B45', TN: '#C6532A',
  MR: '#F26A21', RW: '#1F8A52', LO: '#D99A2B', EH: '#2F6B45',
};
