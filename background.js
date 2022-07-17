const DB_VERSION = 1;
const DB_NAME = "WT_EXT_DB";

const updateDB = (store, data) => {
  const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

  dbRequest.onerror = () => {
    console.error(dbRequest.error);
  };
  dbRequest.onsuccess = () => {
    const db = dbRequest.result;
    const store = db.transaction(store, "readwrite").objectStore(store);
    const request = store.get(data);

    request.onsuccess = () => console.log(request.result);
    request.onerror = () => console.error(request.error);
  };
};

const setupDB = () => {
  const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

  dbRequest.onupgradeneeded = () => {
    const db = dbRequest.result;
    console.log(db.objectStoreNames);
    if (!db.objectStoreNames.contains("url")) {
      db.createObjectStore("url", { keyPath: "_id", autoIncrement: true });
    }
  };
};

const logURL = () => {};

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("setup DB");
    setupDB();
  } else if (details.reason === "update") {
  }
});

chrome.runtime.onMessage.addListener((req, sender, res) => {
  switch (req.key) {
    case "getURL":
      fetch("http://waktoon.site/api/url")
        .then((result) => {
          result.json().then((data) => {
            res(data);
          });
        })
        .catch((err) => {
          res(err);
        });
      return true;
    case "updateURL":
      fetch("http://waktoon.site/api/url")
        .then((result) => {
          result.json().then((data) => {
            updateDB("url", data);
          });
        })
        .catch((err) => {
          res(err);
        });
      break;
    case "getToon":
      fetch("http://waktoon.site/api/toon")
        .then((result) => {
          result.json().then((data) => {
            res(data);
          });
        })
        .catch((err) => {
          res(err);
        });
      return true;
    case "getDetails":
      fetch(`http://waktoon.site/api/details?title=${req.title}`)
        .then((result) => {
          result.json().then((data) => {
            res(data);
          });
        })
        .catch((err) => {
          res(err);
        });
      return true;
    case "getToonByUrl":
      fetch(`http://waktoon.site/api/details/${req.url}`)
        .then((result) => {
          result.json().then((data) => {
            res(data);
          });
        })
        .catch((err) => {
          res(err);
        });
      return true;
    case "init":
      return true;

    default:
      break;
  }
});

chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    const index = details.url.indexOf("articleid=");
    const url = details.url.slice(index + 10, index + 17);
    if (index !== -1) {
      // chrome.tabs.sendMessage(tabs[0].id, "Hello");
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { key: "url", value: url });
      });
    }
  },
  { urls: ["https://cafe.naver.com/*"], types: [] },
  ["requestBody"]
);
