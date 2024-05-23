const updateInputElement = (id, storageKey) => {
    const inputElement = document.getElementById(id);

    if (inputElement) {
        chrome.storage.local.get([storageKey], function (value) {
            if (value[storageKey] !== undefined) {
                if (inputElement.type === 'checkbox') {
                    inputElement.checked = value[storageKey];
                } else {
                    inputElement.value = value[storageKey];
                }

                inputElement.addEventListener("input", function (event) {
                    const newValue = inputElement.type === 'checkbox' ? event.target.checked : event.target.value;
                    chrome.storage.local.set({ [storageKey]: newValue });
                });
            }
        });
    }
}

window.onload = function() {
    // Updaters
    updateInputElement("displaydurationInput", "showDuration");
    updateInputElement("displaychannellogoInput", "showChannelLogo");
    updateInputElement("displaychannelnameInput", "showChannelTitle");                        
    updateInputElement("displayviewsInput", "showViews");
    updateInputElement("displaypublicationdateInput", "showPublished");
    updateInputElement("displayreadingprogressionInput", "showProgression");
    updateInputElement("autodownloadInput", "autoDownload");
    updateInputElement("dontopenInput", "dontOpen");
    updateInputElement("saveasInput", "saveAs");

    // Locales
    document.getElementById("titleName").textContent = chrome.i18n.getMessage("extensionName");
    document.getElementById("titleDescription").textContent = chrome.i18n.getMessage("extensionDescription");
    document.getElementById("settings_text").textContent = chrome.i18n.getMessage("cfg_settings");
    document.getElementById("features_text").textContent = chrome.i18n.getMessage("cfg_features");
    document.getElementById("display_duration_text").textContent = chrome.i18n.getMessage("cfg_display_duration");
    document.getElementById("display_channel_logo_text").textContent = chrome.i18n.getMessage("cfg_channel_logo");
    document.getElementById("display_channel_name_text").textContent = chrome.i18n.getMessage("cfg_channel_name");
    document.getElementById("display_views_text").textContent = chrome.i18n.getMessage("cfg_views");
    document.getElementById("display_publication_date_text").textContent = chrome.i18n.getMessage("cfg_publication");
    document.getElementById("display_reading_progression_text").textContent = chrome.i18n.getMessage("cfg_progression");
    document.getElementById("autodownload_text").textContent = chrome.i18n.getMessage("cfg_autodownload");
    document.getElementById("saveas_text").textContent = chrome.i18n.getMessage("cfg_saveas");
    document.getElementById("dontopen_text").textContent = chrome.i18n.getMessage("cfg_dontopen");

    // Version
    let manifestData = chrome.runtime.getManifest();
    document.querySelector(".extVersion").textContent = `v${manifestData.version}`;
};