/* =====================================================
   BIM³ Blog — Funcionalidades premium
   ===================================================== */

(() => {
  // -------- 1. Reading progress bar (só em páginas de post) --------
  const postBody = document.querySelector('.post-body');
  if (postBody) {
    const bar = document.createElement('div');
    bar.id = 'reading-progress';
    document.body.appendChild(bar);

    let ticking = false;
    const update = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
      bar.style.width = `${Math.min(progress, 100)}%`;
      ticking = false;
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });

    update();
  }

  // -------- 2. Animação de contagem dos números (.stat-value) --------
  const animateCounter = (el, duration = 1800) => {
    const original = el.textContent.trim();
    // Pega o primeiro grupo numérico (com vírgula/ponto)
    const match = original.match(/([\d.,]+)/);
    if (!match) return;

    const numStr = match[1];
    // Converte para número (padrão BR: 1.353,5 → 1353.5)
    const target = parseFloat(numStr.replace(/\./g, '').replace(',', '.'));
    if (isNaN(target)) return;

    const decimals = numStr.includes(',') ? numStr.split(',')[1].length : 0;
    const useThousandSep = numStr.split(',')[0].includes('.') || target >= 1000;

    const format = (n) => {
      if (decimals > 0) return n.toFixed(decimals).replace('.', ',');
      if (useThousandSep) return Math.round(n).toLocaleString('pt-BR');
      return Math.round(n).toString();
    };

    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = target * eased;
      el.textContent = original.replace(numStr, format(current));
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        // Garante texto final exato
        el.textContent = original;
      }
    };
    requestAnimationFrame(tick);
  };

  const stats = document.querySelectorAll('.stat-value');
  if (stats.length > 0 && 'IntersectionObserver' in window) {
    const counterObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.animated) {
          entry.target.dataset.animated = '1';
          animateCounter(entry.target);
        }
      });
    }, { threshold: 0.4 });
    stats.forEach(el => counterObs.observe(el));
  }

  // -------- 3. Scroll reveals (fade-in stagger) --------
  const revealSelectors = [
    '.featured-post',
    '.posts-grid > *',
    '.related-grid > *',
    '.author-box',
  ];

  const revealEls = revealSelectors.flatMap(sel =>
    Array.from(document.querySelectorAll(sel))
  );

  // Aplica classes e delays escalonados (4 colunas = ciclo de 4 delays)
  revealEls.forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', `${(i % 4) * 0.08}s`);
  });

  if (revealEls.length > 0 && 'IntersectionObserver' in window) {
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(el => revealObs.observe(el));
  }
})();
