'use strict';

let showDuration = true
let showChannelLogo = true
let showChannelTitle = true
let showViews = true
let showPublished = true

let fontSize = 1
let spacing = 1
let borderRadius = 1

chrome.storage.local.get(null, function (value) {
    loadVariables(value);
})

chrome.storage.onChanged.addListener(function (changes) {
	const updatedElement = Object.keys(changes)[0];
	switch (updatedElement) {
	  	case "showDuration":
			showDuration = changes.showDuration.newValue;
			brollModifier(0);
			break;
		case "showChannelLogo":
			showChannelLogo = changes.showChannelLogo.newValue;
			brollModifier(1);
			break;
		case "showChannelTitle":
			showChannelTitle = changes.showChannelTitle.newValue;
			brollModifier(2);
			break;
		case "showViews":
			showViews = changes.showViews.newValue;
			brollModifier(3);
			break;
		case "showPublished":
			showPublished = changes.showPublished.newValue;
			brollModifier(4);
			break;
	}
})

const loadVariables = (value) => {
	showDuration = value.showDuration === undefined ? showDuration : value.showDuration;
	showChannelLogo = value.showChannelLogo === undefined ? showChannelLogo : value.showChannelLogo;
	showChannelTitle = value.showChannelTitle === undefined ? showChannelTitle : value.showChannelTitle;
	showViews = value.showViews === undefined ? showViews : value.showViews;
	showPublished = value.showPublished === undefined ? showPublished : value.showPublished;

	chrome.storage.local.set({
		showDuration,
		showChannelLogo,
		showChannelTitle,
		showViews,
		showPublished
	});
}

function brollUpdateCheckbox(paramsOrder) {
    document.querySelectorAll(".items-start button")[paramsOrder].click();
}

const brollModifier = (paramsOrder) => {
    chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
            if (tab.url && tab.url.includes("broll.gabin.app")) {
                chrome.scripting.executeScript({
                    target : {tabId: tab.id},
                    func: brollUpdateCheckbox,
                    args: [paramsOrder]
                }).then(() => console.log("Broll changed !"));
            }
        }
    });
}

function createContextMenu() {
    chrome.contextMenus.create({
        id: "downloadThumbnail",
        title: chrome.i18n.getMessage("menuItemDownloadThumbnail"),
        contexts: ["link"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error creating context menu item:", chrome.runtime.lastError.message);
        } else {
            console.log("Context menu item created successfully.");
        }
    });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

async function writeToClipboard(text) {
    // await navigator.clipboard.writeText(text)
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "downloadThumbnail") {
        const videoUrl = info.linkUrl;

        if (videoUrl.includes('watch')) {
            writeToClipboard(videoUrl)
            .then(() => {
                return chrome.tabs.create({
                    url: `https://broll.gabin.app/?videoUrl=${videoUrl}&theme%5Bcard%5D%5BfontSize%5D=${fontSize}&theme%5Bcard%5D%5Bforeground%5D=${'%230f0f0f'}&theme%5Bcard%5D%5Bbackground%5D=%23ffffff&theme%5Bcard%5D%5Bspacing%5D=${spacing}&theme%5Bcard%5D%5BborderRadius%5D=${borderRadius}&theme%5Bduration%5D%5Bforeground%5D=%23ffffff&theme%5Bduration%5D%5Bbackground%5D=%23000000cc&theme%5BprogressBar%5D%5Bforeground%5D=%23ff0000&theme%5BprogressBar%5D%5Bbackground%5D=%23c8c8c899&theme%5Boptions%5D%5BshowDuration%5D=${showDuration}&theme%5Boptions%5D%5BshowViews%5D=${showViews}&theme%5Boptions%5D%5BshowPublishedAt%5D=${showPublished}&theme%5Boptions%5D%5BshowChannelThumbnail%5D=${showChannelLogo}&theme%5Boptions%5D%5BshowChannelTitle%5D=${showChannelTitle}`
                })
                .then((tab) => {
                    /* In Progress
                    
                    browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo, updatedTab) {
                        if (tabId === tab.id && changeInfo.status === "complete") {
                            browser.tabs.executeScript(tabId, {
                                file: 'src/autoDownload.js',
                                allFrames: true,
                            });
                            browser.tabs.onUpdated.removeListener(listener);
                        }
                    });
                    */
                });
            })
            .catch((error) => {
                console.error('Error when copy in clipboard :', error);
            });
        }
    }
});
