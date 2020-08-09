import React from 'react'
import PropTypes from 'prop-types'
import { line } from 'd3-shape'
import isFunction from 'lodash/isFunction'
import { groups } from './util'
import { bindEvents } from './events'
import { dataVizColorPalette as colorPalette } from './color-palette'

const defaultColors = [colorPalette[4], colorPalette[7], colorPalette[1], colorPalette[10]]

export class Line extends React.Component {
    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.number
        })),
        areas: PropTypes.bool,
        events: PropTypes.object,
        xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        styles: PropTypes.object
    }

    render() {
        let {
            xScale,
            yScale,
            data,
            hover,
            opacity,
            xBandwidth,
            index = 0,
            styles = {},
            xOffset = xBandwidth => xBandwidth / 2,
            events,
            ...restProps
        } = this.props
        let {
            color,
            strokeWidth = 2,
            fill = 'none',
            strokeLinecap = 'round'
        } = styles
        let _xOffset = isFunction(xOffset) ? xOffset(xBandwidth) : xOffset
        let _line = line()
            .x(i => xScale(i.name) + _xOffset)
            .y(i => yScale(i.value))
        let d = _line(data)
        
        return (
            <React.Fragment>
                <path
                    className='line'
                    d={d}
                    fill={fill}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeLinecap={strokeLinecap}
                    strokeLinejoin={strokeLinecap}
                    pointerEvents="none"
                    opacity={opacity}
                />
                <path
                    className='line-hover'
                    d={d}
                    fill={fill}
                    stroke={hover ? color : 'transparent'}
                    strokeWidth={strokeWidth + 4}
                    strokeLinecap={strokeLinecap}
                    strokeLinejoin={strokeLinecap}
                    opacity={.25}
                    {...events}
                />
            </React.Fragment>
        )
    }
}

export class GroupLine extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            group: PropTypes.string
        })),
        events: PropTypes.object,
        hoverIndex: PropTypes.number,
        clickedIndex: PropTypes.array,
        styles: PropTypes.object
    }

    render() {
        let { data,
            events:_events,
            hoverIndex,
            clickedIndex,
            selectedIndices = clickedIndex,
            styles = {},
            ...restProps
        } = this.props
        let { colors = defaultColors,
            strokeWidth
        } = styles

        return groups(data).map((items, i) => {
            let events = bindEvents(_events, data, i)
            let hover= hoverIndex===i
            let light = selectedIndices[i]
            let fill= colors[i % colors.length]
            return (
                <Line
                    key={i}
                    index={i}
                    data={items}
                    styles={{ color: hover||light?fill:'grey', strokeWidth }}
                    events={events}
                    opacity={hover||light?1:0.2}
                    hover={hover}
                    {...restProps}
                />
            )
        })
    }
}