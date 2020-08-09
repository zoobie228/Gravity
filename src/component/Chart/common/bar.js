import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'
import { groups, inject } from './util'
import { bindEvents } from './events'
import { dataVizColorPalette as colorPalette, UN_SELECTED } from './color-palette'

export class Bar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        getEvents: PropTypes.func,
        maxBarWidth: PropTypes.func,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        height: PropTypes.number,
        hoverIndex: PropTypes.number,
        light: PropTypes.bool,
        innerMargin: PropTypes.number,
        width: PropTypes.number,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        styles: PropTypes.shape({
            width: PropTypes.number,
            fill: PropTypes.string
        }),
        pivot: PropTypes.bool,
        xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        yOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number])
    }

    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: null
        }
    }

    onMouseOver = (i) => {
        return evt => {
            this.setState({
                hoverIndex: i
            })
        }
    }

    onMouseLeave = () => {
        this.setState({
            hoverIndex: null
        })
    }

    render() {
        let { hoverIndex } = this.state
        let {
            data,
            events: _events,
            hover: _hover,
            light = true,
            xScale,
            yScale,
            width,
            height,
            xBandwidth,
            yBandwidth,
            xOffset = (xBandwidth, barWidth) => (xBandwidth - barWidth) / 2,
            yOffset = 0,
            styles = {},
            pivot,
            innerMargin = 0,
            maxBarWidth = bandwidth => bandwidth,
            getEvents = (item, index) => bindEvents(_events, item, index)
        } = this.props
        let {
            fill,
            width: barWidth = 20,
            color = fill || colorPalette[4]
        } = styles

        let _bandwidth = pivot ? yBandwidth : xBandwidth
        let _barWidth = Math.min(barWidth, maxBarWidth(_bandwidth))

        let _xOffset = isFunction(xOffset) ? xOffset(xBandwidth, _barWidth) : xOffset
        let _yOffset = isFunction(yOffset) ? yOffset(yBandwidth, _barWidth) : yOffset

        let getX = item => pivot ? 0 : xScale(item.name) + _xOffset + innerMargin
        let getY = item => pivot ? yScale(item.name) + _yOffset + innerMargin : yScale(item.value) + _yOffset
        let getHeight = item => pivot ? _barWidth - innerMargin : height - yScale(item.value)
        let getWidth = item => pivot ? xScale(item.value) : _barWidth - innerMargin
        let getKey = item => `${item.name}-${item.value}-${item.order || ''}`

        return data.map((item, i) => {
            let width = getWidth(item)
            let height = getHeight(item)
            let events = getEvents(item, i)
            let hover = _hover || hoverIndex == i
            
            events = inject(events,
                ['onMouseOver', 'onMouseLeave'],
                [this.onMouseOver(i), this.onMouseLeave]
            )

            return (
                <React.Fragment key={getKey(item)}>
                    <rect
                        className='bar-hover'
                        x={pivot?getX(item)+4:getX(item)}
                        y={getY(item)}
                        height={pivot?height:height-4}
                        width={pivot?width-4:width}
                        fill={'none'}
                        strokeWidth={8}
                        stroke={color}
                        strokeOpacity={hover ? 0.25 : 0}
                    />
                    <rect
                        className='bar'
                        x={getX(item)}
                        y={getY(item)}
                        height={height}
                        width={width}
                        fill={hover || light ? color : UN_SELECTED}
                        strokeWidth={0}
                        {...events}
                    />
                </React.Fragment>
            )
        })
    }
}

export class GroupBar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        innerMargin: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        hoverIndex: PropTypes.array,
        pivot: PropTypes.bool,
        styles: PropTypes.object,
        selectedIndices: PropTypes.array
    }

    static defaultProps = {
        innerMargin: 2
    }

    render() {
        let { data,
            styles,
            hoverIndex,
            selectedIndices,
            pivot,
            events: _events,
            innerMargin,
            ...restProps } = this.props
        let g = groups(data, 'name'/**groupby */, items => items.sort(byOder))
        return g.map((items, groupIndex) => {
            let maxBarWidth = bandwidth => bandwidth / items.length
            let getOffset = index => (bandwidth, barWidth) => (bandwidth - barWidth * items.length) / 2 + index * barWidth
            let getBarStyles = index => ({ width: styles.width, color: styles.colors[index] })
            let getKey = item => `${item.name}-${item.value}-${item.order}`

            return items.map((item, index) => {
                let getEvents = item => bindEvents(_events, item, index, groupIndex)
                let hover = hoverIndex? hoverIndex.some(i => i === item.order) : false
                let light = selectedIndices[item.order]

                return (
                    <Bar
                        key={getKey(item)}
                        index={groupIndex}
                        data={[item]}
                        hover={hover}
                        light={light}
                        innerMargin={innerMargin}
                        maxBarWidth={maxBarWidth}
                        xOffset={pivot ? 0 : getOffset(index)}
                        yOffset={pivot ? getOffset(index) : 0}
                        styles={getBarStyles(index)}
                        pivot={pivot}
                        getEvents={getEvents}
                        {...restProps}
                    />
                )
            })
        })
    }
}

function byOder(a, b) {
    return a.order - b.order
}