import React from 'react'
import PropTypes from 'prop-types'
import { bindEvents } from './events'
import { scaleLinear } from 'd3-scale'
import { dataVizColorPalette } from './color-palette'
import { inject } from './util'

export class Bubble extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.number,
            radius: PropTypes.number,
            color: PropTypes.string
        })),
        events: PropTypes.object,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        styles: PropTypes.shape({
            radius: PropTypes.number,
            color: PropTypes.string,
            opacity: PropTypes.number
        }),
        xOffset: PropTypes.number,
        xScale: PropTypes.func,
        yScale: PropTypes.func
    }

    static defaultProps = {
        xScale: scaleLinear(),
        yScale: scaleLinear()
    }

    onMouseOver = evt => evt.target.setAttribute('opacity', .25)
    onMouseLeave = evt => evt.target.setAttribute('opacity', 0)

    render() {
        let {
            data,
            events,
            xScale,
            yScale,
            xBandwidth,
            yBandwidth,
            xOffset = 0,
            styles = {}
        } = this.props
        let { color = dataVizColorPalette[4], opacity = 0.5 } = styles
        let fixRadius = styles.radius;
        let getRadius = (value, radius) => {
            let maxValue = Math.max(...data.map(i => i.value))
            let maxRadius = Math.min(xBandwidth, yBandwidth) / 2
            let percent = isNaN(radius) ? value / maxValue : radius
            return maxRadius * percent
        }
        let getEvents = (item, index) => bindEvents(events, item, index)

        //draw bubble
        return (
            data.map((item, index) => {
                const r = fixRadius ? fixRadius : getRadius(item.value, item.radius)
                const cx = xScale(item.name) + xOffset
                const cy = yScale(item.value)
                let events
                events = getEvents(item, index)
                events = inject(events,
                    ['onMouseOver', 'onMouseLeave'],
                    [this.onMouseOver, this.onMouseLeave]
                )

                return (
                    <React.Fragment key={`${item.name}-${index}`}>
                        <circle
                            className='bubble'
                            r={r}
                            cx={cx}
                            cy={cy}
                            opacity={opacity}
                            fill={color}
                        />
                        <circle
                            className='bubble-hover'
                            r={r + 2}
                            cx={cx}
                            cy={cy}
                            opacity={0}
                            fill={color}
                            strokeWidth={4}
                            {...events}
                        />
                    </React.Fragment>
                )
            })
        )
    }
}