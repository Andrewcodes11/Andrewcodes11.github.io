const LAYOUT_TEMPLATE_IDS = [
  'poster-huge',
  'editorial-split',
  'scrapbook-collage',
  'swiss-grid',
  'stacked-statement',
  'quote-card',
  'big-stat-callout',
  'cinematic-letterbox',
  'checklist-flashcard',
  'magazine-masthead'
];

const LAYOUT_TEMPLATES = {
  'poster-huge': {
    id: 'poster-huge',
    className: 'layout-poster-huge',
    allowsOverflow: true,
    usesSplitScreen: false,
    textTransform: 'uppercase'
  },
  'editorial-split': {
    id: 'editorial-split',
    className: 'layout-editorial-split',
    allowsOverflow: false,
    usesSplitScreen: true,
    textTransform: 'none'
  },
  'scrapbook-collage': {
    id: 'scrapbook-collage',
    className: 'layout-scrapbook-collage',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none'
  },
  'swiss-grid': {
    id: 'swiss-grid',
    className: 'layout-swiss-grid',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none'
  },
  'stacked-statement': {
    id: 'stacked-statement',
    className: 'layout-stacked-statement',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none',
    usesChunks: true
  },
  'quote-card': {
    id: 'quote-card',
    className: 'layout-quote-card',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none'
  },
  'big-stat-callout': {
    id: 'big-stat-callout',
    className: 'layout-big-stat-callout',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none'
  },
  'cinematic-letterbox': {
    id: 'cinematic-letterbox',
    className: 'layout-cinematic-letterbox',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none'
  },
  'checklist-flashcard': {
    id: 'checklist-flashcard',
    className: 'layout-checklist-flashcard',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none',
    usesChunks: true
  },
  'magazine-masthead': {
    id: 'magazine-masthead',
    className: 'layout-magazine-masthead',
    allowsOverflow: false,
    usesSplitScreen: false,
    textTransform: 'none'
  }
};

const LAYOUTS_WITH_OWN_LABEL = ['swiss-grid', 'magazine-masthead'];
