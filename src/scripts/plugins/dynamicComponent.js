
function appComponent(app, item){
    item.compileJs = `(function(){
        ${item.compileJs}
    })()`
    let componentStyle = document.createElement("style");
    componentStyle.innerHTML = item.compileCss
    document.head.appendChild(componentStyle);
    app.component(item.name, eval(item.compileJs))
}

export async function setupDynamicComponent(app) {
    await $common.post('/system/component/list').then((res) => {
        res.data.forEach(it => {
            appComponent(app, it)
        })
    })
}
