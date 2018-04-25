import * as assert from 'assert';
import {flatMap} from 'lodash';
import {capture, isMatch} from 'micromatch';
import * as path from 'path';
import * as Lint from 'tslint';
import {IOptions} from 'tslint';
import * as ts from 'typescript';

export interface IPatternToPatterns {
    [key: string]: string[];
}

export interface IPatternMatcher {
    pathMatcher: (path: string) => string[];
    importMatcher: (path: string, vars: string[]) => any[];
}

const GLOB_OPTS = {dot: true};
const FAILURE_MESSAGE_PREFIX = 'Following import statements are forbidden due to dependency scoping issues: ';

export function getCanonicalPath(base: string, importedPath: string) {
    if (importedPath[0] === '.') {
        const absPath = path.resolve(base, '..', importedPath);
        const cwd = process.cwd();
        assert(absPath.indexOf(cwd) === 0, 'Referencing file outside of project root!');
        return absPath.substr(cwd.length + 1);
    } else {
        return importedPath;
    }
}

class ImportsCheckWalker extends Lint.RuleWalker {

    constructor(sourceFile: ts.SourceFile,
                options: IOptions,
                private checkImport: (importPath: string, vars: string[]) => any[],
                private nameMatches: string[]) {
        super(sourceFile, options);
    }

    public visitImportDeclaration(node: ts.ImportDeclaration) {
        const canonicalPath = getCanonicalPath(
            this.getSourceFile().fileName, (node.moduleSpecifier as ts.StringLiteral).text);
        const failedPatterns = this.checkImport(canonicalPath, this.nameMatches);
        if (failedPatterns.length > 0) {
            this.addFailureAt(node.getStart(), node.getWidth(), FAILURE_MESSAGE_PREFIX + failedPatterns.join(', '));
        }
        super.visitImportDeclaration(node);
    }
}

export abstract class ImportsRuleTemplate extends Lint.Rules.AbstractRule {

    protected abstract forbiddenImports: IPatternToPatterns;
    private matchers: IPatternMatcher[];

    static createCapture(pattern: string) {

        return (f: string) => capture(pattern, f, GLOB_OPTS);
    }

    static createStaticChecker(pattern: string) {
        return (f: string) => isMatch(f, pattern, GLOB_OPTS) ? f : false;
    }

    private static createDynamicPatternChecker(pattern: string) {
        return (f: string, v: string[]) => {
            v.forEach((s, idx) => pattern = pattern.replace(`%${idx}%`, s));
            const matcher = ImportsRuleTemplate.createStaticChecker(pattern);
            return matcher(f) ? f : false;
        };
    }

    static createMatcher(filePattern: string, importPatterns: string[]): IPatternMatcher {
        const fileMatch = ImportsRuleTemplate.createCapture(filePattern);
        const importMatchers = importPatterns.map((p) => {
            // case for capture groups
            if (p.indexOf('%') !== -1) {
                return ImportsRuleTemplate.createDynamicPatternChecker(p);
            } else {
                return ImportsRuleTemplate.createStaticChecker(p);
            }
        });
        return {
            pathMatcher: fileMatch,
            importMatcher: (imp, vars) => {
                return importMatchers.map((m) => m(imp, vars)).filter((m) => m !== false);
            },
        };
    }

    protected constructor(options: IOptions) {
        super(options);
        this.configure();
    }

    private configure() {
        this.matchers = Object.getOwnPropertyNames(this.forbiddenImports)
            .map((pattern) => ImportsRuleTemplate.createMatcher(pattern, this.forbiddenImports[pattern]));
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return flatMap(
            this.matchers
                .map((m) => ({importMatcher: m.importMatcher, matches: m.pathMatcher(sourceFile.fileName)}))
                .filter(({matches}) => matches),
            (m) => {
                return this.applyWithWalker(new ImportsCheckWalker(sourceFile, this.getOptions(), m.importMatcher, m.matches));
            });
    }
}
