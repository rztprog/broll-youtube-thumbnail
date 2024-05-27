'use strict';

let showDuration = true
let showChannelLogo = true
let showChannelTitle = true
let showViews = true
let showPublished = true
let showProgression = false

let fontSize = 1
let spacing = 1
let borderRadius = 1

let saveAs = false
let filePrefix = chrome.i18n.getMessage("cfg_thumbnail")
let videoParam = "videoId"

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
        case "showProgression":
            showProgression = changes.showProgression.newValue;
            brollModifier(5);
            break;
        case "saveAs":
            saveAs = changes.saveAs.newValue;
            break;
        case "filePrefix":
            filePrefix = changes.filePrefix.newValue;
            break;
        case "videoParam":
            videoParam = changes.videoParam.newValue;
            break;
    }
})

const loadVariables = (value) => {
	showDuration = value.showDuration === undefined ? showDuration : value.showDuration;
	showChannelLogo = value.showChannelLogo === undefined ? showChannelLogo : value.showChannelLogo;
	showChannelTitle = value.showChannelTitle === undefined ? showChannelTitle : value.showChannelTitle;
	showViews = value.showViews === undefined ? showViews : value.showViews;
	showPublished = value.showPublished === undefined ? showPublished : value.showPublished;
    showProgression = value.showProgression === undefined ? showProgression : value.showProgression;
    saveAs = value.saveAs === undefined ? saveAs : value.saveAs;
    filePrefix = value.filePrefix === undefined ? filePrefix : value.filePrefix;
    videoParam = value.videoParam === undefined ? videoParam : value.videoParam;

	chrome.storage.local.set({
		showDuration,
		showChannelLogo,
		showChannelTitle,
		showViews,
		showPublished,
        showProgression,
        saveAs,
        filePrefix,
        videoParam
	});
}

const brollModifier = (paramsOrder) => {
    chrome.tabs.query({}, (tabs) => {
        for (let tab of tabs) {
            if (tab.url && tab.url.includes("broll.gabin.app")) {
                chrome.tabs.executeScript(tab.id, {
                    code: `document.querySelectorAll(".items-start button")[${paramsOrder}].click();`
                }).then(() => {
                    console.log("Broll changed !");
                }).catch((error) => {
                    console.error("Error executing action:", error);
                });
            }
        }
    });
}

const createContextMenu = () => {
    chrome.contextMenus.create({
        id: "downloadThumbnail",
        title: chrome.i18n.getMessage("cfg_broll"),
        contexts: ["link"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error creating context menu item:", chrome.runtime.lastError.message);
        } else {
            console.log("Context menu item created successfully.");
        }
    });

    chrome.contextMenus.create({
        id: "openinbrollThumbnail",
        parentId: "downloadThumbnail",
        title: chrome.i18n.getMessage("cfg_openinbroll"),
        contexts: ["link"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error creating context menu item:", chrome.runtime.lastError.message);
        } else {
            console.log("Open in Broll context menu item created successfully.");
        }
    });

    chrome.contextMenus.create({
        id: "autodownloadThumbnail",
        parentId: "downloadThumbnail",
        title: chrome.i18n.getMessage("cfg_autodownload"),
        contexts: ["link"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error creating context menu item:", chrome.runtime.lastError.message);
        } else {
            console.log("Autodownload context menu item created successfully.");
        }
    });

    chrome.contextMenus.create({
        id: "copytoclipboardThumbnail",
        parentId: "downloadThumbnail",
        title: chrome.i18n.getMessage("cfg_copytoclipboard"),
        contexts: ["link"]
    }, () => {
        if (chrome.runtime.lastError) {
            console.error("Error creating context menu item:", chrome.runtime.lastError.message);
        } else {
            console.log("Copy to Clipboard context menu item created successfully.");
        }
    });
}

chrome.runtime.onInstalled.addListener(createContextMenu);
chrome.runtime.onStartup.addListener(createContextMenu);

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const videoUrl = info.linkUrl;

    if (videoUrl.includes('watch')) {
        if (info.menuItemId === "autodownloadThumbnail") {
            const apiUrl = `https://broll.gabin.app/api/card/youtube/video?videoUrl=${videoUrl}`
            const videoId = videoUrl.split('v=')[1];

            chrome.tabs.sendMessage(tab.id, {
                action: 'downloadModal',
                message: chrome.i18n.getMessage("cfg_creation"),
                videoId: videoId
            });

            fetch(apiUrl)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result;
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'downloadImage',
                        imageUrl: base64data,
                        filename: `${filePrefix}${videoParam == "videoId" ? videoId : ""}.png`,
                        saveAs: saveAs
                    });
                };
                reader.readAsDataURL(blob);
            }).then(() => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'hideModal',
                    message: chrome.i18n.getMessage("cfg_downloaded"),
                    videoId: videoId
                });
            })
            .catch(error => {
                console.error('Error when downloading thumbnail:', error);
            });
        }
    
        if (info.menuItemId === "openinbrollThumbnail") {
            chrome.tabs.create({
                url: `https://broll.gabin.app/?videoUrl=${videoUrl}&theme%5Bcard%5D%5BfontSize%5D=${fontSize}&theme%5Bcard%5D%5Bforeground%5D=${'%230f0f0f'}&theme%5Bcard%5D%5Bbackground%5D=%23ffffff&theme%5Bcard%5D%5Bspacing%5D=${spacing}&theme%5Bcard%5D%5BborderRadius%5D=${borderRadius}&theme%5Bduration%5D%5Bforeground%5D=%23ffffff&theme%5Bduration%5D%5Bbackground%5D=%23000000cc&theme%5BprogressBar%5D%5Bforeground%5D=%23ff0000&theme%5BprogressBar%5D%5Bbackground%5D=%23c8c8c899&theme%5Boptions%5D%5BshowDuration%5D=${showDuration}&theme%5Boptions%5D%5BshowViews%5D=${showViews}&theme%5Boptions%5D%5BshowPublishedAt%5D=${showPublished}&theme%5Boptions%5D%5BshowChannelThumbnail%5D=${showChannelLogo}&theme%5Boptions%5D%5BshowChannelTitle%5D=${showChannelTitle}`
            })
        }

        if (info.menuItemId === "copytoclipboardThumbnail") {
            const videoId = videoUrl.split('v=')[1];
            const apiUrl = `https://broll.gabin.app/api/card/youtube/video?videoUrl=${videoUrl}`;

            chrome.tabs.sendMessage(tab.id, {
                action: 'downloadModal',
                message: chrome.i18n.getMessage("cfg_creation"),
                videoId: videoId
            });

            fetch(apiUrl)
            .then(response => response.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = function() {
                    const base64data = reader.result;
                    chrome.tabs.sendMessage(tab.id, {
                        action: 'copyToClipboard',
                        imageUrl: base64data
                    });
                };
                reader.readAsDataURL(blob);
            })
            .then(() => {
                chrome.tabs.sendMessage(tab.id, {
                    action: 'hideModal',
                    message: chrome.i18n.getMessage("cfg_copied"),
                    videoId: videoId
                });
            })
            .catch(error => {
                console.error('Error when fetching image:', error);
            });
        }
    }
});
