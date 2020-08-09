import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'

export class FloatingBar extends React.Component {
    static get propTypes() {
        return {
            data: PropTypes.arrayOf(PropTypes.shape({
                name: PropTypes.string,
                begin: PropTypes.number,
                end: PropTypes.number
            })),
            events: PropTypes.object,
            xScale: PropTypes.func,
            yScale: PropTypes.func,
            xBandwidth: PropTypes.number,
            yBandwidth: PropTypes.number,
            xOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
            yOffset: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
            styles: PropTypes.object,
            pivot: PropTypes.bool,
            monoColor: PropTypes.bool
        }
    }

    render() {
        let { data,
            events,
            xScale,
            xBandwidth,yBandwidth,
            styles,
            yScale,
            xOffset,yOffset,
            pivot,monoColor } = this.props
        let { 
            colors,
            bar = {},
            cap,
            monoColors
        } = styles
        let {width: barWidth = 30} = bar
        let increase = (begin, end) => end >= begin ? true : false

        xOffset = typeof xOffset === 'function' ? xOffset(xBandwidth, barWidth) : xOffset
        yOffset = typeof yOffset === 'function' ? yOffset(yBandwidth, barWidth) : yOffset

        return (
            <React.Fragment>
                {
                    data.map((item, index) => {
                        let _events = bindEvents(events, item, index)
                        return (
                            <rect key={`${item.name}-${index}-bar`}
                                className='bar'
                                width={pivot?Math.abs(xScale(item.end) - xScale(item.begin)):barWidth}
                                x={pivot?increase(item.begin, item.end) ? xScale(item.begin) : xScale(item.end):xScale(item.name) + xOffset}
                                y={pivot?yScale(item.name) + yOffset:increase(item.begin, item.end) ? yScale(item.end) : yScale(item.begin)}
                                height={pivot?barWidth:Math.abs(yScale(item.end) - yScale(item.begin))}
                                fill={monoColor?monoColors[0]:increase(item.begin, item.end) ? colors[0] : colors[1]}
                                {..._events}
                            />
                        )
                    })
                }
                {
                    data.map((item, index) => {
                        return (
                            <rect key={`${item.name}-${index}-cap`}
                                className='cap'
                                width={pivot?cap.height:barWidth}
                                height={pivot?barWidth:cap.height}
                                x={pivot?increase(item.begin, item.end) ? xScale(item.end) : xScale(item.end) - cap.height:xScale(item.name) + xOffset}
                                y={pivot?yScale(item.name) + yOffset:increase(item.begin, item.end) ? yScale(item.end) : yScale(item.end) - cap.height}
                                fill={monoColor?monoColors[0]:increase(item.begin, item.end) ? colors[2] : colors[3]}
                                pointerEvents="none"
                            />
                        )
                    })
                }
            </React.Fragment>
        )
    }
}