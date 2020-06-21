/**
 * LBS MScroll
 * Date: 2018-9-12
 **/

import utils from './utils'
np
let _transition_ = utils.prefix('transition')
let _transform_ = utils.prefix('transform')

class MScroll {
    constructor(el, options = {}) {
        const opts = Object.assign({}, options)

        this.wrapper = utils.query(el)
        if (!this.wrapper) return
        this.scroller = this.wrapper.children[0]

        this.vertical = opts.vertical || false // 默认水平方向
        this.showScrollbar = opts.showScrollbar || false // 模拟滚动条
        this.scrollbarColor = opts.scrollbarColor || '#000' // 滚动条颜色
        this.scrollbarSize = opts.scrollbarSize || 3 // 滚动条大小
        this.scrollbarOpacity = opts.scrollbarOpacity || 0.5 // 滚动条透明度
        this.scrollTime = opts.scrollTime || 600
        this.rollTime = opts.rollTime || 300
        this.limitTime = opts.limitTime || 300
        this.mouse = opts.mouse || false // 鼠标拖动
        this.wheel = opts.wheel || false // 鼠标滚动
        this.wheelStep = opts.wheelStep || 40 // 步长
        this.wheelTime = opts.wheelTime || 400

        this.lazyload = opts.lazyload || false // 图片懒加载
        this.attribute = opts.attribute || 'data-src'

        this.picker = opts.picker || false // 选择器模式
        this.index = opts.index || 0

        this.setup = opts.setup || function() {}
        this.scrollStart = opts.scrollStart || function() {}
        this.scrollMove = opts.scrollMove || function() {}
        this.scrollEnd = opts.scrollEnd || function() {}

        this.$events = {}
        this._init()
    }

    _init() {
        this._initObserve()
        this._initScrollbar()
        this._initLazyLoad()
        this._initEvent()
        this.refresh()
        this.offset = 0
    }

    _setup() {
        this.wrapperSize = this.vertical ? this.wrapper.offsetHeight : this.wrapper.offsetWidth

        if (utils.css(this.wrapper, 'position') === 'static') {
            this.wrapper.style.position = 'relative'
        }

        if (utils.css(this.wrapper, 'overflow') !== 'hidden') {
            this.wrapper.style.overflow = 'hidden'
        }

        if (!this.vertical) {
            const totalSize = Math.ceil(Array.from(this.scroller.children).reduce((total, item) => total + utils.outterWidth(item), 0))
            this.scroller.style.width = totalSize + 'px'
            this.scrollerSize = totalSize
        } else {
            this.scrollerSize = this.scroller.offsetHeight
        }

        this.maxOffset = this.wrapperSize - this.scrollerSize

        if (this.maxOffset > 0) this.maxOffset = 0

        this.minOffset = 0

        if (this.picker) {
            this.count = this.scroller.children.length
            this.itemSize = this.scrollerSize / this.count
            this.diffCount = Math.floor(Math.ceil(this.wrapperSize / this.itemSize) / 2)
            this.diffOffset = this.diffCount * this.itemSize
            this.minOffset += this.diffOffset
            this.maxOffset -= this.diffOffset
            this.pickTo(this.index)
        }

        this.$emit('setup')
    }

    _start(e) {
        e.stopPropagation()
        this.startX = e.touches ? e.touches[0].pageX : e.pageX
        this.startY = e.touches ? e.touches[0].pageY : e.pageY
        this.startTime = Date.now()
        this.startOffset = this.offset
        this.moved = true
        this._resetTouch()
    }

