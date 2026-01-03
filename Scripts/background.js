
chrome.cookies.onChanged.addListener((changeInfo) => {
  const { removed, cookie, cause } = changeInfo;

  if (!removed) {
    console.log(`New Cookie Detected!
    Name: ${cookie.name}
    Domain: ${cookie.domain}
    Value: ${cookie.value}
    Reason: ${cause}`);
    updateCookieCount(cookie.domain);
  }
});

async function updateCookieCount(domain) {
  const data = await chrome.storage.local.get(["stats"]);
  const stats = data.stats || {};
  stats[domain] = (stats[domain] || 0) + 1;
  await chrome.storage.local.set({ stats });
}