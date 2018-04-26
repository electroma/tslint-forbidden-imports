import {ImportsRuleTemplate, IPatternToPatterns} from './ImportsRuleTemplate';

export class Rule extends ImportsRuleTemplate {
    get forbiddenImports(): IPatternToPatterns {
        let imports = {};
        if (this.getOptions().ruleArguments.length === 0 || typeof (imports = this.getOptions().ruleArguments[0]) !== 'object') {
            console.log(
                `Warning: ${this.getOptions().ruleName} rule is not configured properly, ` +
                'please pass {"file pattern" -> ["import patterns", ...]} as a rule parameter');
        }
        return imports;
    }
}
