/**
 * Naive UI Monaco 自动提示
 * @author Yean
 * @date 2024-3-27 21:19:04
 */
import webTypesData from 'naive-ui/web-types.json'; // 替换成你的web-types.json文件路径

/**
 * 获取Naive UI组件自动提示项
 * @returns {*[]}
 */
export function naiveUiCompletionItems(monaco) {
    const naiveUiComponents = webTypesData.contributions.html['vue-components'];
    return naiveUiComponents.flatMap(component => {
        const componentName = component.name.replace(/^N/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(); // 去除首字母"N"并转为小写
        const tagForm = `<n-${componentName} `;
        const componentDescription = component.description;

        // 组件自身提示项
        const componentCompletion = {
            label: tagForm,
            kind: monaco.languages.CompletionItemKind.Text,
            documentation: componentDescription,
            insertText: tagForm,
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        };

        // 组件props提示项
        const componentProps = component.props.map(prop => ({
            label: prop.name,
            kind: monaco.languages.CompletionItemKind.Property,
            documentation: prop.description,
            detail: prop.type,
            insertText: `{ ${prop.name}$1 }`, // $1 表示插入点
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
        }));

        // 组件事件提示项
        const componentEvents = component.js?.events?.map(event => ({
            label: `@${event.name}`,
            kind: monaco.languages.CompletionItemKind.Event,
            documentation: event.description || '',
            insertText: `@${event.name}="$1"` // $1 表示插入点
        }));

        // 返回组件、props和事件的CompletionItems
        return [componentCompletion, ...componentProps, ...(componentEvents || [])];
    });
}

/**
 * 注册Naive UI Monaco自动提示
 * @param monaco
 */
export function registerNaiveMonacoCompletionProvider(monaco){
    monaco.languages.registerCompletionItemProvider('vue', {
        triggerCharacters:['<','@','v-on:',' '],
        provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: word.startColumn,
                endColumn: word.endColumn,
            };

            return { suggestions: naiveUiCompletionItems(monaco) };
        }
    });
}