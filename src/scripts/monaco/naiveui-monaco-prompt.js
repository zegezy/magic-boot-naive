/**
 * Naive UI Monaco 自动提示
 * @author Yean
 * @date 2024-3-27 21:19:04
 */
import * as monaco from 'monaco-editor-core'
import componentsDefinition from './components-definition.json'

/**
 * 注册Naive UI Monaco自动提示
 * @param monaco
 */
export function registerNaiveMonacoCompletionProvider(monaco) {
    // 注册 Vue 语言的提示
    monaco.languages.registerCompletionItemProvider('vue', {
        triggerCharacters: ['<', ' ', ':', '@', '.'],
        provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
                startLineNumber: position.lineNumber,
                startColumn: 1,
                endLineNumber: position.lineNumber,
                endColumn: position.column
            })

            const suggestions = []

            // 组件标签提示
            if (textUntilPosition.match(/<[^>]*$/)) {
                const word = textUntilPosition.match(/[^<]*$/)[0]
                
                // Naive UI 组件提示
                if (word.startsWith('n-') || !word) {
                    Object.entries(componentsDefinition.naive).forEach(([tag, config]) => {
                        suggestions.push({
                            label: tag,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: tag,
                            detail: config.description,
                            documentation: { value: generateComponentDoc(tag, config) }
                        })
                    })
                }

                // MB 组件提示
                if (word.startsWith('mb-') || !word) {
                    Object.entries(componentsDefinition.mb).forEach(([tag, config]) => {
                        suggestions.push({
                            label: tag,
                            kind: monaco.languages.CompletionItemKind.Class,
                            insertText: tag,
                            detail: config.description,
                            documentation: { value: generateComponentDoc(tag, config) }
                        })
                    })
                }
            }

            // 属性和事件提示
            const tagMatch = textUntilPosition.match(/<([\w-]+)([^>]*)$/i)
            if (tagMatch) {
                const tag = tagMatch[1]
                const component = componentsDefinition.naive[tag] || componentsDefinition.mb[tag]
                
                if (component) {
                    // 属性提示
                    Object.entries(component.props || {}).forEach(([prop, config]) => {
                        suggestions.push({
                            label: prop,
                            kind: monaco.languages.CompletionItemKind.Property,
                            insertText: config.type === 'boolean' ? prop : `:${prop}=""`,
                            detail: `${config.description} (${config.type})`,
                            documentation: { value: generatePropDoc(prop, config) }
                        })
                    })

                    // 事件提示
                    Object.entries(component.events || {}).forEach(([event, config]) => {
                        suggestions.push({
                            label: `@${event}`,
                            kind: monaco.languages.CompletionItemKind.Event,
                            insertText: `@${event}="$1"`,
                            detail: config.description,
                            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
                        })
                    })
                }
            }

            return { suggestions }
        }
    })
}

function generateComponentDoc(tag, component) {
    const props = Object.entries(component.props || {})
        .map(([name, config]) => `  ${config.type === 'boolean' ? name : `:${name}=""`}`)
        .join('\n')

    const events = Object.keys(component.events || {})
        .map(event => `  @${event}=""`)
        .join('\n')

    return [
        '```vue',
        `<${tag}`,
        props,
        events,
        `/>`,
        '```',
        '',
        component.description || ''
    ].filter(Boolean).join('\n')
}

function generatePropDoc(prop, config) {
    const docs = [`**${prop}** - ${config.description}`]
    if (config.values) {
        docs.push('\n可选值：' + config.values.join(', '))
    }
    if (config.default) {
        docs.push(`\n默认值：${config.default}`)
    }
    return docs.join('\n')
}