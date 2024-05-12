'use strict';

browser.contextMenus.create({
    id: "downloadThumbnail",
    title: browser.i18n.getMessage("menuItemDownloadThumbnail"),
    contexts: ["link"]
});

browser.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "downloadThumbnail") {
        const videoUrl = info.linkUrl;

        if (videoUrl.includes('watch')) {
            navigator.clipboard.writeText(videoUrl)
                .then(() => {
                    browser.tabs.create({
                        url: `https://broll.gabin.app/?videoUrl=${videoUrl}&theme%5Bcard%5D%5BfontSize%5D=1&theme%5Bcard%5D%5Bforeground%5D=%230f0f0f&theme%5Bcard%5D%5Bbackground%5D=%23ffffff&theme%5Bcard%5D%5Bspacing%5D=1&theme%5Bcard%5D%5BborderRadius%5D=1&theme%5Bduration%5D%5Bforeground%5D=%23ffffff&theme%5Bduration%5D%5Bbackground%5D=%23000000cc&theme%5BprogressBar%5D%5Bforeground%5D=%23ff0000&theme%5BprogressBar%5D%5Bbackground%5D=%23c8c8c899&theme%5Boptions%5D%5BshowDuration%5D=true&theme%5Boptions%5D%5BshowViews%5D=true&theme%5Boptions%5D%5BshowPublishedAt%5D=true&theme%5Boptions%5D%5BshowChannelThumbnail%5D=true&theme%5Boptions%5D%5BshowChannelTitle%5D=true`
                    }).then((tab) => {
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
                    console.error('Erreur lors de la copie dans le presse-papiers :', error);
                });
        }
    }
});
