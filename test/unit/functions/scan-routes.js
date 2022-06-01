import { scanRoutes } from '../../../build/node/functions/scan-routes.js';

describe('scanRoutes()', () => {
    let html;
    let route;

    beforeEach(() => {
        html = `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <!-- head content -->
                </head>
                <body>
                    <!-- body content -->
                </body>
            </html>
        `;
        route = '/a/fake/route';
    });

    describe('without any anchors', () => {
        it('should return an empty array', () => {
            expect(scanRoutes(html, route)).to.deep.equal([]);
        });
    });

    describe('with an anchor pointing to an external document', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="https://example.com/external"></a>');
        });

        it('should return an empty array', () => {
            expect(scanRoutes(html, route)).to.deep.equal([]);
        });
    });

    describe('with an anchor pointing to an internal document at the root', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="/internal"></a>');
        });

        describe('without a defined base href', () => {
            it('should return an array with a route', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/internal']);
            });
        });

        describe('with a defined base href', () => {
            beforeEach(() => {
                html = html.replace('<!-- head content -->', ' <base href="/a/fake/base/href" />');
            });

            it('should return an array with a route', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/internal']);
            });
        });
    });

    describe('with an anchor pointing to an internal document at the root using a trailing slash', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="/internal/"></a>');
        });

        describe('without a defined base href', () => {
            it('should return an array with a route without the trailing slash', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/internal']);
            });
        });

        describe('with a defined base href', () => {
            beforeEach(() => {
                html = html.replace('<!-- head content -->', ' <base href="/a/fake/base/href" />');
            });

            it('should return an array with a route without the trailing slash', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/internal']);
            });
        });
    });

    describe('with an anchor pointing to an internal document at the same level', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="./internal"></a>');
        });

        describe('without a defined base href', () => {
            it('should return an array with a route', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/fake/internal']);
            });
        });

        describe('with a defined base href', () => {
            beforeEach(() => {
                html = html.replace('<!-- head content -->', ' <base href="/a/fake/base/href" />');
            });

            it('should return an array with a route', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/fake/base/internal']);
            });
        });
    });

    describe('with an anchor pointing to an internal document at the same level using a trailing slash', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="./internal/"></a>');
        });

        describe('without a defined base href', () => {
            it('should return an array with a route without the trailing slash', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/fake/internal']);
            });
        });

        describe('with a defined base href', () => {
            beforeEach(() => {
                html = html.replace('<!-- head content -->', ' <base href="/a/fake/base/href" />');
            });

            it('should return an array with a route without the trailing slash', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/fake/base/internal']);
            });
        });
    });

    describe('with an anchor pointing to an internal document one level above', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="../internal"></a>');
        });

        describe('without a defined base href', () => {
            it('should return an array with a route', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/internal']);
            });
        });

        describe('with a defined base href', () => {
            beforeEach(() => {
                html = html.replace('<!-- head content -->', ' <base href="/a/fake/base/href" />');
            });

            it('should return an array with a route', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/fake/internal']);
            });
        });
    });

    describe('with an anchor pointing to an internal document one level above using a trailing slash', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="../internal/"></a>');
        });

        describe('without a defined base href', () => {
            it('should return an array with a route without the trailing slash', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/internal']);
            });
        });

        describe('with a defined base href', () => {
            beforeEach(() => {
                html = html.replace('<!-- head content -->', ' <base href="/a/fake/base/href" />');
            });

            it('should return an array with a route without the trailing slash', () => {
                expect(scanRoutes(html, route)).to.deep.equal(['/a/fake/internal']);
            });
        });
    });

    describe('with an anchor pointing to an internal anchor', () => {
        beforeEach(() => {
            html = html.replace('<!-- body content -->', '<a href="#internal"></a>');
        });

        it('should return an empty array', () => {
            expect(scanRoutes(html, route)).to.deep.equal([]);
        });
    });
});
