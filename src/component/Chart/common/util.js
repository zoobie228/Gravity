import React from 'react'
import cloneDeep from 'lodash/cloneDeep'
import uniq from 'lodash/uniq'
import sum from 'lodash/sum'

export function assignStyle(original, obj = {}) {

    if (Array.isArray(original) && Array.isArray(obj)) return obj

    let result = cloneDeep(original)

    for (let key in obj) {
        let prop = result[key]
        result[key] = typeof prop === 'object' && typeof obj === 'object' ? assignStyle(prop, obj[key]) : obj[key]
    }

    return result
}

export function getXDomain(data, property = 'name') {
    return distinct(data, property)
}

export function getYDomain(data, property = 'value', groupBy) {
    if (groupBy) {
        let values = groups(data, groupBy).map(g => sum(
            g.map(i => i[property])
        ))
        return autoRange(values)
    } else {
        return autoRange(distinct(data, property))
    }
}

/**
 * 
 * input
 * [
 *  {name:'a', group: 's1'},
 *  {name:'b', group: 's1'},
 *  {name:'a', group: 's2'},
 *  {name:'b', group: 's2'}
 * ]
 * output - 
 * [
 *  [
 *      {name:'a', group: 's1'},
 *      {name:'b', group: 's1'},
 *  ],
 *  [
 *      {name:'a', group: 's2'},
 *      {name:'b', group: 's2'},
 *  ]
 * ]
 */
export function groups(array = [], groupBy = 'group', fn) {
    let distinctValues = distinct(array, groupBy)
    return distinctValues.map(v => {
        let group = array.filter(i => i[groupBy] == v)
        return fn ? fn(group) : group
    })
}

export function isScaleLinear(scale) {
    return scale.ticks ? true : false
}

/**
 * 
 * input
 * [
 *  {name:'a', value:1},
 *  {name:'a', value:2},
 *  {name:'a', value:3}
 * ]
 * output - stacked
 * [
 *  {name:'a', value:1, y0: 0, y1: 1},
 *  {name:'a', value:2, y0: 1, y1: 3},
 *  {name:'a', value:3, y0: 3, y1: 6}
 * ]
 */
export function toStacked(array, property = 'name') {
    let stacked = array.map(i => Object.assign({}, i))
    let map = {}
    array.forEach((item, i) => {
        let key = item[property]
        stacked[i].y0 = map[key] ? map[key] : 0 // 1st
        map[key] = map[key] ? map[key] + item.value : item.value // 2nd
        stacked[i].y1 = map[key] // 3rd
    })
    return stacked
}

export function distinct(array, property) {
    return uniq(array.map(d => d[property]))
}

export function autoRange(numbers) {
    let max = Math.max.apply(null, numbers)
    max = Math.ceil(max * 1.2)
    return [0, max]
}

export function niceNumberArray(arr = []) {
    let hasInvalidItem = arr.some(i => (typeof i !== 'number'))
    if (hasInvalidItem) { return arr }

    let len = 0, maxLen = 2
    //get the len of digital part
    arr.forEach(i => {
        let str = i.toString()
        let _len = str.indexOf('.') > 0 ? str.split('.')[1].length : 0
        len = Math.max(len, _len)
    })

    let niced = arr.map(i => i.toFixed(len > maxLen ? maxLen : len))

    return niced
}

export function delay(on, func) {
    if (!delay.queue) delay.queue = {}
    if (!delay.queue[on]) delay.queue[on] = []

    delay.queue[on].push(func)

    setTimeout(function () {
        let task = delay.queue[on].shift()
        //only execute the last task
        if (delay.queue[on].length === 0) {
            task()
        }
    }, 200)
}

export function isNumberOrNumberString(value) {
    switch (value) {
        case '': return false;
        case null: return false;
        case undefined: return false;
        default: return isFinite(value)
    }
}

export function inject(object, objectFuncName, func) {
    let objectFuncNames = [].concat(objectFuncName)
    let funcs = [].concat(func)
    let newObject = Object.assign({}, object)

    if (objectFuncNames.length !== funcs.length) { throw 'length of objectFuncName and func should be same - inject' }

    for (let i = 0; i < objectFuncNames.length; i++) {
        let n = objectFuncNames[i]
        let f = funcs[i]
        let originalFunc = newObject[n]
        Object.assign(newObject, {
            [n]: function () {
                f(...arguments)
                if (typeof originalFunc === 'function') { originalFunc(...arguments) }
            }
        })
    }

    return newObject
}

export function animationFrame(f) {
    const isIE = /*@cc_on!@*/false || !!document.documentMode
    if (isIE) {
        setTimeout(f, 1000 / 60)
    }
    else {
        window.requestAnimationFrame(f)
    }
}

export function updateSelectedIndices(selectedIndices, index) {
    let result
    let unSelectedCount = selectedIndices.filter(d => d === false)
    let allSelected = unSelectedCount.length === 0
    let onlyMeIsSelected = unSelectedCount.length === selectedIndices.length - 1 && selectedIndices[index] === true

    if (onlyMeIsSelected || allSelected) {
        result = selectedIndices.map((d, i) => i == index ? d : !d)
    } else {
        result = selectedIndices.map((d, i) => i == index ? !d : d)
    }
    return result
}

export function getDOMEvents(events = {}) {
    let { onSelectedChange, ...rest } = events
    return rest
}

/**
 * create new instance when props is changed
 */
export function creatNewInstanceWhenPropsChange(Component, propName = 'data') {
    return class CreatNewInstanceWhenPropsChangeHOC extends React.Component {
        constructor(props) {
            super(props)
            this.state = {
                key: 0
            }
        }

        UNSAFE_componentWillReceiveProps(nextProps) {
            if(this.props[propName] !== nextProps[propName]) {
                this.setState(pre => ({key: pre.key + 1}))
            }
        }
        
        render() {
            return <Component {...this.props} key={this.state.key}/>
        }
        
    }
}
