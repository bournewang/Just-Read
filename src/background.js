function isEmpty(obj) {
    if(obj) return Object.keys(obj).length === 0;
    return true;
}

let preventInstance = {};
let tabArticles = {}; // {tabId: article}

function startJustRead(tab) {
    console.log("====== background : startJustRead, tab: "+tab.id)
    if (tab) {
        executeScripts(tab.id);
    } else {
        chrome.tabs.query(
            { currentWindow: true, active: true },
            (tabArray) => executeScripts(tabArray[0].id)
        );
    }
}

function executeScripts(tabId) {
    console.log("====== background: " + tabId)
    if (preventInstance[tabId]) return;

    preventInstance[tabId] = true;
    setTimeout(() => delete preventInstance[tabId], 10000);

    // Load our external scripts, then our content script
    chrome.scripting.executeScript({
        target: {tabId: tabId},
        // matches: ["<all_urls>"],
        files: [
            "external-libraries/datGUI/dat.gui.min.js",
            "external-libraries/DOMPurify/purify.min.js",
            "external-libraries/Rangy/rangy.min.js",
            "external-libraries/Rangy/rangy-classapplier.min.js",
            "external-libraries/Rangy/rangy-highlighter.min.js",
            "external-libraries/Rangy/rangy-textrange.min.js",
            "external-libraries/jquery/jquery-3.6.0.min.js",
            "content_script.js"
        ]
    });


    // Add a badge to signify the extension is in use
    chrome.action.setBadgeBackgroundColor({color:[242, 38, 19, 230]});
    chrome.action.setBadgeText({text:"on"});

    // Check if we need to add the site to JR's autorun list
    chrome.storage.sync.get("alwaysAddAR", function(result) {
        if(result && result["alwaysAddAR"]) {
            addSiteToAutorunList(null, tab);
        }
    });

    setTimeout(function() {
        chrome.action.setBadgeText({text:""});
    }, 2000);
}

function startSelectText() {
    chrome.scripting.executeScript({target: null, function(){
        let useText = true;
        }, function(){
            startJustRead();
        }
    });
}

function createPageCM() {
    // Create a right click menu option
    pageCMId = chrome.contextMenus.create({
         title: "View this page using Just Read",
         id: "pageCM",
         contexts: ["page"]
    });
}
function createLinkCM() {
    // Create an entry to allow user to open a given link using Just read
    linkCMId = chrome.contextMenus.create({
        title: "View the linked page using Just Read",
        id: "linkCM",
        contexts:["link"]
    });
}
function createAutorunCM() {
    // Create an entry to allow user to open a given link using Just read
    autorunCMId = chrome.contextMenus.create({
        title: "Add this site to Just Read's auto-run list",
        id: "autorunCM",
        contexts:["page"],
        // onclick: addSiteToAutorunList
    });
}
function addSiteToAutorunList(info, tab) {
    // TODO strip jr=on from query params

    chrome.storage.sync.get('auto-enable-site-list', function(result) {
        let url = new URL((info != null && info.pageUrl) || tab.url);
        let entry;
        if(url.pathname !== "/"
        && url.pathname !== "") {
            entry = url.hostname + "/.+";
        } else {
            entry = url.hostname;
        }

        let currentDomains = result['auto-enable-site-list'];

        if(!isEmpty(currentDomains)) {
            if(!currentDomains.includes(entry)) {
                chrome.storage.sync.set({
                    'auto-enable-site-list': [...currentDomains, entry],
                }, function() {
                    if(currentDomains.indexOf(url.hostname)) {
                        console.log("Just Read auto-run entry added.\n\nWarning: An auto-run entry with the same hostname has already been added. Be careful to not add two duplicates.");
                    } else {
                        console.log('Just Read auto-run entry added.');
                    }
                });
            } else {
                console.error("Entry already exists inside of Just Read's auto-run list. Not adding new entry.")
            }
        } else {
            chrome.storage.sync.set({ 'auto-enable-site-list': [entry] });
        }
    });
}


let pageCMId = linkCMId = autorunCMId = undefined;

// Listen for the extension's click
chrome.action.onClicked.addListener(startJustRead);

// Listen for the keyboard shortcut
chrome.commands.onCommand.addListener(function(command) {
    if(command == "open-just-read")
        startJustRead();
    if(command == "select-text")
        startSelectText();
});

