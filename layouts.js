const LAYOUT_TEMPLATE_IDS = [
  'poster-huge',
  'editorial-split',
  'scrapbook-collage',
  'swiss-grid',
  'stacked-statement'
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
  }
};
