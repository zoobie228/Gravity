import { event } from 'd3-selection'

export function registerD3Events(events = {}, acceptor) {
    Object.keys(events).forEach(i => {
        let evtName = i.replace('on', '').toLowerCase()
        let handler = events[i]

        acceptor.on(evtName, function (d, i) {
            handler(event, d, i)
        })
    })
}

export function bindEvents(events = {}) {
    let _events = {}

    Object.keys(events).forEach(evtName => {
        let handler = events[evtName]
        let args = Array.prototype.slice.call(arguments, 1)

        _events[evtName] = function (evt) {
            handler.call(this, evt, ...args)
        }
    })

    return _events
}
