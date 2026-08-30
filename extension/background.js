// Digital Multiplex — 4DX Extension Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "stream-in-4dx",
        title: "⚡ Stream Current Video in 4DX Digital Multiplex",
        contexts: ["page", "video", "link"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "stream-in-4dx") {
        const targetUrl = info.srcUrl || info.linkUrl || info.pageUrl || (tab && tab.url);
        const title = (tab && tab.title) || "Streaming Video";
        const destination = `https://alokinfo30.github.io/Digital-Multiplex/?movie=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(title)}&autoplay=1&profile=turbo`;
        chrome.tabs.create({ url: destination });
    }
});