// Listen for messages
let lastClosed = Date.now();
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("======== background: onMessage ")
    console.log(request)
    if(request === "Open options") {
        chrome.runtime.openOptionsPage();
    // } else if(request.updateCMs === "true") {
        // updateCMs();
    } else if(request.closeTab === "true") {
        chrome.tabs.getSelected(function(tab) {
            setTimeout(function() { chrome.tabs.remove(tab.id) }, 100);
        });
    } else if(request.savedVersion) {
        const data = {
            content: request.savedVersion,
            url: sender.url,
        };
        if(request.savedComments) {
            data.savedComments = request.savedComments;
            data.savedCompactComments = request.savedCompactComments;
        }
        localStorage.setItem('JRSavedPage', JSON.stringify(data));
    } else if(request.hasSavedVersion) {
        const lastSavedPage = JSON.parse(localStorage.getItem('JRSavedPage'));
        if(lastSavedPage
        && sender.url === lastSavedPage.url) {
            if(lastSavedPage.savedComments) {
                sendResponse({
                    content: lastSavedPage.content,
                    savedComments: lastSavedPage.savedComments,
                    savedCompactComments: lastSavedPage.savedCompactComments
                });
            } else {
                sendResponse({ content: lastSavedPage.content });
            }
        }
    }
    else if(request.lastClosed) {
        lastClosed = request.lastClosed;
    }
    // For JRP
    else if(request.jrSecret) {
        chrome.storage.sync.set({'jrSecret': request.jrSecret});
    }
    else if (request.resetJRLastChecked) {
        chrome.storage.sync.set({'jrLastChecked': ''});
    }
    else if (request.tabOpenedJR) {
        const tabURL = request.tabOpenedJR.href.split('?')[0];
        for (const tabId in preventInstance) {
            chrome.tabs.get(parseInt(tabId), (tab) => {
                if (tab.url.split('?')[0] === tabURL) {
                    setTimeout(() => delete preventInstance[tabId], 1000);
                }
            });
        }
    }
    else if (request.eventType == "articleFinishLoading") {
        // 1. check if the ori_url is already created a articles
        fetch("http://localhost:4567/articles/check/exists?ori_url="+request.ori_url, {
            method: 'GET',
            mode: 'cors',
        })
            .then(res => res.json())
            .then(res => {
            if (res.success) {
                tabArticles[sender.tab.id] = res.data
            }else{
                // 2. create article if not created before
                fetch("http://localhost:4567/upload", {
                    method: 'POST',
                    mode: 'cors',
                    body: JSON.stringify({
                        title: request.title,
                        author: request.author,
                        ori_url: request.ori_url,
                        content: request.content
                    })
                })
                    .then(res => res.json())
                    .then(res => {
                    tabArticles[sender.tab.id] = res.data
                })
            }
        })
    }
    else if (request.eventType == "highlight") {
        var article = tabArticles[sender.tab.id]
        fetch("http://localhost:4567/articles/"+article.id, {
            method: 'PUT',
            mode: 'cors',
            body: JSON.stringify({
                highlight: request.highlight
            })
        })
    }
});

// Create an entry to allow user to select an element to read from
chrome.contextMenus.create({
    title: "Select content to read",
    id: "select-to-read"
});

chrome.contextMenus.create({
    title: "Main Page",
    id: "main",
    // contexts: ["link"],
//     onclick : function(){
//         chrome.tabs.create({ url: "main.html" });
//     }
});


chrome.contextMenus.onClicked.addListener(function(itemData) {
    if (itemData.menuItemId == 'main') {
        chrome.tabs.create({ url: "main.html" });
    }else if (itemData.menuItemId == "select-to-read") {
        startSelectText();
    } else if(itemData.menuItemId == 'pageCM') {
        startJustRead();
    } else if (itemData.menuItemId == 'linkCM') {
        // onclick: function(info, tab) {
        chrome.tabs.create(
            { url: info.linkUrl, active: false },
            function(newTab) {
                chrome.tabs.executeScript(newTab.id, {
                    code: 'let runOnLoad = true'
                }, function() {
                    startJustRead(newTab);
                });
            }
        );
    } else if (itemData.menuItemId == 'autorunCM') {
        addSiteToAutorunList()
    }
});


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
    if(preventInstance[tabId]) return;

    const change = Date.now() - lastClosed;
    if (changeInfo.status === 'complete' && change > 300) {
        // Auto enable on sites specified
        chrome.storage.sync.get('auto-enable-site-list', function (siteListObj) {
            let siteList;
            if(siteListObj) {
                siteList = siteListObj['auto-enable-site-list'];
                const url = tab.url;

                if(typeof siteList !== "undefined") {
                    for(let i = 0; i < siteList.length; i++) {
                        // Allows the format `text.npr.org>5000` to autorun JR after 5 seconds on text.npr.org
                        const entry = siteList[i];
                        const splitEntry = entry.split('>');
                        const entryRegex = splitEntry[0];
                        const urlRegex = new RegExp(entryRegex, "i");
                        const entryDelay = splitEntry.length > 1 ? splitEntry[1] : 0;

                        if( url.match( urlRegex ) ) {
                            chrome.tabs.executeScript(tabId, {
                                code: 'let runOnLoad = true;' // Ghetto way of signaling to run on load
                            }, function() {                   // instead of using Chrome messages
                                setTimeout(() => startJustRead(tab), entryDelay);
                            });
                            return;
                        }
                    }
                }

                // Check if jr=on is set, autorun if so
                if(new URL(url).searchParams.get('jr') === 'on') {
                    startJustRead(tab);
                }
            }
        });
    }
});
