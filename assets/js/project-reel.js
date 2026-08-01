(function () {
  function setupReel(reel) {
    var track = reel.querySelector('.project-reel-track');
    var cards = Array.prototype.slice.call(reel.querySelectorAll('[data-reel-card]:not([data-reel-clone])'));
    var firstClone = reel.querySelector('[data-reel-clone]');
    var previous = reel.querySelector('[data-reel-previous]');
    var next = reel.querySelector('[data-reel-next]');
    var counters = reel.querySelectorAll('.project-reel-count');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var speed = 12;
    var running = !reduceMotion.matches;
    var visible = !('IntersectionObserver' in window);
    var resumeTimer;
    var lastTime;
    var autoPosition = 0;
    var animationFrame;
    var frame;

    if (!track || !cards.length) return;

    function loopWidth() {
      return firstClone ? firstClone.offsetLeft - cards[0].offsetLeft : 0;
    }

    function normalizedLeft() {
      var width = loopWidth();
      return width ? track.scrollLeft % width : track.scrollLeft;
    }

    function normalizePosition() {
      var width = loopWidth();
      if (width && autoPosition >= width) {
        autoPosition -= width;
        track.scrollLeft = autoPosition;
      }
    }

    function activeIndex() {
      var left = normalizedLeft();
      var firstOffset = cards[0].offsetLeft;
      var nearest = 0;
      var distance = Infinity;

      cards.forEach(function (card, index) {
        var current = Math.abs((card.offsetLeft - firstOffset) - left);
        if (current < distance) {
          distance = current;
          nearest = index;
        }
      });

      return nearest;
    }

    function update() {
      var index = activeIndex();
      var label = String(index + 1).padStart(2, '0') + ' / ' + String(cards.length).padStart(2, '0');

      counters.forEach(function (counter) { counter.textContent = label; });
      frame = null;
    }

    function show(delta) {
      var cardWidth = cards[0].getBoundingClientRect().width;
      var styles = window.getComputedStyle(track);
      var gap = parseFloat(styles.columnGap || styles.gap) || 0;

      pauseFor(3000);
      track.scrollBy({
        left: delta * (cardWidth + gap),
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    }

    function pause() {
      running = false;
      autoPosition = track.scrollLeft;
      window.clearTimeout(resumeTimer);
      stopAnimation();
    }

    function resume() {
      window.clearTimeout(resumeTimer);
      if (!reduceMotion.matches) running = true;
      autoPosition = track.scrollLeft;
      lastTime = null;
      startAnimation();
    }

    function pauseFor(delay) {
      pause();
      resumeTimer = window.setTimeout(resume, delay);
    }

    function animate(time) {
      if (!running || !visible || document.hidden) {
        animationFrame = null;
        return;
      }

      if (lastTime !== null) {
        autoPosition += speed * Math.min(time - lastTime, 50) / 1000;
        track.scrollLeft = autoPosition;
        normalizePosition();
      }
      lastTime = time;
      animationFrame = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
      if (!animationFrame && running && visible && !document.hidden) {
        lastTime = null;
        animationFrame = window.requestAnimationFrame(animate);
      }
    }

    function stopAnimation() {
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = null;
      lastTime = null;
    }

    if (previous) previous.addEventListener('click', function () { show(-1); });
    if (next) next.addEventListener('click', function () { show(1); });
    track.addEventListener('pointerdown', pause);
    track.addEventListener('pointerup', function () { pauseFor(2000); });
    track.addEventListener('pointercancel', function () { pauseFor(2000); });
    track.addEventListener('wheel', function () { pauseFor(2000); }, { passive: true });
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!track.contains(document.activeElement)) resume();
      }, 0);
    });
    track.addEventListener('scroll', function () {
      if (!running) autoPosition = track.scrollLeft;
      if (!frame) frame = window.requestAnimationFrame(update);
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        if (visible) startAnimation();
        else stopAnimation();
      }).observe(reel);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopAnimation();
      else startAnimation();
    });

    if (typeof reduceMotion.addEventListener === 'function') {
      reduceMotion.addEventListener('change', function (event) {
        running = !event.matches;
        if (running) startAnimation();
        else stopAnimation();
      });
    }

    update();
    startAnimation();
  }

  document.querySelectorAll('[data-project-reel]').forEach(setupReel);
}());
