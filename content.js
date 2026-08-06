/**
 * Content script: detects PDF URLs on the current page.
 * 
 * Detection strategies:
 * 1. Current page IS a PDF (Content-Type or .pdf extension)
 * 2. Links to PDFs on the page (e.g., arxiv abstract page -> PDF link)
 * 3. Known academic sites with predictable PDF URL patterns
 */

(function () {
    'use strict';

    // Avoid double-injection
    if (window.__pdfDetectorInjected) return;
    window.__pdfDetectorInjected = true;

    const currentUrl = window.location.href;

    /**
     * Publisher URLs that serve a PDF with no `.pdf` extension, e.g.
     * https://dl.acm.org/doi/pdf/10.1145/1374376.1374407
     */
    const EXTENSIONLESS_PDF_PATH_RE =
        /\/(?:doi\/(?:e?pdf|pdfdirect)\/|pdf\/|pdfdirect\/|stamp\/stamp\.jsp|content\/pdf\/|articles?\/pdf\/|download\/pdf)/i;

    function looksLikePdfUrl(url) {
        return typeof url === 'string' &&
            (/\.pdf(\?.*)?$/i.test(url) || EXTENSIONLESS_PDF_PATH_RE.test(url));
    }

    /**
     * Detect if the current page is a PDF or has PDF links.
     * Returns { isPdf, pdfUrl, pageUrl, source }
     */
    function detectPdf() {
        const pageUrl = currentUrl;

        // Strategy 0: the document Chrome is rendering IS a PDF. This is the
        // only reliable signal for publisher URLs that carry no `.pdf`
        // extension (dl.acm.org, IEEE Xplore...), and it does not depend on the
        // viewer's internals -- current Chrome renders full-page PDFs without
        // exposing an <embed> element at all.
        if (document.contentType === 'application/pdf') {
            return { isPdf: true, pdfUrl: currentUrl, pageUrl, source: 'embedded_pdf' };
        }

        // Strategy 1: Current URL looks like a PDF
        if (looksLikePdfUrl(currentUrl)) {
            return { isPdf: true, pdfUrl: currentUrl, pageUrl, source: 'direct_pdf_url' };
        }

        // Strategy 2: Embedded PDF viewer (older Chrome shows PDFs in <embed>)
        const embed = document.querySelector('embed[type="application/pdf"]');
        if (embed && embed.src && embed.src !== 'about:blank') {
            return { isPdf: true, pdfUrl: embed.src, pageUrl, source: 'embedded_pdf' };
        }

        // Strategy 2b: ACM DL article landing page -> its PDF URL.
        // https://dl.acm.org/doi/10.1145/1374376.1374407
        //   -> https://dl.acm.org/doi/pdf/10.1145/1374376.1374407
        const acmMatch = currentUrl.match(
            /^(https?:\/\/dl\.acm\.org)\/doi\/(?:abs\/|full\/)?(10\.\d{4,}\/[^?#]+)/i);
        if (acmMatch) {
            return {
                isPdf: true,
                pdfUrl: `${acmMatch[1]}/doi/pdf/${acmMatch[2]}`,
                pageUrl,
                source: 'acm_landing',
            };
        }

        // Strategy 3: arXiv abstract page -> construct PDF link
        // https://arxiv.org/abs/2511.12529 -> https://arxiv.org/pdf/2511.12529
        const arxivAbsMatch = currentUrl.match(/^https?:\/\/arxiv\.org\/abs\/([\d.]+)(v\d+)?/);
        if (arxivAbsMatch) {
            const arxivId = arxivAbsMatch[1] + (arxivAbsMatch[2] || '');
            const pdfUrl = `https://arxiv.org/pdf/${arxivId}`;
            return { isPdf: true, pdfUrl, pageUrl, source: 'arxiv_abstract' };
        }

        // Strategy 4: arXiv PDF page
        const arxivPdfMatch = currentUrl.match(/^https?:\/\/arxiv\.org\/pdf\/([\d.]+)/);
        if (arxivPdfMatch) {
            return { isPdf: true, pdfUrl: currentUrl, pageUrl, source: 'arxiv_pdf' };
        }

        // Strategy 5: Any link on the page that points to a PDF
        const pdfLinks = [];
        document.querySelectorAll('a[href]').forEach(a => {
            const href = a.href;
            if (looksLikePdfUrl(href)) {
                pdfLinks.push({
                    url: href,
                    text: (a.textContent || '').trim().substring(0, 80),
                });
            }
        });

        // Special case: arXiv HTML page with PDF link
        const arxivPdfLink = document.querySelector('a[href*="/pdf/"]');
        if (arxivPdfLink && /arxiv\.org/.test(currentUrl)) {
            return {
                isPdf: true,
                pdfUrl: arxivPdfLink.href,
                pageUrl,
                source: 'arxiv_link',
            };
        }

        if (pdfLinks.length > 0) {
            // Return the first PDF link found
            return {
                isPdf: true,
                pdfUrl: pdfLinks[0].url,
                pageUrl,
                source: 'page_link',
                allPdfLinks: pdfLinks,
            };
        }

        return { isPdf: false, pdfUrl: null, pageUrl, source: null };
    }

    // Run detection and send result to background
    const result = detectPdf();

    chrome.runtime.sendMessage({
        type: 'DETECT_PDF',
        data: result,
    }).catch(() => {
        // Extension context may be invalid, ignore
    });

    // Also listen for the popup asking for detection
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'REQUEST_PDF_DETECTION') {
            const result = detectPdf();
            sendResponse(result);
            return false;
        }
    });
})();
