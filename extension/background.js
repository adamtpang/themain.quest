// The lifeleft glance, always on: the badge on the pinned icon shows the
// years of the game remaining, no click needed. Refreshed daily by an alarm.
const BIRTH = Date.UTC(2002, 6, 31); // 2002-07-31
const LIFE_YEARS = 75;

function paintBadge() {
  const death = Date.UTC(2002 + LIFE_YEARS, 6, 31);
  const yearsLeft = Math.max(0, (death - Date.now()) / (365.25 * 86400000));
  chrome.action.setBadgeBackgroundColor({ color: "#241b40" });
  if (chrome.action.setBadgeTextColor) {
    chrome.action.setBadgeTextColor({ color: "#ffcf4a" });
  }
  chrome.action.setBadgeText({ text: yearsLeft.toFixed(1) });
}

chrome.runtime.onInstalled.addListener(() => {
  paintBadge();
  chrome.alarms.create("lifeleft-tick", { periodInMinutes: 1440 });
});
chrome.runtime.onStartup.addListener(paintBadge);
chrome.alarms.onAlarm.addListener((a) => {
  if (a.name === "lifeleft-tick") paintBadge();
});
paintBadge();
