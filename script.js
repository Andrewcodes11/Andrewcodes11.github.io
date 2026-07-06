(function () {
  'use strict';

  const SLIDE_W = 1080;
  const SLIDE_H = 1350;
  const MOBILE_SCREEN_W = 366;

  const THEMES = ['cream', 'sage', 'dusty', 'oat'];
  const FONT_PAIRINGS = ['pairing-a', 'pairing-b'];
  const DOODLE_TYPE_LIST = ['circle', 'underline', 'arrow'];
  const DOODLE_VARIANTS = { circle: ['a', 'b', 'c'], underline: ['a', 'b', 'c'], arrow: ['a', 'b', 'c'] };
  const FONT_SIZE_OPTIONS = ['small', 'medium', 'big'];

  const state = {
    topic: '',
    structureId: CAROUSEL_STRUCTURES[0].id,
    slides: [],
    theme: 'cream',
    fonts: 'pairing-a',
    rotations: [],
    doodles: [],
    layouts: [],
    layoutMeta: [],
    fontSizes: [],
    previewMode: 'desktop',
    mobileSlideIndex: 0,
    generated: false
  };

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const topicInput = $('#topic-input');
  const structurePicker = $('#structure-picker');
  const slideInputs = $('#slide-inputs');
  const generateBtn = $('#generate-btn');
  const generateHint = $('#generate-hint');
  const shuffleBtn = $('#shuffle-btn');
  const previewEmpty = $('#preview-empty');
  const previewArea = $('#preview-area');
  const previewToolbar = $('#preview-toolbar');
  const previewCanvas = $('#preview-canvas');
  const slidesRow = $('#slides-row');
  const mobileDots = $('#mobile-dots');
  const mobileCounter = $('#mobile-counter');
  const mobilePrev = $('#mobile-prev');
  const mobileNext = $('#mobile-next');
  const postGenerate = $('#post-generate');
  const exportAll = $('#export-all');
  const downloadZipBtn = $('#download-zip-btn');

  function init() {
    renderStructurePicker();
    renderSlideInputs();
    bindEvents();
    updateGenerateButton();
    updatePreviewScale();
    window.addEventListener('resize', updatePreviewScale);
  }

  function renderStructurePicker() {
    structurePicker.innerHTML = CAROUSEL_STRUCTURES.map((s) => `
      <button type="button" class="structure-card${s.id === state.structureId ? ' selected' : ''}" data-id="${s.id}">
        <div class="structure-card-name">${escapeHtml(s.name)}</div>
        <div class="structure-card-desc">${escapeHtml(s.description)}</div>
      </button>
    `).join('');
  }

  function getStructure() {
    return CAROUSEL_STRUCTURES.find((s) => s.id === state.structureId);
  }

  function getTextareaValues() {
    return Array.from(slideInputs.querySelectorAll('.slide-textarea')).map((ta) => ta.value);
  }

  function renderSlideInputs() {
    const structure = getStructure();
    if (!structure) return;

    const saved = getTextareaValues();

    slideInputs.innerHTML = structure.slides.map((slide, i) => `
      <div class="slide-input-field">
        <label for="slide-input-${i}">${escapeHtml(slide.role)}</label>
        <textarea
          id="slide-input-${i}"
          class="slide-textarea"
          rows="3"
          placeholder="${escapeHtml(slide.placeholder)}"
          data-index="${i}"
        >${saved[i] || ''}</textarea>
        <p class="slide-input-hint">${escapeHtml(slide.helperText)}</p>
      </div>
    `).join('');

    slideInputs.querySelectorAll('.slide-textarea').forEach((ta) => {
      ta.addEventListener('input', updateGenerateButton);
    });

    updateGenerateButton();
  }

  function allSlidesFilled() {
    const textareas = slideInputs.querySelectorAll('.slide-textarea');
    if (textareas.length !== 5) return false;
    return Array.from(textareas).every((ta) => ta.value.trim().length > 0);
  }

  function updateGenerateButton() {
    const ready = allSlidesFilled();
    generateBtn.disabled = !ready;
    generateHint.hidden = ready;
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function randomRotation() {
    return (Math.random() * 3.6 - 1.8).toFixed(2);
  }

  function stripMarkup(text) {
    return text.replace(/\*([^*]+)\*/g, '$1').replace(/\s+/g, ' ').trim();
  }

  function splitTextIntoChunks(text) {
    const trimmed = text.trim();
    if (!trimmed) return [''];

    const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length >= 2) return sentences.slice(0, 3);

    const clauses = trimmed.split(/[,;—–-]\s+/).filter(Boolean);
    if (clauses.length >= 2) return clauses.slice(0, 3);

    const words = stripMarkup(trimmed).split(/\s+/).filter(Boolean);
    if (words.length <= 3) return [trimmed];

    const third = Math.ceil(words.length / 3);
    return [
      words.slice(0, third).join(' '),
      words.slice(third, third * 2).join(' '),
      words.slice(third * 2).join(' ')
    ].filter(Boolean);
  }

  function pickSplitAngle() {
    const skew = (Math.random() * 16 - 8).toFixed(1);
    const ratio = 35 + Math.floor(Math.random() * 26);
    const textSide = randomItem(['left', 'right']);
    return { skew, ratio, textSide };
  }

  function calcPosterFontSize(text) {
    const len = stripMarkup(text).length;
    if (len < 20) return Math.floor(160 + Math.random() * 21);
    if (len < 40) return Math.floor(120 + Math.random() * 21);
    if (len < 70) return Math.floor(100 + Math.random() * 21);
    return Math.floor(90 + Math.random() * 16);
  }

  function pickChunkMeta(chunks) {
    const sizes = ['sm', 'hero', 'sm', 'md'];
    const aligns = ['left', 'center', 'right'];
    return chunks.map((_, i) => ({
      size: i === 1 ? 'hero' : i === 0 ? 'sm' : randomItem(sizes),
      align: randomItem(aligns),
      rotate: (Math.random() * 4 - 2).toFixed(1)
    }));
  }

  function pickScrapMeta(text) {
    const chunks = splitTextIntoChunks(text);
    return {
      mainRotate: (Math.random() * 8 - 4).toFixed(1),
      accentRotate: (Math.random() * 10 - 5).toFixed(1),
      miniRotate: (Math.random() * 12 - 6).toFixed(1),
      tapeRotate: (Math.random() * 14 - 7).toFixed(1),
      chunks: chunks.length >= 2 ? chunks : [text, stripMarkup(text).split(/\s+/).slice(0, 2).join(' ') || '…']
    };
  }

  function pickSwissMeta(text) {
    const words = stripMarkup(text).split(/\s+/).filter(Boolean);
    const breakType = randomItem(['overflow', 'rotate-word']);
    return {
      breakType,
      breakWordIndex: words.length > 1 ? Math.floor(Math.random() * words.length) : 0
    };
  }

  function generateLayoutMeta(layoutId, text) {
    switch (layoutId) {
      case 'poster-huge':
        return {
          bleedSide: randomItem(['left', 'right']),
          fontSize: calcPosterFontSize(text)
        };
      case 'editorial-split':
        return pickSplitAngle();
      case 'scrapbook-collage':
        return pickScrapMeta(text);
      case 'swiss-grid':
        return pickSwissMeta(text);
      case 'stacked-statement':
        return { chunks: pickChunkMeta(splitTextIntoChunks(text)) };
      default:
        return {};
    }
  }

  function randomizeDesign() {
    state.theme = randomItem(THEMES);
    state.fonts = randomItem(FONT_PAIRINGS);
    state.rotations = Array.from({ length: 5 }, () => randomRotation());
    state.doodles = Array.from({ length: 5 }, () => {
      const type = randomItem(DOODLE_TYPE_LIST);
      return { type, variant: randomItem(DOODLE_VARIANTS[type]) };
    });
    state.layouts = Array.from({ length: 5 }, () => randomItem(LAYOUT_TEMPLATE_IDS));
    state.layoutMeta = state.layouts.map((layoutId, i) =>
      generateLayoutMeta(layoutId, state.slides[i]?.text || '')
    );
    syncFineTuneUI();
  }

  function syncFineTuneUI() {
    $$('.theme-swatch').forEach((s) => s.classList.toggle('active', s.dataset.theme === state.theme));
    $$('.font-btn').forEach((b) => b.classList.toggle('active', b.dataset.fonts === state.fonts));
    if (state.generated) {
      slidesRow.className = `slides-row fonts-${state.fonts}`;
    }
  }

  function bindEvents() {
    structurePicker.addEventListener('click', (e) => {
      const card = e.target.closest('.structure-card');
      if (!card) return;
      state.structureId = card.dataset.id;
      $$('.structure-card').forEach((c) => c.classList.toggle('selected', c.dataset.id === state.structureId));
      renderSlideInputs();
    });

    generateBtn.addEventListener('click', generate);
    shuffleBtn.addEventListener('click', shuffleDesign);

    topicInput.addEventListener('input', () => {
      state.topic = topicInput.value.trim();
    });

    $('#theme-swatches').addEventListener('click', (e) => {
      const swatch = e.target.closest('.theme-swatch');
      if (!swatch || !state.generated) return;
      state.theme = swatch.dataset.theme;
      syncFineTuneUI();
      applyThemeToSlides();
    });

    $('#font-toggle').addEventListener('click', (e) => {
      const btn = e.target.closest('.font-btn');
      if (!btn || !state.generated) return;
      state.fonts = btn.dataset.fonts;
      syncFineTuneUI();
    });

    downloadZipBtn.addEventListener('click', downloadAllAsZip);

    previewToolbar.addEventListener('click', (e) => {
      const btn = e.target.closest('.mode-btn');
      if (!btn) return;
      setPreviewMode(btn.dataset.mode);
    });

    mobilePrev.addEventListener('click', () => scrollMobileCarousel(-1));
    mobileNext.addEventListener('click', () => scrollMobileCarousel(1));

    slidesRow.addEventListener('scroll', () => {
      if (state.previewMode === 'mobile') syncMobileCarouselUI();
    }, { passive: true });
  }

  function setPreviewMode(mode) {
    if (!state.generated || (mode !== 'desktop' && mode !== 'mobile')) return;
    state.previewMode = mode;
    previewArea.classList.toggle('mode-mobile', mode === 'mobile');
    previewArea.classList.toggle('mode-desktop', mode === 'desktop');
    $$('.mode-btn').forEach((b) => b.classList.toggle('active', b.dataset.mode === mode));
    updatePreviewScale();
    if (mode === 'mobile') {
      renderMobileDots();
      scrollToMobileSlide(state.mobileSlideIndex, false);
      syncMobileCarouselUI();
    }
  }

  function renderMobileDots() {
    if (!mobileDots) return;
    mobileDots.innerHTML = state.slides.map((_, i) =>
      `<span class="carousel-dot${i === state.mobileSlideIndex ? ' active' : ''}" data-index="${i}"></span>`
    ).join('');
    mobileDots.querySelectorAll('.carousel-dot').forEach((dot) => {
      dot.addEventListener('click', () => scrollToMobileSlide(parseInt(dot.dataset.index, 10)));
    });
  }

  function getMobileSlideColumns() {
    return slidesRow.querySelectorAll('.slide-column');
  }

  function scrollToMobileSlide(index, smooth) {
    const columns = getMobileSlideColumns();
    if (!columns.length) return;
    const i = Math.max(0, Math.min(index, columns.length - 1));
    state.mobileSlideIndex = i;
    columns[i].scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'start', block: 'nearest' });
    syncMobileCarouselUI();
  }

  function scrollMobileCarousel(direction) {
    scrollToMobileSlide(state.mobileSlideIndex + direction, true);
  }

  function syncMobileCarouselUI() {
    if (state.previewMode !== 'mobile') return;
    const columns = getMobileSlideColumns();
    if (!columns.length) return;

    const colWidth = columns[0].offsetWidth || MOBILE_SCREEN_W;
    const closest = Math.max(0, Math.min(
      Math.round(slidesRow.scrollLeft / colWidth),
      columns.length - 1
    ));

    state.mobileSlideIndex = closest;
    if (mobileCounter) mobileCounter.textContent = `${closest + 1} / ${columns.length}`;
    mobileDots?.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === closest);
    });
  }

  function readSlidesFromTextareas() {
    const structure = getStructure();
    if (!structure) return;

    const values = getTextareaValues();
    state.slides = structure.slides.map((slide, i) => ({
      role: slide.role,
      text: values[i].trim(),
      helperText: slide.helperText,
      index: i
    }));
  }

  function generate() {
    if (!allSlidesFilled()) return;

    state.topic = topicInput.value.trim();
    readSlidesFromTextareas();
    state.fontSizes = Array(5).fill('medium');
    randomizeDesign();

    state.generated = true;
    renderSlides();
    previewEmpty.hidden = true;
    previewCanvas.hidden = false;
    previewToolbar.hidden = false;
    postGenerate.hidden = false;
    exportAll.hidden = false;
    renderMobileDots();
    updatePreviewScale();
  }

  function shuffleDesign() {
    if (!state.generated) return;
    randomizeDesign();
    renderSlides();
    updatePreviewScale();
  }

  function parseSlideText(text) {
    return escapeHtml(text)
      .replace(/\*([^*]+)\*/g, '<span class="emphasis">$1</span>')
      .replace(/\n/g, '<br>');
  }

  function cloneDoodle(type, variant, large) {
    const tpl = document.getElementById(`doodle-${type}`);
    if (!tpl) return null;
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.classList.add(`doodle-${type}-${variant}`);
    if (large) el.classList.add('doodle-large');
    return el;
  }

  function renderSwissBody(text, meta) {
    const words = stripMarkup(text).split(/\s+/).filter(Boolean);
    if (meta.breakType === 'rotate-word' && words.length > 1) {
      const idx = meta.breakWordIndex % words.length;
      return words.map((w, i) => {
        const parsed = parseSlideText(w);
        if (i === idx) return `<span class="swiss-break-word">${parsed}</span>`;
        return parsed;
      }).join(' ');
    }
    return parseSlideText(text);
  }

  function renderStackedChunks(text, meta) {
    const chunks = splitTextIntoChunks(text);
    const chunkMeta = meta.chunks || pickChunkMeta(chunks);
    return chunks.map((chunk, i) => {
      const m = chunkMeta[i] || chunkMeta[chunkMeta.length - 1];
      return `<div class="stack-chunk stack-chunk-${m.size} stack-align-${m.align}" style="--chunk-rotate:${m.rotate}deg" contenteditable="false">${parseSlideText(chunk)}</div>`;
    }).join('');
  }

  function renderScrapbookDisplay(text, meta) {
    const parts = meta.chunks || [text];
    const main = parts[0] || text;
    const accent = parts[1] || '';
    const mini = parts[2] || accent.split(/\s+/).slice(-2).join(' ') || '';

    return `
      <div class="scrapbook-stage" aria-hidden="true">
        <div class="paper-scrap scrap-mini" style="--scrap-rotate:${meta.miniRotate}deg">
          <span>${parseSlideText(mini)}</span>
        </div>
        <div class="paper-scrap scrap-accent" style="--scrap-rotate:${meta.accentRotate}deg">
          <span>${parseSlideText(accent)}</span>
        </div>
        <div class="paper-scrap scrap-main" style="--scrap-rotate:${meta.mainRotate}deg">
          <span>${parseSlideText(main)}</span>
        </div>
        <div class="paper-tape" style="--tape-rotate:${meta.tapeRotate}deg"></div>
      </div>
    `;
  }

  function renderSlideContent(slide, layoutId, index, meta) {
    const parsed = parseSlideText(slide.text);
    const editableAttrs = `contenteditable="true" spellcheck="true" data-index="${index}" data-layout="${layoutId}"`;

    switch (layoutId) {
      case 'poster-huge':
        return `
          <div class="layout-body layout-poster-huge bleed-${meta.bleedSide}" style="--poster-size:${meta.fontSize}px">
            <div class="poster-accent-block"></div>
            <div class="slide-content" ${editableAttrs}>${parsed}</div>
          </div>
        `;

      case 'editorial-split':
        return `
          <div class="layout-body layout-editorial-split text-${meta.textSide}" style="--split-skew:${meta.skew}deg;--split-ratio:${meta.ratio}%">
            <div class="editorial-visual-zone" data-doodle-zone="true"></div>
            <div class="editorial-text-zone">
              <div class="slide-content" ${editableAttrs}>${parsed}</div>
            </div>
          </div>
        `;

      case 'scrapbook-collage':
        return `
          <div class="layout-body layout-scrapbook-collage">
            ${renderScrapbookDisplay(slide.text, meta)}
            <div class="slide-content scrapbook-source" ${editableAttrs} tabindex="0">${parsed}</div>
          </div>
        `;

      case 'swiss-grid':
        return `
          <div class="layout-body layout-swiss-grid break-${meta.breakType}">
            <div class="swiss-grid-label">${escapeHtml(slide.role)}</div>
            <div class="swiss-grid-body">
              <div class="slide-content" ${editableAttrs}>${renderSwissBody(slide.text, meta)}</div>
            </div>
          </div>
        `;

      case 'stacked-statement':
        return `
          <div class="layout-body layout-stacked-statement">
            <div class="slide-content stacked-source" ${editableAttrs}>
              ${renderStackedChunks(slide.text, meta)}
            </div>
          </div>
        `;

      default:
        return `
          <div class="layout-body layout-default">
            <div class="slide-content-block" style="--block-rotate:${state.rotations[index]}deg">
              <div class="slide-content" ${editableAttrs}>${parsed}</div>
            </div>
          </div>
        `;
    }
  }

  function getSlideFontSize(i) {
    return state.fontSizes[i] || 'medium';
  }

  function renderSizePicker(i) {
    const current = getSlideFontSize(i);
    return `
      <div class="slide-size-picker editor-only" data-index="${i}">
        <span class="size-picker-label">Text size</span>
        <div class="size-toggle">
          ${FONT_SIZE_OPTIONS.map((size) => `
            <button type="button" class="size-btn${current === size ? ' active' : ''}" data-size="${size}" data-index="${i}" title="${size}">${size === 'small' ? 'S' : size === 'medium' ? 'M' : 'B'}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  function setSlideFontSize(index, size) {
    if (!FONT_SIZE_OPTIONS.includes(size)) return;
    state.fontSizes[index] = size;

    const slideEl = getSlideElement(index);
    if (slideEl) {
      FONT_SIZE_OPTIONS.forEach((s) => slideEl.classList.remove(`font-size-${s}`));
      slideEl.classList.add(`font-size-${size}`);
    }

    const column = slidesRow.querySelector(`.slide-column[data-index="${index}"]`);
    column?.querySelectorAll('.size-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.size === size);
    });
  }

  function getSlideClassList(i) {
    const layoutId = state.layouts[i];
    const layout = LAYOUT_TEMPLATES[layoutId];
    const classes = ['slide', `theme-${state.theme}`, `font-size-${getSlideFontSize(i)}`];
    if (layout?.allowsOverflow) classes.push('slide-allows-overflow');
    return classes.join(' ');
  }

  function renderSlides() {
    slidesRow.className = `slides-row fonts-${state.fonts}`;

    slidesRow.innerHTML = state.slides.map((slide, i) => {
      const rot = state.rotations[i] || 0;
      const layoutId = state.layouts[i];
      const meta = state.layoutMeta[i] || {};

      return `
        <div class="slide-column" data-index="${i}">
          <span class="slide-number editor-only">${i + 1}/5 · ${escapeHtml(layoutId)}</span>
          <div class="slide-scaler">
            <div class="${getSlideClassList(i)}" data-slide-index="${i}" data-layout="${layoutId}" style="--block-rotate:${rot}deg">
              <div class="slide-inner">
                ${layoutId !== 'swiss-grid' ? `<span class="role-tag">${escapeHtml(slide.role)}</span>` : ''}
                ${renderSlideContent(slide, layoutId, i, meta)}
              </div>
            </div>
          </div>
          <p class="helper-text editor-only">${escapeHtml(slide.helperText)}</p>
          ${renderSizePicker(i)}
          <button type="button" class="btn btn-sm btn-secondary editor-only download-slide-btn" data-index="${i}">Download slide</button>
        </div>
      `;
    }).join('');

    state.slides.forEach((_, i) => {
      const doodle = state.doodles[i];
      if (!doodle) return;

      const layoutId = state.layouts[i];
      let target;

      if (layoutId === 'editorial-split') {
        target = slidesRow.querySelector(`.slide-column[data-index="${i}"] .editorial-visual-zone`);
      } else if (layoutId === 'scrapbook-collage') {
        target = slidesRow.querySelector(`.slide-column[data-index="${i}"] .scrap-mini`);
      } else {
        target = slidesRow.querySelector(`.slide-column[data-index="${i}"] .layout-body`);
      }

      if (target) {
        const el = cloneDoodle(doodle.type, doodle.variant, layoutId === 'editorial-split');
        if (el) target.appendChild(el);
      }
    });

    slidesRow.querySelectorAll('.slide-content').forEach((el) => {
      el.addEventListener('input', onSlideInput);
      el.addEventListener('focus', onSlideFocus);
      el.addEventListener('blur', onSlideBlur);
    });

    slidesRow.querySelectorAll('.layout-scrapbook-collage').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('.scrapbook-source')) return;
        const editor = el.querySelector('.scrapbook-source');
        if (editor) editor.focus();
      });
    });

    slidesRow.querySelectorAll('.size-btn').forEach((btn) => {
      btn.addEventListener('click', () => setSlideFontSize(parseInt(btn.dataset.index, 10), btn.dataset.size));
    });

    slidesRow.querySelectorAll('.download-slide-btn').forEach((btn) => {
      btn.addEventListener('click', () => downloadSlide(parseInt(btn.dataset.index, 10)));
    });

    if (state.previewMode === 'mobile') {
      renderMobileDots();
      requestAnimationFrame(() => scrollToMobileSlide(state.mobileSlideIndex, false));
    }
  }

  function onSlideFocus(e) {
    const el = e.target;
    const layoutId = el.dataset.layout;
    if (layoutId === 'stacked-statement' || layoutId === 'scrapbook-collage') {
      el.dataset.wasStructured = 'true';
      el.innerHTML = parseSlideText(state.slides[parseInt(el.dataset.index, 10)].text);
      el.classList.add('editing-plain');
    }
  }

  function onSlideInput(e) {
    const idx = parseInt(e.target.dataset.index, 10);
    state.slides[idx].text = getPlainTextFromContent(e.target);
  }

  function onSlideBlur(e) {
    const idx = parseInt(e.target.dataset.index, 10);
    state.slides[idx].text = getPlainTextFromContent(e.target);

    const layoutId = state.layouts[idx];
    if (layoutId === 'stacked-statement' || layoutId === 'scrapbook-collage' || layoutId === 'swiss-grid' || layoutId === 'poster-huge') {
      state.layoutMeta[idx] = generateLayoutMeta(layoutId, state.slides[idx].text);
      const slide = state.slides[idx];
      const column = slidesRow.querySelector(`.slide-column[data-index="${idx}"]`);
      const inner = column?.querySelector('.slide-inner');
      if (inner) {
        inner.innerHTML = '';
        if (layoutId !== 'swiss-grid') {
          inner.insertAdjacentHTML('afterbegin', `<span class="role-tag">${escapeHtml(slide.role)}</span>`);
        }
        inner.insertAdjacentHTML('beforeend', renderSlideContent(slide, layoutId, idx, state.layoutMeta[idx]));
        const contentEl = inner.querySelector('.slide-content');
        if (contentEl) {
          contentEl.addEventListener('input', onSlideInput);
          contentEl.addEventListener('focus', onSlideFocus);
          contentEl.addEventListener('blur', onSlideBlur);
        }
        const scrapbook = inner.querySelector('.layout-scrapbook-collage');
        if (scrapbook) {
          scrapbook.addEventListener('click', (e) => {
            if (e.target.closest('.scrapbook-source')) return;
            inner.querySelector('.scrapbook-source')?.focus();
          });
        }
        attachDoodleForSlide(idx);
      }
    }
  }

  function attachDoodleForSlide(i) {
    const layoutId = state.layouts[i];
    const doodle = state.doodles[i];
    if (!doodle) return;

    const column = slidesRow.querySelector(`.slide-column[data-index="${i}"]`);
    column?.querySelectorAll('.doodle').forEach((d) => d.remove());

    let target;
    if (layoutId === 'editorial-split') {
      target = column.querySelector('.editorial-visual-zone');
    } else if (layoutId === 'scrapbook-collage') {
      target = column.querySelector('.scrap-mini');
    } else {
      target = column.querySelector('.layout-body');
    }

    if (target) {
      const el = cloneDoodle(doodle.type, doodle.variant, layoutId === 'editorial-split');
      if (el) target.appendChild(el);
    }
  }

  function getPlainTextFromContent(el) {
    return el.innerText.replace(/\r\n/g, '\n').trim();
  }

  function applyThemeToSlides() {
    slidesRow.querySelectorAll('.slide').forEach((slide) => {
      const idx = slide.dataset.slideIndex;
      const rot = state.rotations[idx];
      slide.className = getSlideClassList(idx);
      slide.style.setProperty('--block-rotate', `${rot}deg`);
    });
  }

  function updatePreviewScale() {
    let scale;

    if (state.previewMode === 'mobile') {
      scale = MOBILE_SCREEN_W / SLIDE_W;
    } else {
      const available = window.innerWidth - 360;
      scale = Math.min(0.35, Math.max(0.18, (available - 80) / SLIDE_W));
    }

    document.documentElement.style.setProperty('--preview-scale', scale);
    $$('.slide-scaler').forEach((el) => {
      el.style.setProperty('--preview-scale', scale);
    });
    $$('.helper-text').forEach((el) => {
      el.style.setProperty('--preview-scale', scale);
    });
  }

  function getSlideElement(index) {
    return slidesRow.querySelector(`.slide[data-slide-index="${index}"]`);
  }

  async function captureSlide(slideEl) {
    document.body.classList.add('exporting');

    // Brief pause so browser applies export styles
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const canvas = await html2canvas(slideEl, {
      width: SLIDE_W,
      height: SLIDE_H,
      scale: 1,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      onclone: (doc) => {
        const cloned = doc.querySelector(`[data-slide-index="${slideEl.dataset.slideIndex}"]`);
        if (cloned) {
          cloned.style.transform = 'none';
          const block = cloned.querySelector('.slide-content-block');
          if (block) {
            block.style.transform = `rotate(${slideEl.style.getPropertyValue('--block-rotate') || '0deg'})`;
          }
          cloned.querySelectorAll('.editor-only').forEach((el) => el.remove());
          cloned.querySelectorAll('.scrapbook-source.editing-plain, .scrapbook-source').forEach((el) => {
            if (el.closest('.layout-scrapbook-collage')) el.style.display = 'none';
          });
          cloned.querySelectorAll('.stacked-source.editing-plain').forEach((el) => {
            el.classList.remove('editing-plain');
          });
          if (cloned.classList.contains('slide-allows-overflow')) {
            cloned.style.overflow = 'visible';
          }
        }
      }
    });

    document.body.classList.remove('exporting');
    updatePreviewScale();
    return canvas;
  }

  function canvasToBlob(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function slugify(text) {
    return (text || 'carousel')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'carousel';
  }

  async function downloadSlide(index) {
    const slideEl = getSlideElement(index);
    if (!slideEl) return;

    downloadZipBtn.disabled = true;
    const btns = slidesRow.querySelectorAll('.download-slide-btn');
    btns.forEach((b) => (b.disabled = true));

    try {
      const canvas = await captureSlide(slideEl);
      const blob = await canvasToBlob(canvas);

      if (canvas.width !== SLIDE_W || canvas.height !== SLIDE_H) {
        console.warn(`Export dimensions: ${canvas.width}×${canvas.height} (expected ${SLIDE_W}×${SLIDE_H})`);
      }

      const prefix = slugify(state.topic);
      downloadBlob(blob, `${prefix}-slide-${index + 1}.png`);
    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed — check console for details.');
    } finally {
      downloadZipBtn.disabled = false;
      btns.forEach((b) => (b.disabled = false));
    }
  }

  async function downloadAllAsZip() {
    if (!state.generated || state.slides.length === 0) return;

    downloadZipBtn.disabled = true;
    downloadZipBtn.textContent = 'Rendering…';
    const btns = slidesRow.querySelectorAll('.download-slide-btn');
    btns.forEach((b) => (b.disabled = true));

    try {
      const zip = new JSZip();
      const prefix = slugify(state.topic);

      for (let i = 0; i < state.slides.length; i++) {
        const slideEl = getSlideElement(i);
        if (!slideEl) continue;
        const canvas = await captureSlide(slideEl);
        const blob = await canvasToBlob(canvas);
        zip.file(`${prefix}-slide-${i + 1}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadBlob(zipBlob, `${prefix}-carousel.zip`);
    } catch (err) {
      console.error('ZIP export failed:', err);
      alert('ZIP export failed — check console for details.');
    } finally {
      downloadZipBtn.disabled = false;
      downloadZipBtn.textContent = 'Download all as ZIP';
      btns.forEach((b) => (b.disabled = false));
    }
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  init();
})();
