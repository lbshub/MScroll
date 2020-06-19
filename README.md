# MScroll

模拟滚动(条)，支持水平、垂直方向选择，滚动条显示，图片懒加载，鼠标拖动、滚动，选择器模式。

## 安装
```
npm install @eyeear/mscroll --save

```

## 使用
```
import MScroll from 'mscroll'

```

```
  <div class="wrapper">
      <div class="scroller">
          <div class="item">...</div>
          <div class="item"><img src="placeholder.png" data-src="1.jpg" /></div>
          ...
      </div>
  </div>
```

```
  // 水平方向 不显示滚动条
  new MScroll('.wrapper')

  // 垂直方向 显示滚动条
  new MScroll('.wrapper', {
    vertical: true,
    showScrollbar: true
  })

  // 图片懒加载
  new MScroll('.wrapper', {
    lazyload: true
  })

  // 鼠标拖动、滚动
  new MScroll('.wrapper', {
    mouse: true,
    wheel: true
  })

  // 选择器模式 垂直方向
  new MScroll('.wrapper', {
    vertical: true,
    picker: true
  })

  // 到底加载更多 垂直方向
  new MScroll('.wrapper', {
    vertical: true,
    scrollEnd: (offset, maxOffset) => {
      if (offset == maxOffset) {
        // 加载更多
        // ...
      }
    }
  })
  // 或者
  const scroll = new MScroll('.wrapper', {
    vertical: true
  })
  scroll.$on('scrollEnd', (offset, maxOffset) => {
    if (offset == maxOffset) {
      // 加载更多
      // ...
    }
  })

  ...
  
```

## 选项
```
  new MScroll(el, options)

  el 
    - 必须设置 外围包裹元素 一个css选择器或者元素对象
  
  options
    -选项属性
    - vertical 是否垂直方向 默认false 
    - showScrollbar 是否显示滚动条 默认false
      - scrollbarColor 滚动条颜色 默认 '#000' 
      - scrollbarSize 滚动条大小 默认 3 (px) 
      - scrollbarOpacity 滚动条透明度 默认 0.5 (0 - 1) 
    - lazyload 是否图片懒加载 默认false
      - attribute 放置图片地址的特性 默认 data-src  
    - mouse 是否使用鼠标拖动 默认false 
    - wheel 是否使用鼠标滚动 默认false
      -wheelStep 滚动动画步长 40 (px)
      -wheelTime 滚动动画持续时间 默认 400 (ms)
    - picker 是否使用选择器模式 默认false 
      - index 默认选择第几项 默认0第一项
    - scrollTime 手指、鼠标触发滚动动画的持续时间 默认 600 (ms)
    - rollTime 手指、鼠标触发复位动画的持续时间 默认 300 (ms)
    
    -选项方法
    - setup 第一次设置完成、浏览器resize 执行回调
    - scrollStart 滚动开始执行回调
    - scrollMove 滚动中执行回调
    - scrollEnd 滚动结束执行回调

```