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


async function getAuthToken() { //auth token
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(token);
      }
    });
  });
}

//api in .env


async function fetchEmails() { //uses fetch api for token
  const token = await getAuthToken();
  const response = await fetch(
    'https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5', //5 to reduce wait time for now (need messages as bearer token compared to cookie for security reasons)
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const data = await response.json();

  const prioritizedEmails = [];

  for (let msg of data.messages) {
    const detailReq = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}`, //message_id having formatting problems, will fix later. 
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const detail = await detailReq.json();
    
    const score = calculateScore(detail.snippet);
    prioritizedEmails.push({
      subject: detail.payload.headers.find(h => h.name === 'Subject').value,
      snippet: detail.snippet,
      priority: score > 5 ? 'High' : 'Normal' //based on previous 5 score
    });
  }
  
  chrome.storage.local.set({ emails: prioritizedEmails });
}

//filler for now basically
function calculateScore(text) {
  let score = 0;
  if (text.includes("urgent")) score += 5;
  if (text.includes("meeting")) score += 2;
  return score;
}