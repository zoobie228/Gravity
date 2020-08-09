import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'
import { groups, toStacked } from './util'
import { UN_SELECTED } from './color-palette'

export class StackedBar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        width: PropTypes.number,
        height: PropTypes.number,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        styles: PropTypes.shape({
            width: PropTypes.number,
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        stackDepth: PropTypes.number,
        pivot: PropTypes.bool
    }

    render() {
        let { data,
            events: _events,
            hoverIndex,
            gIndex,
            selectedIndices = [],
            xScale,
            yScale,
            height,
            xBandwidth,
            yBandwidth,
            styles,
            pivot = false,
            stackDepth } = this.props
        let { colors, width = 20, cap } = styles
        let xOffset = (xBandwidth - width) / 2
        let yOffset = (yBandwidth - width) / 2
        let stackedData = toStacked(data)
        let getEvents = (item, index, groupIndex) => bindEvents(_events, item, index, groupIndex)

        return groups(stackedData, 'name').map((items, groupIndex) => {
            return items.map((item, i) => {
                let rectWidth = pivot ? xScale(item.y1) - xScale(item.y0) : width
                let rectHeight = pivot ? width : yScale(item.y0) - yScale(item.y1)
                let last = items.length - 1


                let color = colors[(groupIndex * stackDepth + i) % colors.length]
                let events = getEvents(item, i, groupIndex)
                let light = selectedIndices[i + (stackDepth == 3 ? 3 * groupIndex : 0)]
                let hover = stackDepth == 3 ? hoverIndex === i && gIndex === groupIndex : hoverIndex === i

                return (
                    <React.Fragment key={`${groupIndex}-${i}`}>
                       
                        <rect
                            className='bar-hover'
                            x={pivot ? xScale(item.y0)+4+(i>0?cap.height:0) : xScale(item.name) + xOffset}
                            y={pivot ? yScale(item.name) + yOffset : yScale(item.y1)+4+(i<last?cap.height:0)}
                            width={pivot ? rectWidth-8-(i>0?cap.height:0) < 0 ?
                                            0.1 : rectWidth-8-(i>0?cap.height:0) : rectWidth}
                            height={pivot ? rectHeight : 
                                            rectHeight-8-(i<last?cap.height:0) < 0 ? 0.1:rectHeight-8-(i<last?cap.height:0)}
                            fill={'none'}
                            strokeWidth={8}
                            stroke={color}
                            strokeOpacity={hover ? 0.25 : 0}
                        />
                         <rect
                            className='bar'
                            x={pivot ? xScale(item.y0) : xScale(item.name) + xOffset}
                            y={pivot ? yScale(item.name) + yOffset : yScale(item.y1)}
                            width={rectWidth}
                            height={rectHeight}
                            fill={hover || light ? color : UN_SELECTED}
                            strokeWidth={0}
                            {...events}
                        />
                        {
                            i > 0 &&
                            <rect
                                className='seperator-line'
                                width={pivot ? cap.height : width}
                                height={pivot ? width : cap.height}
                                x={pivot ? xScale(item.y0) : xScale(item.name) + xOffset}
                                y={pivot ? yScale(item.name) + yOffset : yScale(item.y0)}
                            />
                        }
                    </React.Fragment>
                )
            })
        })
    }
}
