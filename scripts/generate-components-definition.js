// 在构建时生成组件定义文件
const fs = require('fs')
const path = require('path')
const webTypes = require('naive-ui/web-types.json')
const { parse, compileScript } = require('@vue/compiler-sfc')

// 从 web-types.json 生成 Naive UI 组件定义
function generateNaiveComponents() {
    const naiveComponents = {}
    
    webTypes.contributions.html['vue-components'].forEach(component => {
        const name = component.name.replace(/^N/, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
        const componentName = `n-${name}`
        
        naiveComponents[componentName] = {
            description: component.description,
            props: component.props.reduce((acc, prop) => {
                acc[prop.name] = {
                    type: prop.type,
                    description: prop.description,
                    values: prop.values
                }
                return acc
            }, {}),
            events: (component.events || []).reduce((acc, event) => {
                acc[event.name] = {
                    description: event.description
                }
                return acc
            }, {})
        }
    })
    
    return naiveComponents
}

// 扫描 MB 组件目录生成组件定义
function generateMBComponents() {
    const mbComponents = {}
    // 扫描 components 下的所有目录
    const componentsDir = path.resolve(__dirname, '../src/components')
    
    function scanComponents(dir) {
        const files = fs.readdirSync(dir)
        files.forEach(file => {
            const filePath = path.join(dir, file)
            const stat = fs.statSync(filePath)
            
            if (stat.isDirectory()) {
                scanComponents(filePath)
            } else if (file.endsWith('.vue')) {
                const content = fs.readFileSync(filePath, 'utf-8')
                // 直接使用文件名作为组件名,不添加任何前缀
                const name = path.basename(filePath, '.vue')
                
                mbComponents[name] = parseComponentDefinition(content, filePath)
            }
        })
    }
    
    scanComponents(componentsDir)
    return mbComponents
}

// 解析组件文件内容
function parseComponentDefinition(content, filePath) {
    const { descriptor } = parse(content)
    const scriptContent = descriptor.script || descriptor.scriptSetup
    if (!scriptContent) return { description: '', props: {}, events: {} }

    const scriptStr = scriptContent.content
    const component = {
        description: '',
        props: {},
        events: {}
    }

    // 提取组件描述 - 优先提取中文注释
    const descMatches = [
        // 多行注释中的中文
        scriptStr.match(/\/\*\*?\s*(Magic-Boot[^*]*[\u4e00-\u9fa5][^*]*?)\s*\*\/\s*(?=import|const|let|var|function)/m),
        scriptStr.match(/\/\*\*?\s*([^*]*[\u4e00-\u9fa5][^*]*?组件[^*]*?)\s*\*\/\s*(?=import|const|let|var|function)/m),
        // 单行注释中的中文
        scriptStr.match(/\/\/\s*(Magic-Boot[^\n]*[\u4e00-\u9fa5][^\n]*)\s*(?=import|const|let|var|function)/m),
        scriptStr.match(/\/\/\s*([^\n]*[\u4e00-\u9fa5][^\n]*组件[^\n]*)\s*(?=import|const|let|var|function)/m),
        // 其他多行注释
        scriptStr.match(/\/\*\*?\s*([^*]*?)\s*\*\/\s*(?=import|const|let|var|function)/m),
        // 其他单行注释
        scriptStr.match(/\/\/\s*([^\n]*)\s*(?=import|const|let|var|function)/m)
    ].filter(Boolean)

    if (descMatches.length > 0) {
        component.description = descMatches[0][1]
            .replace(/\/\*\*?|\*\/|\/\//g, '')
            .replace(/@.*$/, '')
            .replace(/^Magic-Boot\s*/, '') // 移除 Magic-Boot 前缀
            .trim()
    }

    // 解析 defineProps
    const propsMatches = [
        // defineProps 对象形式
        scriptStr.match(/defineProps\s*\(\s*({[\s\S]*?})\s*\)/),
        // defineProps 接口形式
        scriptStr.match(/defineProps<{([^}]*)}>/),
        // props 选项
        scriptStr.match(/props\s*:\s*({[^}]*})/)
    ].filter(Boolean)

    if (propsMatches.length > 0) {
        try {
            const propsContent = propsMatches[0][1]
            const propMatches = [...propsContent.matchAll(/(\w+)\s*:\s*(?:{([^}]*)}|([^,}\s]+))/g)]
            propMatches.forEach(([, prop, objContent, simpleType]) => {
                // 查找属性相关的注释
                const commentMatches = [
                    // 属性上方的中文多行注释
                    scriptStr.match(new RegExp(`\\/\\*\\*?\\s*([^*]*[\u4e00-\u9fa5][^*]*)\\s*\\*\\/\\s*${prop}\\s*:`)),
                    // 属性上方的中文单行注释
                    scriptStr.match(new RegExp(`\\/\\/\\s*([^\n]*[\u4e00-\u9fa5][^\n]*)\\s*\\n\\s*${prop}\\s*:`)),
                    // 其他注释
                    scriptStr.match(new RegExp(`\\/\\*\\*?[\\s\\S]*?\\*\\/\\s*${prop}\\s*:`)),
                    scriptStr.match(new RegExp(`\\/\\/[^\\n]*\\s*${prop}\\s*:`))
                ].filter(Boolean)

                let type
                let defaultValue
                if (objContent) {
                    // 对象形式,提取 type 字段
                    const typeMatch = objContent.match(/type\s*:\s*(\[[^\]]*\]|[^,\s\n]+)/m)
                    if (typeMatch) {
                        let typeValue = typeMatch[1].trim()
                        if (typeValue.startsWith('[') && typeValue.endsWith(']')) {
                            // 处理数组形式的类型
                            type = typeValue.slice(1, -1)  // 移除 [ ]
                                .split(',')
                                .map(t => t.trim().replace(/['"]/g, ''))  // 移除引号和空格
                                .filter(Boolean)  // 过滤空值
                                .join('|')
                        } else {
                            // 处理单个类型
                            type = typeValue.replace(/['"]/g, '').trim()
                        }
                    }
                    
                    // 提取默认值
                    const defaultMatch = objContent.match(/default\s*:\s*([^,}]+)/m)
                    if (defaultMatch) {
                        let value = defaultMatch[1].trim()
                        // 处理函数返回值
                        if (value.includes('function') || value.includes('=>')) {
                            value = '() => {}'
                        }
                        // 处理数组和对象
                        if (value === '[]' || value.includes('[]')) {
                            value = '[]'
                        } else if (value === '{}' || value.includes('{}') || value.includes('() => ({})')) {
                            value = '{}'
                        } else if (value.startsWith("'") || value.startsWith('"')) {
                            // 处理字符串
                            value = value.replace(/^['"]|['"]$/g, '')
                        } else if (value === 'true' || value === 'false') {
                            // 处理布尔值
                            value = value === 'true'
                        } else if (!isNaN(value)) {
                            // 处理数字
                            value = Number(value)
                        }
                        defaultValue = value
                    }
                } else {
                    // 简单类型形式
                    type = simpleType
                }

                component.props[prop] = {
                    type: type,
                    default: defaultValue,
                    description: commentMatches.length > 0
                        ? (commentMatches[0][1] || commentMatches[0][0])
                            .replace(/\/\*\*?|\*\/|\/\//g, '')
                            .replace(/@.*$/, '')
                            .trim()
                        : `${prop} 属性`
                }
            })
        } catch (error) {
            console.warn(`Error parsing props for ${filePath}:`, error)
        }
    }

    // 解析 defineEmits
    const emitsMatches = [
        // defineEmits 数组形式
        scriptStr.match(/defineEmits\s*\(\s*(\[[\s\S]*?\])\s*\)/),
        // defineEmits 类型形式
        scriptStr.match(/defineEmits<{([^}]*)}>/),
        // emits 选项
        scriptStr.match(/emits\s*:\s*(\[[\s\S]*?\])/),
        // emits 对象形式
        scriptStr.match(/emits\s*:\s*({[^}]*})/)
    ].filter(Boolean)
    
    if (emitsMatches.length > 0) {
        try {
            const emitsContent = emitsMatches[0][1]
            if (emitsContent.startsWith('[')) {
                // 数组形式
                const events = emitsContent.match(/['"`](.*?)['"`]/g) || []
                events.forEach(event => {
                    const eventName = event.replace(/['"`,\s]/g, '')
                    // 查找事件相关的注释
                    const commentMatches = [
                        // 事件上方的中文多行注释
                        scriptStr.match(new RegExp(`\\/\\*\\*?\\s*([^*]*[\u4e00-\u9fa5][^*]*)\\s*\\*\\/\\s*['"\`]${eventName}['"\`]`)),
                        // 事件上方的中文单行注释
                        scriptStr.match(new RegExp(`\\/\\/\\s*([^\n]*[\u4e00-\u9fa5][^\n]*)\\s*\\n\\s*['"\`]${eventName}['"\`]`)),
                        // 其他注释
                        scriptStr.match(new RegExp(`\\/\\*\\*?[\\s\\S]*?\\*\\/\\s*['"\`]${eventName}['"\`]`)),
                        scriptStr.match(new RegExp(`\\/\\/[^\\n]*\\s*['"\`]${eventName}['"\`]`))
                    ].filter(Boolean)
                    
                    component.events[eventName] = {
                        description: commentMatches.length > 0
                            ? (commentMatches[0][1] || commentMatches[0][0])
                                .replace(/\/\*\*?|\*\/|\/\//g, '')
                                .replace(/@.*$/, '')
                                .trim()
                            : `${eventName} 事件`
                    }
                })
            } else if (emitsContent.startsWith('{')) {
                // 对象形式
                const eventMatches = [...emitsContent.matchAll(/['"`](.*?)['"`]\s*:/g)]
                eventMatches.forEach(([, eventName]) => {
                    // 查找事件相关的注释
                    const commentMatches = [
                        scriptStr.match(new RegExp(`\\/\\*\\*?\\s*([^*]*[\u4e00-\u9fa5][^*]*)\\s*\\*\\/\\s*['"\`]${eventName}['"\`]`)),
                        scriptStr.match(new RegExp(`\\/\\/\\s*([^\n]*[\u4e00-\u9fa5][^\n]*)\\s*\\n\\s*['"\`]${eventName}['"\`]`))
                    ].filter(Boolean)

                    component.events[eventName] = {
                        description: commentMatches.length > 0
                            ? (commentMatches[0][1] || commentMatches[0][0])
                                .replace(/\/\*\*?|\*\/|\/\//g, '')
                                .replace(/@.*$/, '')
                                .trim()
                            : `${eventName} 事件`
                    }
                })
            }
        } catch (error) {
            console.warn(`Error parsing emits for ${filePath}:`, error)
        }
    }

    return component
}

// 生成定义文件
const components = {
    naive: generateNaiveComponents(),
    mb: generateMBComponents()
}

fs.writeFileSync(
    path.resolve(__dirname, '../src/scripts/monaco/components-definition.json'),
    JSON.stringify(components, null, 2)
)

console.log('>>>>>>>>>>>>>>>>>>>> Monaco组件定义提示生成成功 <<<<<<<<<<<<<<<<<<<<')