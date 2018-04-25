import {TestHelper} from 'tslint-microsoft-contrib/tests/TestHelper';
import {getCanonicalPath, ImportsRuleTemplate} from '../src/ImportsRuleTemplate';

TestHelper.RULES_DIRECTORY = 'src';
describe('imports filters', () => {

    it('canonical path calculation', () => {
        const m = (p: string) => getCanonicalPath('src/path/a.ts', p);
        expect(m('module')).toBe('module');
        expect(m('./module')).toBe('src/path/module');
        expect(m('../parent')).toBe('src/parent');
        expect(m('./child/path')).toBe('src/path/child/path');
    });

    it('dynamic matchers', () => {
        const matcher = ImportsRuleTemplate.createMatcher('*', ['%0%/%1%']);
        expect(matcher.importMatcher('a/b', ['a', 'b'])).toEqual(['a/b']);
        expect(matcher.importMatcher('a/c', ['a', 'b'])).toEqual([]);
    });

    it('dynamic negated matchers', () => {
        const matcher = ImportsRuleTemplate.createMatcher('*', ['!(%0%)']);
        expect(matcher.importMatcher('b', ['a'])).toEqual(['b']);
        expect(matcher.importMatcher('a', ['a'])).toEqual([]);
    });

    it('filters all imports', () =>
        TestHelper.assertViolationsWithOptions('forbidden-imports', [{'**/*': ['**/*']}],
            'import hz from "somewhere"', [
                {
                    failure: 'Following import statements are forbidden due to dependency scoping issues: somewhere',
                    name: 'file.ts',
                    ruleName: 'forbidden-imports',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 1,
                        line: 1,
                    },
                },
            ]));

    it('allows all imports if no params are given', () => {
        TestHelper.assertViolationsWithOptions('forbidden-imports', [{}],
            'import hz from "somewhere"', []);
    });

    it('allows fine-grained import matching, positive', () => {
        TestHelper.assertViolationsWithOptions('forbidden-imports', [{'file.ts': ['**/A']}],
            'import * as b from "some/A"', [
                {
                    failure: 'Following import statements are forbidden due to dependency scoping issues: some/A',
                    name: 'file.ts',
                    ruleName: 'forbidden-imports',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 1,
                        line: 1,
                    },
                },
            ]);
    });

    it('allows fine-grained import matching, negative', () => {
        TestHelper.assertViolationsWithOptions('forbidden-imports', [{'file.ts': ['**/A']}],
            'import * as b from "z/B"', []);
    });

    it('allows fine-grained file matching, negative', () => {
        TestHelper.assertViolationsWithOptions('forbidden-imports', [{'I*.ts': ['**/*']}],
            'import * as b from "ok"', []);
    });

    it('allows multiple filter pairs', () => {
        TestHelper.assertViolationsWithOptions('forbidden-imports', [{'file.ts': ['*a/**'], '*': ['*/b*']}],
            'import * as b from "a/b"', [
                {
                    failure: 'Following import statements are forbidden due to dependency scoping issues: a/b',
                    name: 'file.ts',
                    ruleName: 'forbidden-imports',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 1,
                        line: 1,
                    },
                },
                {
                    failure: 'Following import statements are forbidden due to dependency scoping issues: a/b',
                    name: 'file.ts',
                    ruleName: 'forbidden-imports',
                    ruleSeverity: 'ERROR',
                    startPosition: {
                        character: 1,
                        line: 1,
                    },
                },
            ]);
    });
});
