(() => {
 'use strict';
 const $ = (selector) => document.querySelector(selector);
 const motion = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
 const dialog = $('#account-dialog');
 let accountOpener;
 document.querySelectorAll('[data-account]').forEach(button => button.addEventListener('click', () => {
   accountOpener = button;
   dialog.showModal();
   dialog.querySelector('[autofocus]').focus();
 }));
 document.querySelectorAll('[data-close-account]').forEach(button => button.addEventListener('click', () => dialog.close()));
 dialog.addEventListener('close', () => accountOpener?.focus());
 dialog.addEventListener('keydown', event => {
   if (event.key !== 'Tab') return;
   const controls = [...dialog.querySelectorAll('button')];
   const first = controls[0], last = controls.at(-1);
   if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
   else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
 });
 dialog.addEventListener('click', event => {
   const box = dialog.getBoundingClientRect();
   if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
 });
 const menuButton = $('.menu-toggle'), nav = $('#main-nav');
 function closeMenu() {
   nav.classList.remove('nav-open');
   menuButton.setAttribute('aria-expanded', 'false');
   menuButton.setAttribute('aria-label', 'Open navigation');
 }
 menuButton.addEventListener('click', () => {
   const open = !nav.classList.contains('nav-open');
   nav.classList.toggle('nav-open', open);
   menuButton.setAttribute('aria-expanded', String(open));
   menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
 });
 nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
 document.addEventListener('keydown', event => {
   if (event.key === 'Escape' && !dialog.open && nav.classList.contains('nav-open')) {closeMenu(); menuButton.focus();}
 });
 document.addEventListener('click', event => {if (!event.target.closest('.site-header, #account-dialog')) closeMenu();});
 const journey = __JOURNEY__;
 document.querySelectorAll('[data-journey]').forEach(button => button.addEventListener('click', () => {
   const i = Number(button.dataset.journey), [title, sub, copy, example] = journey[i];
   document.querySelectorAll('[data-journey]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
   $('#journey-kicker').textContent = `0${i + 1} / ${title.toUpperCase()}`;
   $('#journey-title').textContent = sub;
   $('#journey-copy').textContent = copy;
   $('#journey-example').textContent = example;
 }));
 const form = $('#demo-form'), feedback = $('#demo-feedback');
 if (form) {
   const answers = {
     accept: ['LOOK A LITTLE CLOSER', 'Clear writing can still miss an important detail.', 'The summary includes the date, time, location, and laptop request. But it leaves out the 20-place limit and the 12 November registration deadline. A visitor could miss their chance to attend.'],
     evidence: ['YOU FOLLOWED THE EVIDENCE', 'Yes — those conditions change what someone needs to do.', 'The original note limits places to 20 and asks people to register by 12 November. Neither detail appears in the summary. Checking the source helped you spot a meaningful gap.'],
     style: ['STYLE IS ONLY ONE PART', 'A warmer tone would not fill the information gap.', 'Making the summary more exciting could help its tone, but the deadline and the 20-place limit would still be missing. First check the important facts and conditions; then improve the writing.'],
   };
   form.addEventListener('submit', event => {
     event.preventDefault();
     const chosen = new FormData(form).get('check');
     if (!answers[chosen]) return;
     const [kicker, title, copy] = answers[chosen];
     $('#feedback-kicker').textContent = kicker;
     $('#feedback-title').textContent = title;
     $('#feedback-copy').textContent = copy;
     feedback.hidden = false;
     feedback.focus({preventScroll: true});
     feedback.scrollIntoView({behavior: motion(), block: 'center'});
   });
   form.addEventListener('change', () => {feedback.hidden = true;});
   $('#demo-reset').addEventListener('click', () => {
     form.reset(); feedback.hidden = true;
     form.querySelector('input').focus({preventScroll: true});
     form.scrollIntoView({behavior: motion(), block: 'center'});
   });
 }
 const search = $('#curriculum-search');
 if (search) {
   const isReview = search.dataset.searchKind === 'review';
   const searchBase = search.dataset.searchBase || '/learn';
   const idleStatus = isReview ? '8 modules · choose a lesson to review' : '8 modules · choose a place to begin';
   const modulesGrid = $('#curriculum-modules'), results = $('#search-results'), status = $('#search-status'), clear = $('#clear-search');
   let modules = null;
   // Only editorial curriculum data is loaded. Search terms never leave the browser.
   const load = fetch('/assets/curriculum.json').then(response => {if (!response.ok) throw new Error('Curriculum unavailable'); return response.json();}).then(data => {modules = data; render();}).catch(() => {
     search.disabled = true;
     clear.hidden = true;
     modulesGrid.hidden = false;
     results.hidden = true;
     status.textContent = 'Search could not load. You can still explore every module below.';
   });
   function element(tag, cls, text) {const el = document.createElement(tag); el.className = cls; if (text) el.textContent = text; return el;}
   function render() {
     const query = search.value.trim().toLowerCase();
     clear.hidden = !search.value;
     if (!query) {modulesGrid.hidden = false; results.hidden = true; results.replaceChildren(); status.textContent = idleStatus; return;}
     if (!modules) {status.textContent = 'Loading the curriculum…'; return;}
     const tokens = query.split(/\s+/);
     results.replaceChildren();
     let count = 0;
     modules.forEach(m => {
       const found = m.sections.flatMap(s => s.lessons.filter(l => {
         const text = `${m.id} ${m.title} ${m.focus} ${s.title} ${l.id} ${l.title} ${l.objective}`.toLowerCase();
         return tokens.every(token => text.includes(token));
       }).map(l => ({s,l})));
       if (!found.length) return;
       const group = element('section','search-group');
       group.append(element('h3','',`${m.id} · ${m.title}`));
       found.forEach(({s,l}) => {
         const link = element('a','search-result');
         link.href = `${searchBase}/${l.id.toLowerCase().replace('-','/')}/`;
         link.append(element('span','search-group-label',`${l.id} · ${s.title} · ${isReview ? (l.reviewStatus === 'published' ? 'Quick Review · Available' : 'Quick Review · Coming soon') : l.status === 'published' ? 'Available' : 'Coming soon'}`),element('h4','',l.title),element('p','',l.objective));
         group.append(link); count++;
       });
       results.append(group);
     });
     modulesGrid.hidden = true; results.hidden = false;
     status.textContent = `${count} ${isReview ? 'lesson review' : 'lesson'}${count === 1 ? '' : 's'} found for “${search.value.trim()}”`;
     if (!count) {
       const empty = element('div','search-empty');
       empty.append(element('h3','','No matching lessons yet.'),element('p','','Try a topic like “context”, “privacy”, or “API”, or use a lesson ID such as M03-L10.'));
       const reset = element('button','button secondary','Show all modules'); reset.type = 'button'; reset.addEventListener('click', resetSearch); empty.append(reset); results.append(empty);
     }
   }
   function resetSearch(){search.value = ''; render(); search.focus();}
   search.addEventListener('input', render);
   clear.addEventListener('click', resetSearch);
   search.addEventListener('keydown', event => {if (event.key === 'Escape') resetSearch();});
 }
})();


