const downloadModal = (message, videoId) => {
    const images = document.querySelectorAll('img');

    images.forEach((img) => {
        if (img.src.includes(videoId)) {
            const div = document.createElement('div');
            div.className = `brollDownloadMessage_${videoId}`;
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            div.style.width = '100%';
            div.style.height = '100%';
            div.style.backgroundColor = 'rgba(0, 0, 0, 0.95)';
            div.style.position = 'absolute';

            const span = document.createElement('span');
            span.className = `modalSpan_${videoId}`;
            span.textContent = message;
            span.style.fontSize = '12px';

            div.appendChild(span);

            img.parentNode.insertBefore(div, img);
        }
    });
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadModal') {
        downloadModal(request.message, request.videoId);
    }

    if (request.action === 'hideModal') {
        const modal = document.querySelector(`.brollDownloadMessage_${request.videoId}`)
        const modalSpan = document.querySelector(`.modalSpan_${request.videoId}`)
        modal.style.transition = 'opacity 5s ease';
        modal.style.opacity = 1;
        modalSpan.textContent = request.message;

        setTimeout(() => {
            modal.style.opacity = 0;
        }, 0);

        setTimeout(() => {
            modal.style.display = "none";
        }, 5000);
    }
});
