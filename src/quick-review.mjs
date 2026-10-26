import {publishedReview} from './review-system/render.mjs';
import { icon } from './icons.mjs';
import { esc, breadcrumbs, lessonPath } from './templates.mjs';

export const reviewModulePath = m => `/quick-review/${m.id.toLowerCase()}/`;
export const reviewLessonPath = l => `/quick-review/${l.id.toLowerCase().replace('-', '/')}/`;

function reviewCard(m) {
  return `<a class="module-card review-card" href="${reviewModulePath(m)}">
    <div class="module-card-top"><span class="icon-tile">${icon('message')}</span><span class="module-index">${esc(m.id)} / 08</span></div>
    <span class="review-kind">Quick Review</span><h3>${esc(m.title)}</h3><p>${esc(m.focus)}</p>
    <div class="module-card-bottom"><span>${m.sections.flatMap(s=>s.lessons).filter(l=>l.reviewStatus==='published').length?`${m.sections.flatMap(s=>s.lessons).filter(l=>l.reviewStatus==='published').length} available / 12 reviews`:'12 lesson reviews · Coming soon'}</span>${icon('arrow')}</div>
  </a>`;
}

export function reviewDirectory(modules) {
  const available=modules.flatMap(m=>m.sections.flatMap(s=>s.lessons)).filter(l=>l.reviewStatus==='published').length;
  return `<section class="page-intro container">
    ${breadcrumbs([['Quick Review']])}<span class="eyebrow">QUICK REVIEW · YOUR LESSON COMPANION</span>
    <h1>Lesson Questions &amp; Answers</h1>
    <p class="intro-lead">Refresh your understanding with short, practical questions and clear answers.</p>
    <div class="curriculum-stats"><span><strong>8</strong> modules</span><span><strong>24</strong> sections</span><span><strong>96</strong> lesson reviews planned</span></div>
    <div class="notice">${icon('clock')}<p><strong>${available} Quick Review${available===1?' is':'s are'} ready.</strong> Open available reviews for short Q&amp;As and optional listening practice. More lesson reviews are being prepared.</p></div>
  </section>
  <section class="container curriculum-content">
    <div class="curriculum-toolbar"><h2>Choose a module to review</h2><div class="search-field">${icon('search')}
      <label class="sr-only" for="curriculum-search">Search Quick Review modules, sections, lessons, or objectives</label>
      <input id="curriculum-search" type="search" data-search-base="/quick-review" data-search-kind="review" placeholder="Search review topics or lesson IDs…" autocomplete="off">
      <button id="clear-search" type="button" hidden aria-label="Clear search">${icon('close')}</button>
    </div></div>
    <p id="search-status" class="search-status" role="status" aria-live="polite">8 modules · choose a lesson to review</p>
    <div class="module-grid" id="curriculum-modules">${modules.map(reviewCard).join('')}</div><div id="search-results" hidden></div>
    <noscript><p class="notice">Search needs JavaScript. You can still open every module and lesson review below.</p></noscript>
    <div class="curriculum-guide"><div><span class="eyebrow">SHORT QUESTIONS. CLEAR ANSWERS.</span><h3>A lighter way to revisit a lesson.</h3><p>Quick Review will focus on the main ideas, common misunderstandings, and practical situations. Answers will use simple English and short explanations.</p></div>
      <div><span class="eyebrow">EXPLORE THE FULL LEARNING PATH</span><h3>Looking for detailed lessons?</h3><p>The curriculum is the home for the planned theory, interactive demos, flashcards, and quizzes.</p><a class="inline-link" href="/learn/">Explore the curriculum ${icon('arrow')}</a></div></div>
  </section>`;
}

