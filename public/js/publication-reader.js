/* =========================================================
   PUBLICATION READER
   Wires every "Read" button/link (elements with a
   [data-reader-pdf] attribute) to the flipbook modal already
   present in publications.ejs. Renders the PDF page-by-page
   with pdf.js and turns those pages into a realistic
   page-flip book with page-flip.js. If either library isn't
   available, or the PDF fails to render, it falls back to a
   plain embedded PDF viewer inside the same modal so reading
   never breaks.
========================================================= */

(function () {
    'use strict';

    var PDF_SCALE = 1.5;

    var reader = document.getElementById('publication-reader');

    if (!reader) {
        return;
    }

    var flipWrap = reader.querySelector('.publication-flip-wrap');
    var flipContainer = document.getElementById('publication-flipbook');
    var flipLoading = document.getElementById('publication-flip-loading');
    var flipPrevBtn = document.getElementById('publication-flip-prev');
    var flipNextBtn = document.getElementById('publication-flip-next');
    var pageIndicator = document.getElementById('publication-flip-pageindicator');

    var frame = document.getElementById('publication-reader-frame');
    var fallbackLink = document.getElementById('publication-reader-fallback-link');
    var downloadLink = document.getElementById('publication-reader-download');
    var titleEl = document.getElementById('publication-reader-title');

    var pageFlipInstance = null;
    var loadToken = 0;


    /* ---------- helpers ---------- */

    function getPageFlipCtor() {
        if (typeof window.PageFlip !== 'undefined') {
            return window.PageFlip;
        }
        if (typeof window.St !== 'undefined' && window.St.PageFlip) {
            return window.St.PageFlip;
        }
        return null;
    }

    function setLoading(isLoading, message) {
        if (!flipLoading) return;
        flipLoading.textContent = message || 'Loading pages…';
        flipLoading.style.display = isLoading ? 'flex' : 'none';
    }

    function showFlipMode() {
        if (flipWrap) flipWrap.style.display = '';
        if (frame) frame.style.display = 'none';
        if (fallbackLink) fallbackLink.style.display = 'none';
    }

    function showFallbackMode(pdfUrl) {
        if (flipWrap) flipWrap.style.display = 'none';
        if (frame) {
            frame.style.display = '';
            frame.src = pdfUrl;
        }
        if (fallbackLink) {
            fallbackLink.style.display = '';
            fallbackLink.href = pdfUrl;
        }
        setLoading(false);
    }

    function destroyFlip() {
        if (pageFlipInstance) {
            try {
                pageFlipInstance.destroy();
            } catch (err) {
                /* already gone — nothing to do */
            }
            pageFlipInstance = null;
        }
        if (flipContainer) flipContainer.innerHTML = '';
        if (pageIndicator) pageIndicator.textContent = '';
    }

    function updatePageIndicator() {
        if (!pageFlipInstance || !pageIndicator) return;
        var current = pageFlipInstance.getCurrentPageIndex() + 1;
        var total = pageFlipInstance.getPageCount();
        pageIndicator.textContent = current + ' / ' + total;
    }


    /* ---------- pdf.js rendering ---------- */

    function renderPdfToPages(pdfUrl, token) {
        return window.pdfjsLib.getDocument(pdfUrl).promise.then(function (pdf) {
            var pageNumbers = [];
            for (var i = 1; i <= pdf.numPages; i++) {
                pageNumbers.push(i);
            }

            return pageNumbers.reduce(function (chain, pageNumber) {
                return chain.then(function (pages) {
                    // Bail out if the reader was closed / reopened with a
                    // different document while this was still rendering.
                    if (token !== loadToken) {
                        return pages;
                    }

                    setLoading(true, 'Loading page ' + pageNumber + ' of ' + pdf.numPages + '…');

                    return pdf.getPage(pageNumber).then(function (page) {
                        var viewport = page.getViewport({ scale: PDF_SCALE });

                        var canvas = document.createElement('canvas');
                        canvas.width = viewport.width;
                        canvas.height = viewport.height;

                        var ctx = canvas.getContext('2d');

                        return page
                            .render({ canvasContext: ctx, viewport: viewport })
                            .promise.then(function () {
                                pages.push(canvas.toDataURL('image/jpeg', 0.9));
                                return pages;
                            });
                    });
                });
            }, Promise.resolve([]));
        });
    }


    /* ---------- flipbook assembly ---------- */

    function buildFlipbook(pageImages) {
        destroyFlip();

        var PageFlipCtor = getPageFlipCtor();
        if (!PageFlipCtor) {
            throw new Error('page-flip library not available');
        }

        pageImages.forEach(function (src) {
            var pageEl = document.createElement('div');
            pageEl.className = 'publication-flip-page';

            var img = document.createElement('img');
            img.src = src;
            img.alt = '';
            img.draggable = false;

            pageEl.appendChild(img);
            flipContainer.appendChild(pageEl);
        });

        pageFlipInstance = new PageFlipCtor(flipContainer, {
            width: 550,
            height: 733,
            size: 'stretch',
            minWidth: 280,
            maxWidth: 1200,
            minHeight: 400,
            maxHeight: 1600,
            maxShadowOpacity: 0.5,
            showCover: true,
            mobileScrollSupport: true,
            usePortrait: true
        });

        pageFlipInstance.loadFromHTML(flipContainer.querySelectorAll('.publication-flip-page'));
        pageFlipInstance.on('flip', updatePageIndicator);

        updatePageIndicator();
    }

    function openFlipReader(pdfUrl) {
        var token = ++loadToken;

        setLoading(true, 'Loading pages…');
        showFlipMode();

        if (typeof window.pdfjsLib === 'undefined') {
            showFallbackMode(pdfUrl);
            return;
        }

        if (window.pdfjsLib.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc =
                'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }

        renderPdfToPages(pdfUrl, token)
            .then(function (pageImages) {
                if (token !== loadToken) return;

                buildFlipbook(pageImages);
                setLoading(false);
            })
            .catch(function (err) {
                if (token !== loadToken) return;

                console.warn('Publication reader: falling back to plain PDF preview.', err);
                showFallbackMode(pdfUrl);
            });
    }


    /* ---------- public open / close / fullscreen ---------- */

    window.openPublicationReader = function (pdfUrl, title) {
        if (!pdfUrl) return;

        reader.setAttribute('aria-hidden', 'false');
        reader.classList.add('is-open');
        document.body.classList.add('publication-reader-open');

        if (titleEl) titleEl.textContent = title || 'Publication';
        if (downloadLink) downloadLink.href = pdfUrl;
        if (fallbackLink) fallbackLink.href = pdfUrl;

        openFlipReader(pdfUrl);
    };

    window.closePublicationReader = function () {
        loadToken++; // invalidate any in-flight render

        reader.setAttribute('aria-hidden', 'true');
        reader.classList.remove('is-open');
        document.body.classList.remove('publication-reader-open');

        destroyFlip();

        if (frame) frame.src = '';

        if (document.fullscreenElement) {
            document.exitFullscreen().catch(function () {});
        }
    };

    window.togglePublicationFullscreen = function () {
        var panel = reader.querySelector('.publication-reader-panel');
        if (!panel) return;

        if (!document.fullscreenElement) {
            if (panel.requestFullscreen) {
                panel.requestFullscreen().catch(function () {});
            }
        } else if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    };


    /* ---------- wiring ---------- */

    document.addEventListener('click', function (e) {
        var trigger = e.target.closest('[data-reader-pdf]');
        if (!trigger) return;

        e.preventDefault();

        var pdfUrl = trigger.getAttribute('data-reader-pdf');
        var title = trigger.getAttribute('data-reader-title');

        window.openPublicationReader(pdfUrl, title);
    });

    if (flipPrevBtn) {
        flipPrevBtn.addEventListener('click', function () {
            if (pageFlipInstance) pageFlipInstance.flipPrev();
        });
    }

    if (flipNextBtn) {
        flipNextBtn.addEventListener('click', function () {
            if (pageFlipInstance) pageFlipInstance.flipNext();
        });
    }

    // Close on backdrop click or Escape.
    reader.addEventListener('click', function (e) {
        if (e.target === reader) window.closePublicationReader();
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && reader.classList.contains('is-open')) {
            window.closePublicationReader();
        }
    });
})();
