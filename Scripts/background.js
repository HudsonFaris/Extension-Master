chrome.cookies.onChanged.addListener((changeInfo) => {
  const { cookie, cause, removed } = changeInfo;
  if (removed) return;

  chrome.storage.local.get({ stats: {} }, (data) => {
    const stats = data.stats;
    stats[cookie.domain] = {
      count: (stats[cookie.domain]?.count || 0) + 1,
      lastValue: cookie.value,
      lastCause: cause
    };
    chrome.storage.local.set({ stats });
  });
});

async function updateCookieCount(domain) {
  const data = await chrome.storage.local.get(["stats"]);
  const stats = data.stats || {};
  stats[domain] = (stats[domain] || 0) + 1;
  await chrome.storage.local.set({ stats });
}