    _move(e) {
        e.stopPropagation()
        if (this.vertical) e.preventDefault()
        if (!this.moved) return
        if (this.locked) return

        const moveX = e.touches ? e.touches[0].pageX : e.pageX
        const moveY = e.touches ? e.touches[0].pageY : e.pageY
        const deltaX = this.moveX === 0 ? 0 : moveX - this.moveX
        const deltaY = this.moveY === 0 ? 0 : moveY - this.moveY
        const moveTime = Date.now()

        // 鼠标在容器外阻止移动
        if (this.mouse) {
            const _x = e.touches ? e.touches.clientX : e.clientX
            const _y = e.touches ? e.touches.clientY : e.clientY
            const _rect = this.wrapper.getBoundingClientRect()
            if (_x < _rect.left || _x > _rect.right || _y < _rect.top || _y > _rect.bottom) return this._end(e)
        }

        let delta = this.vertical ? deltaY : deltaX

        this.moveOffset += delta

        this.moveX = moveX
        this.moveY = moveY

        if (moveTime - (this.endTime = this.endTime || 0) > this.limitTime && !this.moving && Math.abs(this.moveOffset) < 10) {
            return
        }

        if (this.direction == '') {
            this.direction = utils.getDirection(Math.abs(moveX - this.startX), Math.abs(moveY - this.startY))
        }

        if (!this.vertical) {
            if (this.direction === 'vertical') return
            if (this.direction === 'horizontal') e.preventDefault()
        }

        if (!this.moving) {
            this.moving = true
            this.$emit('scrollStart', this.offset)
        }

        if (this.offset > this.minOffset || this.offset < this.maxOffset) delta /= 4

        this.offset += delta // this._setTransform(this.offset + delta)

        if (moveTime - this.startTime > this.limitTime) {
            this.startTime = moveTime
            this.startOffset = this.offset
        }
    }

    _end(e) {
        e.stopPropagation()
        if (!this.moved) return

        this.moved = false

        if (!this.moving) {
            this.$emit('scrollCancel')
            return
        }

        if (!this._resetPosition()) {
            return
        }

        this.endTime = Date.now()

        const duration = this.endTime - this.startTime

        if (duration < this.limitTime && Math.abs(this.moveOffset) > 10) {
            const offset = this._momentum(this.offset - this.startOffset, duration)
            return this.scrollTo(offset, this.scrollTime)
        }

        if (this.picker) {
            return this.scrollTo(this._pickIndex(this.offset), this.rollTime)
        }

        this.$emit('scrollEnd', this.offset, this.maxOffset)
    }

    _resetTouch() {
        this.moveX = 0
        this.moveY = 0
        this.direction = ''
        this.moving = false
        this.moveOffset = 0
        this.duration = 0 // this._setTransition()
    }

    _resetPosition() {
        if (this.picker) return true

        if (this.offset > this.minOffset) {
            setTimeout(() => {
                this.scrollTo(this.minOffset, this.rollTime)
            }, 0)
            return false
        }

        if (this.offset < this.maxOffset) {
            setTimeout(() => {
                this.scrollTo(this.maxOffset, this.rollTime)
            }, 0)
            return false
        }

        return true
    }

    _resize() {
        const oldMaxOffset = this.maxOffset
        const oldOffset = this.offset
        this._resizeTimer && clearTimeout(this._resizeTimer)
        this._resizeTimer = setTimeout(() => {
            this.refresh()
            this.scrollTo(this.maxOffset * (oldOffset / oldMaxOffset), 0)
        }, 100)
    }

    _momentum(distance, duration) {
        let speed = Math.abs(distance / duration)
        let targetOffset = this.offset + speed / 0.003 * (distance < 0 ? -1 : 1)
        if (this.picker) {
            return this._pickIndex(targetOffset)
        }
        if (targetOffset < this.maxOffset) {
            targetOffset = this.maxOffset - this.wrapperSize / 20
        } else if (targetOffset > this.minOffset) {
            targetOffset = this.minOffset + this.wrapperSize / 20
        }
        return Math.round(targetOffset)
    }

    _scrollEnd() {
        if (!this._resetPosition()) {
            return
        }
        this.$emit('scrollEnd', this.offset, this.maxOffset)
    }

    _setTransition(duration = 0) {
        this.scroller.style[_transition_] = duration != 0 ? ('all ' + duration + 'ms') : ''
        this.$emit('scrollTime', duration)
    }

    _setTransform(offset) {
        this.scroller.style[_transform_] = this.vertical ? 'translate3d(0px, ' + offset + 'px, 0px)' : 'translate3d(' + offset + 'px, 0px, 0px)'
        this.$emit('scrollMove', offset)
    }

