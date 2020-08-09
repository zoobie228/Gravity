import React from 'react'
import PropTypes from 'prop-types'
import { DEFAULT_STROKE_WIDTH } from '../common/color-palette'
import { bindEvents } from './events'

export class StackedStatusBar extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            color: PropTypes.string,
            label: PropTypes.string,
            order: PropTypes.number
        })),
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        width: PropTypes.number,
        height: PropTypes.number,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        styles: PropTypes.shape({
            width: PropTypes.number
        })
    }

    render() {
        let { data,
            events: _events = {},
            xScale,
            yScale,
            height,
            xBandwidth,
            yBandwidth,
            styles } = this.props
        let { colors, width } = styles
        let reducer = (accumulator, current) => accumulator + current.value

        return data.map((item, index, arr) => {
            let a = arr.slice(0, index)
            let b = arr.slice(0, index + 1)

            let bottom = a.reduce(reducer, 0)
            let top = b.reduce(reducer, 0)

            let yBottom = yScale(bottom)
            let yTop = yScale(top)
            let events = bindEvents(_events, item, index)

            return (
                <rect
                    key={`${item.name}-${index}`}
                    className='statusbar'
                    y={yTop}
                    width={width}
                    height={height - yTop - height + yBottom}
                    fill={colors[index]}
                    stroke="white"
                    strokeWidth={DEFAULT_STROKE_WIDTH}
                    {...events}
                />

            )
        })

    }
}
