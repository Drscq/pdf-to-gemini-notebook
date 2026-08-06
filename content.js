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
     * The PDF behind a known publisher's article landing page.
     * Returns { pdfUrl, source } or null.
     */
    function publisherPdfUrlFor(url) {
        // ACM DL: /doi/10.1145/1374376.1374407 -> /doi/pdf/10.1145/1374376.1374407
        let m = url.match(/^(https?:\/\/dl\.acm\.org)\/doi\/(?:abs\/|full\/)?(10\.\d{4,}\/[^?#]+)/i);
        if (m) return { pdfUrl: `${m[1]}/doi/pdf/${m[2]}`, source: 'acm_landing' };

        // Springer: /chapter/10.1007/3-540-46766-1_34
        //        -> /content/pdf/10.1007/3-540-46766-1_34.pdf
        m = url.match(
            /^(https?:\/\/link\.springer\.com)\/(?:chapter|article|referenceworkentry|protocol)\/(10\.\d{4,}\/[^?#]+)/i);
        if (m) {
            const doi = m[2].replace(/\.pdf$/i, '');
            return { pdfUrl: `${m[1]}/content/pdf/${doi}.pdf`, source: 'springer_landing' };
        }

        return null;
    }

    /**
     * The identifying tail of the page's own URL (e.g. "3-540-46766-1_34"),
     * used to tell a chapter's PDF apart from the whole volume's.
     */
    function pageIdentifier(url) {
        try {
            const parts = new URL(url).pathname.split('/').filter(Boolean);
            return parts.length ? decodeURIComponent(parts[parts.length - 1]) : null;
        } catch (_) {
            return null;
        }
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

        // Strategy 2a: a PDF embedded in this HTML page, e.g. Springer's
        // "Chapter PDF" preview <iframe src="/content/pdf/....pdf">. The frame
        // the page chose to display is the document the user is looking at --
        // far more trustworthy than guessing from the page's links.
        const framed = [...document.querySelectorAll('iframe[src], object[data], embed[src]')]
            .map(el => el.src || el.data)
            .find(src => looksLikePdfUrl(src));
        if (framed) {
            return { isPdf: true, pdfUrl: framed, pageUrl, source: 'embedded_frame' };
        }

        // Strategy 2b: a known publisher's landing page -> its PDF URL.
        const publisher = publisherPdfUrlFor(currentUrl);
        if (publisher) {
            return { isPdf: true, pdfUrl: publisher.pdfUrl, pageUrl, source: publisher.source };
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
            // Prefer the link that belongs to THIS page. A Springer chapter
            // lists the whole volume's PDF (24 MB of proceedings) before the
            // chapter's own, so taking the first link imports the wrong -- and
            // vastly larger -- document.
            const id = pageIdentifier(currentUrl);
            const own = id ? pdfLinks.find(l => l.url.includes(id)) : null;
            return {
                isPdf: true,
                pdfUrl: (own || pdfLinks[0]).url,
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
