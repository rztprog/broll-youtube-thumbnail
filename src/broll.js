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
let filePrefix = browser.i18n.getMessage("cfg_thumbnail")
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
    browser.tabs.query({}).then((tabs) => {
        for (let tab of tabs) {
            if (tab.url && tab.url.includes("broll.gabin.app")) {
                browser.tabs.executeScript(tab.id, {
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

browser.contextMenus.create({
    id: "downloadThumbnail",
    title: browser.i18n.getMessage("cfg_broll"),
    contexts: ["link"]
});

browser.contextMenus.create({
    id: "openinbrollThumbnail",
    parentId: "downloadThumbnail",
    title: browser.i18n.getMessage("cfg_openinbroll"),
    contexts: ["link"]
});

browser.contextMenus.create({
    id: "autodownloadThumbnail",
    parentId: "downloadThumbnail",
    title: browser.i18n.getMessage("cfg_autodownload"),
    contexts: ["link"]
});

browser.contextMenus.create({
    id: "copytoclipboardThumbnail",
    parentId: "downloadThumbnail",
    title: browser.i18n.getMessage("cfg_copytoclipboard") + " (Available in Nightly build only)",
    contexts: ["link"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    const videoUrl = info.linkUrl;

    if (videoUrl.includes('watch')) {
        if (info.menuItemId === "autodownloadThumbnail") {
            const videoId = videoUrl.split('v=')[1];
            const apiUrl = `https://broll.gabin.app/api/card/youtube/video?videoUrl=${videoUrl}`

            browser.tabs.sendMessage(tab.id, {
                action: 'downloadModal',
                message: browser.i18n.getMessage("cfg_creation"),
                videoId: videoId
            });

            fetch(apiUrl)
            .then(response => response.blob())
            .then(blob => {
                const url = URL.createObjectURL(blob);

                browser.downloads.download({
                    url: url,
                    filename: `${filePrefix}${videoParam == "videoId" ? videoId : ""}.png`,
                    saveAs: saveAs
                }, (downloadId) => {
                    if (downloadId) {
                        console.log('Downloaded with ID:', downloadId);
                        browser.tabs.sendMessage(tab.id, {
                            action: 'hideModal',
                            message: browser.i18n.getMessage("cfg_downloaded"),
                            videoId: videoId
                        });
                    } else {
                        console.error('Error initiating auto-download');
                    }
                });
            })
            .catch(error => {
                console.error('Error when downloading thumbnail:', error);
            });
        }
    
        if (info.menuItemId === "openinbrollThumbnail") {
            browser.tabs.create({
                url: `https://broll.gabin.app/?videoUrl=${videoUrl}&theme%5Bcard%5D%5BfontSize%5D=${fontSize}&theme%5Bcard%5D%5Bforeground%5D=${'%230f0f0f'}&theme%5Bcard%5D%5Bbackground%5D=%23ffffff&theme%5Bcard%5D%5Bspacing%5D=${spacing}&theme%5Bcard%5D%5BborderRadius%5D=${borderRadius}&theme%5Bduration%5D%5Bforeground%5D=%23ffffff&theme%5Bduration%5D%5Bbackground%5D=%23000000cc&theme%5BprogressBar%5D%5Bforeground%5D=%23ff0000&theme%5BprogressBar%5D%5Bbackground%5D=%23c8c8c899&theme%5Boptions%5D%5BshowDuration%5D=${showDuration}&theme%5Boptions%5D%5BshowViews%5D=${showViews}&theme%5Boptions%5D%5BshowPublishedAt%5D=${showPublished}&theme%5Boptions%5D%5BshowChannelThumbnail%5D=${showChannelLogo}&theme%5Boptions%5D%5BshowChannelTitle%5D=${showChannelTitle}`
            })
        }

        // Only available in Firefox Nighlty build (version > 129)
        if (info.menuItemId === "copytoclipboardThumbnail") {
            console.log("Not yet available !");
            /*
            const videoId = videoUrl.split('v=')[1];
            const apiUrl = `https://broll.gabin.app/api/card/youtube/video?videoUrl=${videoUrl}`

            browser.tabs.sendMessage(tab.id, {
                action: 'downloadModal',
                message: browser.i18n.getMeswarnincfg_creation"),
                videoId: videoId
            });

            fetch(apiUrl)
            .then(response => response.blob())
            .then(blob => {
                const item = new ClipboardItem({ "image/png": blob });

                navigator.clipboard.write([item]).then(() => {
                    console.log('Copied to clipboard !');
                    browser.tabs.sendMessage(tab.id, {
                        action: 'hideModal',
                        message: browser.i18n.getMessage("cfg_copied"),
                        videoId: videoId
                    });
                }).catch(error => {
                    console.error('Error when copying image:', error);
                });
            })
            .catch(error => {
                console.error('Error when fetching image:', error);
                browser.tabs.sendMessage(tab.id, {
                    action: 'hideModal',
                    message: "Available in Nightly build only 🛠️",
                    videoId: videoId
                });
            });
            */
        }
    }
});
