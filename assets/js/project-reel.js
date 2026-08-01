(function () {
  function setupReel(reel) {
    var track = reel.querySelector('.project-reel-track');
    var cards = Array.prototype.slice.call(reel.querySelectorAll('[data-reel-card]:not([data-reel-clone])'));
    var firstClone = reel.querySelector('[data-reel-clone]');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var speed = 12;
    var running = !reduceMotion.matches;
    var visible = !('IntersectionObserver' in window);
    var resumeTimer;
    var lastTime;
    var autoPosition = 0;
    var animationFrame;

    if (!track || !cards.length) return;

    function loopWidth() {
      return firstClone ? firstClone.offsetLeft - cards[0].offsetLeft : 0;
    }

    function normalizePosition() {
      var width = loopWidth();
      if (width && autoPosition >= width) {
        autoPosition -= width;
        track.scrollLeft = autoPosition;
      }
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

    track.addEventListener('pointerenter', pause);
    track.addEventListener('pointerleave', resume);
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

    startAnimation();
  }

  document.querySelectorAll('[data-project-reel]').forEach(setupReel);
}());