    _initEvent() {
        utils.on(this.wrapper, 'touchstart', this.start = this._start.bind(this))
        utils.on(this.wrapper, 'touchmove', this.move = this._move.bind(this))
        utils.on(this.wrapper, 'touchend', this.end = this._end.bind(this))
        utils.on(this.scroller, ['transitionend', 'webkitTransitionEnd'], this.transitionEnd = this._scrollEnd.bind(this))
        utils.on(window, 'resize', this.resize = this._resize.bind(this))
        this.wheel && utils.on(this.wrapper, ['wheel', 'mousewheel', 'DOMMouseScroll'], this.mousewheel = this._wheel.bind(this))
        if (this.mouse) {
            utils.on(this.wrapper, 'mousedown', this.start)
            utils.on(document, 'mousemove', this.move)
            utils.on(document, 'mouseup', this.end)
        }
        this.$on('setup', this.setup)
        this.$on('scrollStart', this.scrollStart)
        this.$on('scrollMove', this.scrollMove)
        this.$on('scrollEnd', this.scrollEnd)
    }

    _initObserve() {
        utils.observe(this, ['offset', 'duration'], () => {
            this._setTransition(this.duration)
            this._setTransform(this.offset)
        })
    }

    _initScrollbar() {
        if (!this.showScrollbar) return

        const scrollbar = document.createElement('div')
        const indicator = document.createElement('div')

        scrollbar.style.cssText = `position:absolute;z-index:1818;opacity:0;overflow:hidden;`
        indicator.style.cssText = `position:absolute;left:0;top:0;background:${this.scrollbarColor};opacity:${this.scrollbarOpacity};border-radius:${this.scrollbarSize}px;`

        if (this.vertical) {
            scrollbar.style.cssText += `top:0;bottom:0;right:3px;width:${this.scrollbarSize}px;`
            indicator.style.cssText += `width:${this.scrollbarSize}px;`
        } else {
            scrollbar.style.cssText += `left:0;right:0;bottom:2px;height:${this.scrollbarSize}px;`
            indicator.style.cssText += `height:${this.scrollbarSize}px;`
        }

        scrollbar.appendChild(indicator)
        this.wrapper.appendChild(scrollbar)

        let scale = 1
        let inTimer = null
        let outTimer = null

        let setup = () => {
            scale = this.wrapperSize / this.scrollerSize
            if (scale > 1) scale = 1
            indicator.style[this.vertical ? 'height' : 'width'] = this.wrapperSize * scale + 'px'
        }

        let hideBar = () => {
            clearTimeout(inTimer)
            outTimer = setTimeout(fadeOut, 900)
        }

        let showBar = () => {
            clearTimeout(outTimer)
            inTimer = setTimeout(fadeIn, 100)
        }

        let fadeIn = () => {
            scrollbar.style[_transition_] = 'all 200ms'
            scrollbar.style.opacity = 1
        }

        let fadeOut = () => {
            scrollbar.style[_transition_] = 'all 600ms'
            scrollbar.style.opacity = 0
        }

        let setTransition = (duration = 0) => {
            indicator.style[_transition_] = duration != 0 ? ('all ' + duration + 'ms') : ''
        }

        let setTransform = (offset) => {
            indicator.style[_transform_] = this.vertical ? 'translate3d(0px, ' + (-offset * scale) + 'px, 0px)' : 'translate3d(' + (-offset * scale) + 'px, 0px, 0px)'
        }

        this.$on('refresh', () => {
            setTimeout(setup, 100)
        })
        this.$on('scrollTime', duration => {
            setTransition(duration)
        })
        this.$on('scrollMove', offset => {
            setTransform(offset)
        })
        this.$on('scrollStart', () => {
            showBar()
        })
        this.$on('scrollEnd', () => {
            hideBar()
        })
    }

