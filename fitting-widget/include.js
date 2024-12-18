(function () {
    function add(type, value) {
        let element
        if (type === 'script') {
            element = document.createElement('script')
            element.type = 'module'
            element.crossorigin = true
            element.src = value
        }
        if (type === 'style') {
            element = document.createElement('link')
            element.rel = 'stylesheet'
            element.href = value
        }
        document.body.appendChild(element)
    }
    add('script', 'fitting-widget/assets/index-c9626f7e.js')
    add('style', 'fitting-widget/assets/index-512a4fdf.css')
})()