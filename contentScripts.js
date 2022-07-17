let toonListUl;
let mainArea;
let currentTitle;
let currentEp;
let currentURL = null;

let WT_EXT_URL = JSON.parse(localStorage.getItem("WT_EXT_URL"));

const createElement = (tagName, className, parents, innertxt) => {
  const element = document.createElement(tagName);
  if (className !== undefined && typeof className === "string") {
    element.className = className;
  }
  if (parents === undefined) {
    document.body.append(element);
  } else {
    parents.append(element);
  }
  if (innertxt !== undefined) {
    element.innerText = innertxt;
  }
  return element;
};

const toggleClassList = (target, className) => {
  if (target.classList.contains(className)) {
    target.classList.remove(className);
  } else {
    target.classList.add(className);
  }
};

const setRemoteController = () => {
  const rootElement = createElement("div", "WT_EXT_ROOT");
  rootElement.classList.add("hidden");
  mainArea = createElement("div", "WT_EXT_MAIN", rootElement);

  const hiddenBtn = createElement("button", "WT_EXT_hiddenBtn", rootElement);
  const toonListArea = createElement("div", "WT_EXT_toonListArea");
  toonListArea.classList.add("hidden");
  toonListArea.classList.add("rollup");
  hiddenBtn.addEventListener("click", () => {
    toggleClassList(rootElement, "hidden");
    toggleClassList(toonListArea, "hidden");
  });
  const toonListHiddenBtn = createElement(
    "button",
    "WT_EXT_toonListHiddenBtn",
    toonListArea
  );
  toonListHiddenBtn.addEventListener("click", () =>
    toggleClassList(toonListArea, "rollup")
  );
  toonListUl = createElement("ul", "WT_EXT_toonListUl", toonListArea);
  currentTitle = createElement("p", "WT_EXT_title", mainArea);
  currentEp = createElement("p", "WT_EXT_ep", mainArea);
};

const setToonList = (title, author) => {
  const li = createElement("li", "WT_EXT_toonListLi", toonListUl);
  createElement("p", "title", li, title);
  createElement("p", "author", li, author);
  li.addEventListener("click", () => {
    chrome.runtime.sendMessage(
      {
        key: "getDetails",
        title,
      },
      (res) => {
        const latestUrl = res[res.length - 1].url;
        window.location.href = `https://cafe.naver.com/steamindiegame/${latestUrl}`;
      }
    );
  });
};

const setRootInfo = () => {};

window.addEventListener("click", () => {});
window.addEventListener("hashchange", () => {
  console.log(window.location.search);
});

chrome.runtime.sendMessage({ key: "getURL" }, (res) => {
  localStorage.setItem("WT_EXT_URL", JSON.stringify(res));
  // if (res.includes(parseInt(currentURL))) {
  //   console.log("webtoon");
  // }
});
chrome.runtime.sendMessage({ key: "getToon" }, (res) => {
  // console.log(res);
  if (Array.isArray(res)) {
    res.forEach((element) => {
      setToonList(element.title, element.author.name);
    });
  }
});
chrome.runtime.onMessage.addListener((req, sender, res) => {
  switch (req.key) {
    case "url":
      if (WT_EXT_URL.includes(parseInt(req.value))) {
        currentURL = req.value;
        chrome.runtime.sendMessage(
          { key: "getToonByUrl", url: req.value },
          (result) => {
            currentTitle.innerText = `${result.toon.title}`;
            currentEp.innerText = `${result.ep}화`;
            console.log(result);
          }
        );
      } else {
        currentURL = null;
      }
      break;

    default:
      break;
  }
});

setRemoteController();

const onLoad = (e) => {
  const url = e.path[0].contentDocument.URL;
  const index1 = url.indexOf("articleid=");
  const index2 = url.indexOf("articles/");

  if (index1 !== -1) {
    currentURL = url.slice(index1 + 10, index1 + 17);
  } else if (index2 !== -1) {
    currentURL = url.slice(index2 + 9, index2 + 16);
  } else {
    currentURL = null;
  }
};

const iFrame = document.getElementById("cafe_main");
iFrame.addEventListener("load", onLoad);