export function reviewModule(m, modules) {
  const i = modules.indexOf(m);
  return `<section class="page-intro container">
    ${breadcrumbs([['Quick Review', '/quick-review/'], [m.title]])}
    <span class="eyebrow">QUICK REVIEW · MODULE ${m.id.slice(1)} / 08 <span class="tag">${m.sections.some(s=>s.lessons.some(l=>l.reviewStatus==='published'))?'Q&amp;A AVAILABLE':'Q&amp;A COMING SOON'}</span></span>
    <h1>${esc(m.title)}</h1><p class="intro-lead">${esc(m.focus)}</p>
    <div class="module-meta"><span>3 sections</span><span>12 lesson reviews planned</span><span>Start anywhere</span></div>
    <p class="module-help">Open available Quick Reviews to read and practise. Other lesson Q&amp;As are being prepared.</p>
    <nav class="section-jumps" aria-label="Quick Review sections">${m.sections.map(s => `<a href="#section-${s.id.toLowerCase()}">${s.id} · ${esc(s.title)} <span aria-hidden="true">↓</span></a>`).join('')}</nav>
  </section><div class="container module-content">
    ${m.sections.map(s => `<section class="lesson-section" id="section-${s.id.toLowerCase()}">
      <div class="lesson-section-heading"><span class="section-letter">${s.id}</span><div><span class="eyebrow">SECTION ${s.id}</span><h2>${esc(s.title)}</h2></div><span>4 lesson reviews planned</span></div>
      <div class="lesson-list">${s.lessons.map(l => `<a class="lesson-row review-lesson" href="${reviewLessonPath(l)}">
        <span class="lesson-number">${l.id.slice(-2)}</span><div><span class="review-kind">Quick Review</span><span class="lesson-id">${esc(l.id)}</span><h3>${esc(l.title)}</h3><p>${esc(l.objective)}</p></div>
        <span class="lesson-status">${l.reviewStatus==='published'?'Open Quick Review':'Coming soon'} ${icon('arrow')}</span>
      </a>`).join('')}</div>
    </section>`).join('')}
    <nav class="page-pagination" aria-label="Quick Review module navigation">
      ${i > 0 ? `<a href="${reviewModulePath(modules[i - 1])}"><small>← PREVIOUS REVIEW MODULE</small>${esc(modules[i - 1].title)}</a>` : '<span></span>'}
      <a href="/quick-review/" class="pagination-center">All review modules</a>
      ${i < modules.length - 1 ? `<a href="${reviewModulePath(modules[i + 1])}"><small>NEXT REVIEW MODULE →</small>${esc(modules[i + 1].title)}</a>` : '<span></span>'}
    </nav>
  </div>`;
}

export function reviewLesson(m, s, l, bank) {
  if(bank)return publishedReview(m,s,l,bank);
  const lessons = m.sections.flatMap(section => section.lessons), i = lessons.indexOf(l);
  return `<div class="container lesson-page">
    ${breadcrumbs([['Quick Review', '/quick-review/'], [m.title, reviewModulePath(m)], [s.title, reviewModulePath(m) + '#section-' + s.id.toLowerCase()], [l.title]])}
    <div class="coming-soon review-coming-soon">
      <div class="coming-soon-art" aria-hidden="true"><span class="icon-tile">${icon('message')}</span><span class="art-mini-spark">✳</span></div>
      <span class="eyebrow">${esc(l.id)} · ${esc(m.title)}</span><span class="badge">QUICK REVIEW IN PREPARATION</span>
      <h1>Quick Review<br><em>Coming Soon</em></h1><h2>${esc(l.title)}</h2>
      <p>We're preparing short questions and clear answers for this lesson. This Quick Review will help you revisit the main ideas, common misunderstandings, and practical situations.</p>
      <div class="objective-box"><span class="eyebrow">YOUR LEARNING OBJECTIVE</span><p>${esc(l.objective)}</p></div>
      <div class="button-row"><a class="button primary" href="/quick-review/">Back to Quick Review ${icon('arrow')}</a><a class="button secondary" href="${reviewModulePath(m)}">Back to Review Module</a></div>
      <a class="inline-link" href="${lessonPath(l)}">View this lesson in Curriculum ${icon('arrow')}</a>
    </div>
    <nav class="page-pagination" aria-label="Quick Review lesson navigation">
      ${i > 0 ? `<a href="${reviewLessonPath(lessons[i - 1])}"><small>← PREVIOUS REVIEW</small>${esc(lessons[i - 1].title)}</a>` : '<span></span>'}
      <span class="pagination-center">${i + 1} of 12 · ${esc(m.id)}</span>
      ${i < lessons.length - 1 ? `<a href="${reviewLessonPath(lessons[i + 1])}"><small>NEXT REVIEW →</small>${esc(lessons[i + 1].title)}</a>` : '<span></span>'}
    </nav>
  </div>`;
}
