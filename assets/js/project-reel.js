(function () {
  function setupReel(reel) {
    var track = reel.querySelector('.project-reel-track');
    var cards = Array.prototype.slice.call(reel.querySelectorAll('[data-reel-card]'));
    var previous = reel.querySelector('[data-reel-previous]');
    var next = reel.querySelector('[data-reel-next]');
    var counters = reel.querySelectorAll('.project-reel-count');
    var frame;

    if (!track || !cards.length) return;

    function activeIndex() {
      var left = track.scrollLeft;
      var nearest = 0;
      var distance = Infinity;

      cards.forEach(function (card, index) {
        var current = Math.abs(card.offsetLeft - left);
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
      if (previous) previous.disabled = index === 0;
      if (next) next.disabled = index === cards.length - 1;
      frame = null;
    }

    function show(delta) {
      var index = Math.max(0, Math.min(cards.length - 1, activeIndex() + delta));
      cards[index].scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }

    if (previous) previous.addEventListener('click', function () { show(-1); });
    if (next) next.addEventListener('click', function () { show(1); });
    track.addEventListener('scroll', function () {
      if (!frame) frame = window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  document.querySelectorAll('[data-project-reel]').forEach(setupReel);
}());
