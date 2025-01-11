chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.storage.local.set(DEFAULT_ENGINES);
  }
});

const DEFAULT_ENGINES: Setting = {
  currentSearchGroupId: 0,
  searchEngines: [
    {
      id: 0,
      title: "Google",
      url: "https://www.google.com/search?q=%s",
    },
    {
      id: 1,
      title: "DuckDuckGo",
      url: "https://duckduckgo.com/?q=%s",
    },
    {
      id: 3,
      title: "DAM Karaoke song search",
      url: "https://www.clubdam.com/karaokesearch/?keyword=%s&type=keyword",
    },
    {
      id: 4,
      title: "JOYSOUND Karaoke song search",
      url: "https://www.joysound.com/web/search/cross?match=1&keyword=%s",
    },
    {
      id: 5,
      title: "Oxford English Dictionary",
      url: "https://dictionary.cambridge.org/dictionary/english/%s",
    },
    {
      id: 6,
      title: "Collins English Dictionary",
      url: "https://www.collinsdictionary.com/dictionary/english/%s",
    },
    {
      id: 7,
      title: "Thesaurus.com",
      url: "https://www.thesaurus.com/browse/%s",
    },
    {
      id: 8,
      title: "Merriam Webster",
      url: "https://www.merriam-webster.com/thesaurus/%s",
    },
    {
      id: 9,
      title: "Amazon",
      url: "https://www.amazon.co.jp/s?k=%s",
    },
    {
      id: 10,
      title: "ebay",
      url: "https://www.ebay.com/sch/i.html?_nkw=%s",
    },
    {
      id: 11,
      title: "Aliexpress",
      url: "https://ja.aliexpress.com/w/wholesale-%s.html",
    },
  ],
  searchGroups: [
    {
      id: 0,
      title: "Google & DuckDuckGo",
      engineIds: [0, 1],
    },
    {
      id: 2,
      title: "Karaoke search",
      engineIds: [3, 4],
    },
    {
      id: 3,
      title: "Dictionary",
      engineIds: [5, 6],
    },
    {
      id: 4,
      title: "Thesaurus",
      engineIds: [7, 8],
    },
    {
      id: 5,
      title: "e-commerce",
      engineIds: [9, 10, 11],
    },
  ],
};