    _initLazyLoad() {
        if (!this.lazyload) return
        const wrapper = this.wrapper
        const items = this.scroller.children
        const count = items.length
        const loadImage = (item) => {
            if (!item) return
            if (item.__loaded) return
            const imgs = item.getElementsByTagName('img')
            const n = imgs.length
            if (!n) return
            item.__loaded = true
            for (let i = 0; i < n; i++) {
                let img = imgs[i]
                if (img.getAttribute(this.attribute)) {
                    img.classList.add('loaded')
                    img.setAttribute('src', img.getAttribute(this.attribute))
                    img.removeAttribute(this.attribute)
                }
            }
        }
        const lazyLoad = () => {
            for (let i = 0; i < count; i++) {
                let item = items[i]
                if (item.__loaded) continue
                const rect = item.getBoundingClientRect()
                const wrapperRect = wrapper.getBoundingClientRect()
                const visible = this.vertical ? (rect.top < wrapperRect.bottom && rect.bottom > wrapperRect.top) : (rect.left < wrapperRect.right && rect.right > wrapperRect.left)
                if (visible) {
                    loadImage(item)
                }
            }
        }
        this.$on('setup', () => {
            lazyLoad()
        })
        this.$on('scrollEnd', () => {
            lazyLoad()
        })
    }

    _wheel(e) {
        e.stopPropagation()
        e.preventDefault()

        let delta = 1
        let offset = this.offset

        if (e.deltaY) {
            delta = e.deltaY > 0 ? 1 : -1
        } else if (e.wheelDelta) {
            delta = -e.wheelDelta / 120
        } else if (e.detail) {
            delta = e.detail > 0 ? 1 : -1
        }
        offset += -delta * this.wheelStep
        offset = utils.range(offset, this.maxOffset, this.minOffset)
        if (offset == this.offset) return

        this.$emit('scrollStart')

        this.scrollTo(this.picker ? this._pickIndex(offset) : offset, this.wheelTime)

        this._wheelTimer && clearTimeout(this._wheelTimer)
        this._wheelTimer = setTimeout(() => {
            this.$emit('scrollEnd', this.offset, this.maxOffset)
        }, this.wheelTime)
    }

    _pickIndex(offset) {
        const targetOffset = utils.range(offset, this.maxOffset, this.minOffset)
        const targetIndex = Math.round(-targetOffset / this.itemSize)
        this.index = utils.range(targetIndex + this.diffCount, 0, this.count - 1)
        return -targetIndex * this.itemSize
    }

    pickTo(index, duration = 0) {
        const targetIndex = utils.range(index, 0, this.count - 1)
        const offset = -(targetIndex - this.diffCount) * this.itemSize
        const targetOffset = utils.range(offset, this.maxOffset, this.minOffset)
        this.index = targetIndex
        this.offset = targetOffset
        this.duration = duration
    }

    $emit(type) {
        if (!this.$events[type]) return
        let n = this.$events[type].length
        if (!n) return
        for (let i = 0; i < n; i++) {
            this.$events[type][i].apply(this, [].slice.call(arguments, 1))
        }
    }

    $on(type, fn) {
        if (!this.$events[type]) this.$events[type] = []
        this.$events[type].push(fn)
    }

    $off(type, fn) {
        if (!this.$events[type]) return
        let index = this.$events[type].indexOf(fn)
        if (index > -1) {
            this.$events[type].splice(index, 1)
        }
    }

    refresh() {
        this._setup()
        this.$emit('refresh')
    }

    scrollTo(offset, duration) {
        this.offset = offset
        this.duration = duration
    }

    moveTo(el, duration = 400, center = true) {
        const item = utils.query(el)
        if (!item) return
        let offset = this.vertical ? -item.offsetTop : -item.offsetLeft
        if (center) {
            let size = this.vertical ? item.offsetHeight : item.offsetWidth
            offset += (this.wrapperSize - size) / 2
        }
        offset = utils.range(offset, this.maxOffset, this.minOffset)

        if (offset == this.offset) return
        this.scrollTo(offset, duration)
    }

    destroy() {
        this.destroyed = true
        this.$emit('destroy')
        this.$events = {}
        utils.off(this.wrapper, 'touchstart', this.start)
        utils.off(this.wrapper, 'touchmove', this.move)
        utils.off(this.wrapper, 'touchend', this.end)
        utils.off(this.scroller, ['transitionend', 'webkitTransitionEnd'], this.transitionEnd)
        utils.off(window, 'resize', this.resize)
        this.wheel && utils.off(this.wrapper, ['wheel', 'mousewheel', 'DOMMouseScroll'], this.mousewheel)
        if (this.mouse) {
            utils.off(this.wrapper, 'mousedown', this.start)
            utils.off(document, 'mousemove', this.move)
            utils.off(document, 'mouseup', this.end)
        }
    }
}

export default MScroll