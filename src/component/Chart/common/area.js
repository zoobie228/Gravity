import React from 'react'
import PropTypes from 'prop-types'
import { area } from 'd3-shape'
import { groups, toStacked } from './util'
import isFunction from 'lodash/isFunction'

export class Area extends React.Component {

    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.shape({
            x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            y0: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            y1: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })),
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        styles: PropTypes.object
    }

    render() {
        let {
            xScale,
            yScale,
            data,
            index = 0,
            xBandwidth,
            xOffset = xBandwidth => xBandwidth / 2,
            styles: { color } } = this.props
        let _xOffset = isFunction(xOffset) ? xOffset(xBandwidth) : xOffset
        let id = `area-${Date.now()}-${index}`
        let _area = area()
            .x(i => xScale(i.name) + _xOffset)
            .y0(i => yScale(i.y0))
            .y1(i => yScale(i.y1))

        return (
            <React.Fragment>
                <linearGradient id={id} x1='0%' y1='0%' x2='0%' y2='100%'>
                    <stop offset="0%" stopColor={color} stopOpacity=".5" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
                <path
                    className='area'
                    d={_area(data)}
                    fill={`url(#${id})`}
                />
            </React.Fragment>
        )
    }
}

export class GroupArea extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            group: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })),
        styles: PropTypes.object
    }

    render() {
        let { data, clickedIndex, selectedIndices = clickedIndex, hoverIndex, styles: { colors }, ...restProps } = this.props

        return groups(data).map((items, index) => {
            let light = selectedIndices[index]
            let hover = hoverIndex === index
            if (!hover && !light) return null
            return (
                <Area
                    key={Date.now() + index}
                    data={toStacked(items)}
                    index={index}
                    styles={{ color: colors[index % colors.length] }}
                    {...restProps}
                />
            )
        })
    }
}
