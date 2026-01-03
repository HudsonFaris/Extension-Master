async function displayStats() {
  const result = await chrome.storage.local.get("stats");
  const stats = result.stats;
  
  const list = document.getElementById("cookie-list");

  if (!stats || Object.keys(stats).length === 0) {
    list.innerHTML = "<li>No cookies tracked yet.</li>";
    return;
  }

  try {
    list.innerHTML = Object.entries(stats)
      .map(([domain, data]) => {
        const count = data.count || 0;
        const val = data.lastValue ? data.lastValue.substring(0, 15) : 'N/A';
        const cause = data.lastCause || 'Unknown';

        return `
          <li>
            <b>${domain}</b>: ${count} hits <br>
            <small>Value: ${val}...</small><br>
            <small>Cause: ${cause}</small>
          </li>`;
      })
      .join("");
  } catch (err) {
    console.error("Rendering error:", err);
    list.innerHTML = "<li>Error displaying data. Please reset storage.</li>";
  }
}


displayStats();