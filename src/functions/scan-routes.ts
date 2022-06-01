import { createDocument } from 'domino';

const FAKE_ORIGIN = 'https://a.hopefully.unique.url';

export const scanRoutes = (html: string, route: string): string[] => {
    const document = createDocument(html);
    const baseHref = document.head.querySelector('base')?.getAttribute('href') ?? route;
    const baseUrl = new URL(baseHref, FAKE_ORIGIN);
    const anchors = document.querySelectorAll<HTMLAnchorElement>('a[href]');

    return Array.from(
        Array.from(anchors)
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href): href is string => href !== null && !href.startsWith('#'))
            .map((href) => new URL(href, baseUrl))
            .filter((url) => url.origin === FAKE_ORIGIN)
            .map((url) => url.pathname)
            .map((pathname) => (pathname.endsWith('/') ? pathname.slice(0, -1) : pathname))
            .reduce((routes, pathname) => routes.add(pathname), new Set<string>())
    );
};
