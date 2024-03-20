import * as SFCCompiler from '@vue/compiler-sfc'
import {babelParse} from "@vue/compiler-sfc";

const COMP_IDENTIFIER = `__sfc__`

export function compileCode(sourceCode){
    let compiled = {}
    compileFile(sourceCode, compiled)
    if(compiled.errors.length){
        throw compiled.errors[0]
    }else{
        let jsCode = compiled.js
        let ast = babelParse(jsCode, {
            sourceType: 'module'
        })
        let replaceCode = (node, subCode) => jsCode.substring(0, node.start) + subCode + jsCode.substring(node.end);
        for(let i = ast.program.body.length - 1; i>=0; i--){
            let node = ast.program.body[i]
            if(node.type === 'ImportDeclaration'){
                jsCode = replaceCode(node, node.specifiers.map(it => `const ${it.local?.name || it.imported?.name || '*'} = ___magic__import__('${node.source.value}', '${it.imported?.name || '*'}');`).join('\r\n'));
            } else if (node.type === 'ExportDefaultDeclaration'){
                jsCode = replaceCode(node, `return ${node.declaration.name}`)
            }
        }
        return {
            compileCss: compiled.css,
            compileJs: jsCode
        }
    }
}

export function compileFile(code, compiled) {

    const filename = 'mb-sfc-compiler.vue'

    const id = hashId(filename)
    const { errors, descriptor } = SFCCompiler.parse(code, {
        filename,
        sourceMap: true
    })

    if (errors.length) {
        compiled.errors = errors
        return
    }

    if (
        (descriptor.script && descriptor.script.lang) ||
        (descriptor.scriptSetup && descriptor.scriptSetup.lang) ||
        (descriptor.template && descriptor.template.lang)
    ) {
        compiled.errors = [
            'lang="x" pre-processors are not supported in the in-browser playground.'
        ]
        return
    }

    const hasScoped = descriptor.styles.some((s) => s.scoped)
    let clientCode = ''

    const appendSharedCode = (code) => {
        clientCode += code
    }

    const clientScriptResult = doCompileScript(descriptor, id, compiled)
    if (!clientScriptResult) {
        return
    }
    const [clientScript, bindings] = clientScriptResult
    clientCode += clientScript

    // template
    // only need dedicated compilation if not using <script setup>
    if (descriptor.template && !descriptor.scriptSetup) {
        const clientTemplateResult = doCompileTemplate(
            descriptor,
            id,
            bindings,
            compiled
        )
        if (!clientTemplateResult) {
            return
        }
        clientCode += clientTemplateResult

    }

    if (hasScoped) {
        appendSharedCode(
            `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`
        )
    }

    if (clientCode) {
        appendSharedCode(
            `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}` +
            `\nexport default ${COMP_IDENTIFIER}`
        )
        compiled.js = clientCode.trimStart()
    }

    // styles
    let css = ''
    for (const style of descriptor.styles) {
        if (style.module) {
            compiled.errors = [`<style module> is not supported in the playground.`]
            return
        }

        const styleResult = SFCCompiler.compileStyle({
            source: style.content,
            filename,
            id,
            scoped: style.scoped,
            modules: !!style.module
        })
        if (styleResult.errors.length) {
            // postcss uses pathToFileURL which isn't polyfilled in the browser
            // ignore these errors for now
            if (!styleResult.errors[0].message.includes('pathToFileURL')) {
                compiled.errors = styleResult.errors
            }
            // proceed even if css compile errors
        } else {
            css += styleResult.code + '\n'
        }
    }
    if (css) {
        compiled.css = css.trim()
    } else {
        compiled.css = '/* No <style> tags present */'
    }

    // clear errors
    compiled.errors = []
}

function doCompileScript(descriptor, id, compiled) {
    if (descriptor.script || descriptor.scriptSetup) {
        try {
            const compiledScript = SFCCompiler.compileScript(descriptor, {
                id,
                refSugar: true,
                inlineTemplate: true
            })
            let code = ''
            if (compiledScript.bindings) {
                code += `\n/* Analyzed bindings: ${JSON.stringify(
                    compiledScript.bindings,
                    null,
                    2
                )} */`
            }
            code +=
                `\n` +
                SFCCompiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER)
            // console.log( SFCCompiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER))
            return [code, compiledScript.bindings]
        } catch (e) {
            compiled.errors = [e]
            return
        }
    } else {
        return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
    }
}

function doCompileTemplate(descriptor, id, bindingMetadata, compiled) {
    const templateResult = SFCCompiler.compileTemplate({
        source: descriptor.template && descriptor.template.content,
        filename: descriptor.filename,
        id,
        scoped: descriptor.styles.some(s => s.scoped),
        slotted: descriptor.slotted,
        isProd: false,
        compilerOptions: {
            bindingMetadata
        }
    })
    if (templateResult.errors.length) {
        compiled.errors = templateResult.errors
        return
    }

    const fnName = `render`

    return (
        `\n${templateResult.code.replace(
            /\nexport (function|const) (render|ssrRender)/,
            `$1 ${fnName}`
        )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`
    )
}

function hashId(filename) {
    return btoa(filename).slice(0, 8)
}
