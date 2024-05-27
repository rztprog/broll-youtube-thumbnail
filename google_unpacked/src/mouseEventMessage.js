const downloadModal = (message, videoId) => {
    const images = document.querySelectorAll('img');

    images.forEach((img) => {
        if (img.src.includes(videoId)) {
            if (!document.querySelector(`.brollDownloadMessage_${videoId}`)) {
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
        }
    });
}

const hideModal = (message, videoId) => {
    const modal = document.querySelector(`.brollDownloadMessage_${videoId}`)
    const modalSpan = document.querySelector(`.modalSpan_${videoId}`)
    modal.style.transition = 'opacity 3s ease';
    modal.style.opacity = 1;
    modalSpan.textContent = message;

    setTimeout(() => {
        modal.style.opacity = 0;
    }, 0);

    modal.addEventListener('transitionend', () => {
        modal.remove();
    });
}

const downloadImage = (imageUrl, filename) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = filename;
    link.click();
}

const copyImage = (imageUrl) => {
    fetch(imageUrl)
    .then(response => response.blob())
    .then(blob => {
        const item = new ClipboardItem({ "image/png": blob });

        navigator.clipboard.write([item])
        .then(() => {
            console.log('Image copied to clipboard !');
        })
        .catch(error => {
            console.error('Error when copying image:', error);
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadModal') {
        downloadModal(request.message, request.videoId);
    }

    if (request.action === 'hideModal') {
        hideModal(request.message, request.videoId)
    }

    if (request.action === 'downloadImage') {
        downloadImage(request.imageUrl, request.filename)
    }

    if (request.action === 'copyToClipboard') {
        copyImage(request.imageUrl)
    }
});
