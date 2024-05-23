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

let autoDownload = true
let saveAs = false
let dontOpen = true

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
        case "autoDownload":
            autoDownload = changes.autoDownload.newValue;
            break;
        case "dontOpen":
            dontOpen = changes.dontOpen.newValue;
            break;
        case "saveAs":
            saveAs = changes.saveAs.newValue;
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
    autoDownload = value.autoDownload === undefined ? autoDownload : value.autoDownload;
    dontOpen = value.dontOpen === undefined ? dontOpen : value.dontOpen;
    saveAs = value.saveAs === undefined ? saveAs : value.saveAs;

	chrome.storage.local.set({
		showDuration,
		showChannelLogo,
		showChannelTitle,
		showViews,
		showPublished,
        showProgression,
        autoDownload,
        dontOpen,
        saveAs
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
    title: browser.i18n.getMessage("menuItemDownloadThumbnail"),
    contexts: ["link"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "downloadThumbnail") {
        const videoUrl = info.linkUrl;
        const videoId = videoUrl.split('v=')[1];

        if (videoUrl.includes('watch')) {
            const apiUrl = `https://broll.gabin.app/api/card/youtube/video?videoUrl=${videoUrl}`

            if (autoDownload) {
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
                        filename: `thumbnail_${videoId}.png`,
                        saveAs: saveAs
                    }, (downloadId) => {
                        if (downloadId) {
                            console.log('Download started with ID:', downloadId);
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

            if (!dontOpen) {
                browser.tabs.create({
                    url: `https://broll.gabin.app/?videoUrl=${videoUrl}&theme%5Bcard%5D%5BfontSize%5D=${fontSize}&theme%5Bcard%5D%5Bforeground%5D=${'%230f0f0f'}&theme%5Bcard%5D%5Bbackground%5D=%23ffffff&theme%5Bcard%5D%5Bspacing%5D=${spacing}&theme%5Bcard%5D%5BborderRadius%5D=${borderRadius}&theme%5Bduration%5D%5Bforeground%5D=%23ffffff&theme%5Bduration%5D%5Bbackground%5D=%23000000cc&theme%5BprogressBar%5D%5Bforeground%5D=%23ff0000&theme%5BprogressBar%5D%5Bbackground%5D=%23c8c8c899&theme%5Boptions%5D%5BshowDuration%5D=${showDuration}&theme%5Boptions%5D%5BshowViews%5D=${showViews}&theme%5Boptions%5D%5BshowPublishedAt%5D=${showPublished}&theme%5Boptions%5D%5BshowChannelThumbnail%5D=${showChannelLogo}&theme%5Boptions%5D%5BshowChannelTitle%5D=${showChannelTitle}`
                })
            }
        }
    }
});
