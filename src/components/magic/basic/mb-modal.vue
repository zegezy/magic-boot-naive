// 在关闭模态框时添加动画类
function close() {
  const shade = document.querySelector('.layui-layer-shade')
  const modal = document.querySelector('.layui-layer')
  
  if (shade && modal) {
    shade.classList.add('layui-layer-shade-out')
    modal.classList.add('layui-layer-out')
    
    // 等待动画完成后再关闭
    setTimeout(() => {
      shade.classList.remove('layui-layer-shade-out')
      modal.classList.remove('layui-layer-out')
      // 原有的关闭逻辑
    }, 300)
  }
} 