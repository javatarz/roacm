function evaluateUpcomingTalks() {
  const todayStr = new Date().toISOString().slice(0, 10);
  document.querySelectorAll('[data-talk-date]').forEach(function (card) {
    const ribbon = card.querySelector('.upcoming-ribbon');
    if (!ribbon) {
      return;
    }
    ribbon.hidden = card.dataset.talkDate < todayStr;
  });
}

evaluateUpcomingTalks();

if (typeof window !== 'undefined') {
  window.__evaluateUpcomingTalks = evaluateUpcomingTalks;
}
