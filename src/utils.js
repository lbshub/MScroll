const utils = (() => {
    let query = (selector) => {
        return typeof selector === 'string' ? document.querySelector(selector) : selector
    }

    let on = (el, type, fn) => {
        if (typeof type === 'string') {
            let capture = type.indexOf('touch') ? {
                passive: false, // 解决谷歌浏览器版本(>=56) preventDefault() 失效问题
                capture: false
            } : false
            return el.addEventListener(type, fn, capture)
        }
        for (let i = 0; i < type.length; i++) el.addEventListener(type[i], fn, false)
    }

    let off = (el, type, fn) => {
        if (typeof type === 'string') return el.removeEventListener(type, fn, false)
        for (let i = 0; i < type.length; i++) el.removeEventListener(type[i], fn, false)
    }

    let css = (el, prop) => {
        return window.getComputedStyle(el, null)[prop]
    }

    let width = (el) => {
        let bl = parseFloat(css(el, 'borderLeftWidth'))
        let pl = parseFloat(css(el, 'paddingLeft'))
        let w = parseFloat(css(el, 'width'))
        let pr = parseFloat(css(el, 'paddingRight'))
        let br = parseFloat(css(el, 'borderRightWidth'))
        return bl + pl + w + pr + br
    }

    let outterWidth = (el) => {
        let ml = parseFloat(css(el, 'marginLeft'))
        let w = width(el)
        let mr = parseFloat(css(el, 'marginRight'))
        return ml + w + mr

        // return parseFloat(css(el, 'marginLeft')) + el.offsetWidth + parseFloat(css(el, 'marginRight'))
    }

    let height = (el) => {
        let bt = parseFloat(css(el, 'borderTopWidth'))
        let pt = parseFloat(css(el, 'paddingTop'))
        let h = parseFloat(css(el, 'height'))
        let pb = parseFloat(css(el, 'paddingBottom'))
        let bb = parseFloat(css(el, 'borderBottomWidth'))
        return bt + pt + h + pb + bb
    }

    let outterHeight = (el) => {
        let mt = parseFloat(css(el, 'marginTop'))
        let h = height(el)
        let mb = parseFloat(css(el, 'marginBottom'))
        return mt + h + mb

        // return parseFloat(css(el, 'marginTop')) + el.offsetHeight + parseFloat(css(el, 'marginBottom'))
    }

    let getDirection = (x, y) => {
        if (x > y && x > 5) {
            return 'horizontal'
        }
        if (y > x && y > 5) {
            return 'vertical'
        }
        return ''
    }

    let range = (num, min, max) => {
        return Math.min(Math.max(num, min), max)
    }

    let prefix = (prop) => {
        const style = document.createElement('div').style
        if (prop in style) return prop
        return ('webkit-' + prop).replace(/-\D/g, match => match.charAt(1).toUpperCase())
    }

    let _watch = (target, prop, callback) => {
        Object.defineProperty(target, prop, {
            get() {
                return this['__' + prop]
            },
            set(value) {
                if (value !== this['__' + prop]) {
                    this['__' + prop] = value
                    callback()
                }
            }
        })
    }

    let observe = (target, props, callback) => {
        for (let i = 0; i < props.length; i++) {
            _watch(target, props[i], callback)
        }
    }

    return {
        on,
        off,
        css,
        query,
        range,
        prefix,
        observe,
        width,
        height,
        outterWidth,
        outterHeight,
        getDirection
    }
})()

export default utils