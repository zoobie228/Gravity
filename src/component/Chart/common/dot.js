import React from 'react'
import PropTypes from 'prop-types'
import { groups, inject } from './util'
import { bindEvents } from './events'
import { dataVizColorPalette as colorPalette, UN_SELECTED } from './color-palette'
import { Cross } from './cross'

export class Dot extends React.Component {
    static propTypes = {
        index: PropTypes.number,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number
        })),
        events: PropTypes.object,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        xBandwidth: PropTypes.number,
        styles: PropTypes.object
    }

    constructor(props) {
        super(props)
        this.state = {
            crossIndex: null,
            hoverIndex: null
        }
        this.onMouseOver = this.onMouseOver.bind(this)
        this.onMouseLeave = this.onMouseLeave.bind(this)
    }

    onMouseOver(i) {
        return evt => {
            this.setState({
                crossIndex: i,
                hoverIndex: i
            })
        }
    }

    onMouseLeave() {
        this.setState({
            crossIndex: null,
            hoverIndex: null
        })
    }

    render() {
        let {
            crossIndex,
            hoverIndex
        } = this.state
        let {
            xScale,
            yScale,
            data,
            events: _events = {},
            xBandwidth,
            index = 0,
            selected = true,
            hover,
            styles,
            width,
            height
        } = this.props
        let { color,
            r = 3.5,
            strokeWidth = 1.5,
            fill = 'white'
        } = styles
        let xOffset = xBandwidth / 2

        return data.map((d, i) => {
            let x = xScale(d.name) + xOffset
            let y = yScale(d.value)
            let events = bindEvents(_events, d, i)

            events = inject(events,
                ['onMouseOver', 'onMouseLeave'],
                [this.onMouseOver(i), this.onMouseLeave]
            )

            return (
                <React.Fragment key={`${d.name}x-${i}`}>
                    <Cross
                        key={0}
                        show={crossIndex === i}
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                    />
                    <circle
                        key={1}
                        className='dot'
                        cx={x}
                        cy={y}
                        r={r}
                        fill={fill}
                        stroke={hover || selected ? color : UN_SELECTED}
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        key={2}
                        className='dot-hover'
                        cx={x}
                        cy={y}
                        r={r + 2}
                        fill={fill}
                        stroke={color}
                        strokeWidth={4}
                        opacity={hover || hoverIndex === i ? .25 : 0}
                        {...events}
                    />
                </React.Fragment>
            )
        })
    }
}

export class GroupDot extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            group: PropTypes.string
        })),
        events: PropTypes.object,
        selectedIndices: PropTypes.array,
        hoverIndex: PropTypes.number,
        styles: PropTypes.object
    }
    
    render() {
        let { data,
            events,
            selectedIndices = [],
            hoverIndex,
            styles = {},
            ...restProps
        } = this.props
        let { colors = colorPalette, r } = styles
        return groups(data).map((items, index) => {
            let selected = selectedIndices.length ? selectedIndices[index] : true
            let hover = hoverIndex === index
            return (
                <Dot
                    key={index}
                    index={index}
                    selected={selected}
                    hover={hover}
                    data={items}
                    styles={{ color: colors[index % colors.length], r }}
                    events={events}
                    {...restProps}
                />
            )
        })
    }
}