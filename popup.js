async function displayStats() {
  const { stats } = await chrome.storage.local.get("stats");
  const list = document.getElementById("cookie-list");
  
  if (!stats) {
    list.innerHTML = "<li>No cookies tracked yet.</li>";
    return;
  }

  list.innerHTML = Object.entries(stats)
    .map(([domain, count]) => `<li><b>${domain}</b>: ${count} cookies</li>`)
    .join("");
}

displayStats();