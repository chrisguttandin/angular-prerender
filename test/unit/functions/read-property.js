import { readProperty } from '../../../build/node/functions/read-property.js';

describe('readProperty()', () => {
    describe('without any defined project', () => {
        let defaultProject;
        let projects;

        beforeEach(() => {
            defaultProject = undefined;
            projects = {};
        });

        it('should throw an error', () => {
            expect(() => {
                readProperty(projects, defaultProject, [null, 'browser-target', null], 'outputPath');
            }).to.throw('Please specify a project or set the default project.');
        });
    });

    describe('with an unexistent default project', () => {
        let defaultProject;
        let projects;

        beforeEach(() => {
            defaultProject = 'default-project';
            projects = {};
        });

        it('should throw an error', () => {
            expect(() => {
                readProperty(projects, defaultProject, [null, 'browser-target', null], 'outputPath');
            }).to.throw('No project with the name "default-project" was found.');
        });
    });

    describe('with an existent default project', () => {
        let defaultProject;
        let projects;

        beforeEach(() => {
            defaultProject = 'default-project';
            projects = { 'default-project': {} };
        });

        describe('without any defined target', () => {
            it('should throw an error', () => {
                expect(() => {
                    readProperty(projects, defaultProject, [null, 'browser-target', null], 'outputPath');
                }).to.throw('No target was found for the "default-project" project.');
            });
        });

        describe('with an unexistent target', () => {
            beforeEach(() => {
                projects['default-project'].targets = {};
            });

            it('should throw an error', () => {
                expect(() => {
                    readProperty(projects, defaultProject, [null, 'browser-target', null], 'outputPath');
                }).to.throw('The target "browser-target" was not found inside the configuration of the "default-project" project.');
            });
        });

        describe('with an existent target', () => {
            beforeEach(() => {
                projects['default-project'].targets = { 'browser-target': { options: { outputPath: 'the/ouput/path' } } };
            });

            describe('without any defined configuration', () => {
                it('should return the value', () => {
                    expect(readProperty(projects, defaultProject, [null, 'browser-target', null], 'outputPath')).to.equal('the/ouput/path');
                });
            });
        });
    });

    describe('with an unexistent project', () => {
        let defaultProject;
        let projects;

        beforeEach(() => {
            defaultProject = 'default-project';
            projects = {};
        });

        it('should throw an error', () => {
            expect(() => {
                readProperty(projects, defaultProject, ['project', 'browser-target', null], 'outputPath');
            }).to.throw('No project with the name "project" was found.');
        });
    });

    describe('with an existent project', () => {
        let defaultProject;
        let projects;

        beforeEach(() => {
            defaultProject = 'default-project';
            projects = { project: {} };
        });

        describe('without any defined target', () => {
            it('should throw an error', () => {
                expect(() => {
                    readProperty(projects, defaultProject, ['project', 'browser-target', null], 'outputPath');
                }).to.throw('No target was found for the "project" project.');
            });
        });

        describe('with an unexistent target', () => {
            beforeEach(() => {
                projects.project.targets = {};
            });

            it('should throw an error', () => {
                expect(() => {
                    readProperty(projects, defaultProject, ['project', 'browser-target', null], 'outputPath');
                }).to.throw('The target "browser-target" was not found inside the configuration of the "project" project.');
            });
        });

        describe('with an existent target', () => {
            beforeEach(() => {
                projects.project.targets = { 'browser-target': { options: { outputPath: 'the/ouput/path' } } };
            });

            describe('without any defined configuration', () => {
                it('should return the value', () => {
                    expect(readProperty(projects, defaultProject, ['project', 'browser-target', null], 'outputPath')).to.equal(
                        'the/ouput/path'
                    );
                });
            });

            describe('with an unexistent configuration', () => {
                beforeEach(() => {
                    projects.project.targets['browser-target'].configurations = {};
                });

                it('should throw an error', () => {
                    expect(() => {
                        readProperty(projects, defaultProject, ['project', 'browser-target', 'configuration'], 'outputPath');
                    }).to.throw(
                        'The configuration "configuration" was not found for the target "browser-target" inside the configuration of the "project" project.'
                    );
                });
            });

            describe('with an existent configuration', () => {
                describe('with the property defined as part of the options', () => {
                    beforeEach(() => {
                        projects.project.targets['browser-target'].options = { outputPath: 'the/ouput/path' };
                        projects.project.targets['browser-target'].configurations = { configuration: {} };
                    });

                    it('should return the value', () => {
                        expect(
                            readProperty(projects, defaultProject, ['project', 'browser-target', 'configuration'], 'outputPath')
                        ).to.equal('the/ouput/path');
                    });
                });

                describe('with the property defined as part of the configuration', () => {
                    beforeEach(() => {
                        projects.project.targets['browser-target'].options = { outputPath: 'the/ouput/path' };
                        projects.project.targets['browser-target'].configurations = { configuration: { outputPath: 'another/ouput/path' } };
                    });

                    it('should return the value', () => {
                        expect(
                            readProperty(projects, defaultProject, ['project', 'browser-target', 'configuration'], 'outputPath')
                        ).to.equal('another/ouput/path');
                    });
                });
            });
        });
    });
});
