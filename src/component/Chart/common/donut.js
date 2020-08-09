import React from 'react'
import PropTypes from 'prop-types'
import { arc, pie } from 'd3-shape'
import { bindEvents } from './events'
import { colorWithMeaningPalette } from '../common/color-palette'
import { UN_SELECTED } from './color-palette'

export class Donut extends React.Component {
    static propTypes = {
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        hoverIndex: PropTypes.number,
        clickedIndex: PropTypes.array,
        events: PropTypes.object,
        radius: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
        selectedIndices: PropTypes.array,
        styles: PropTypes.shape({ donut: PropTypes.object }),
        summary: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }

    render() {
        let { data,
            styles,
            width,
            height,
            radius = Math.min(width, height) / 2,
            events: _events,
            hoverIndex,
            selectedIndices = [],
            summary
        } = this.props

        let _arc = arc()
        let _pie = pie().value(i => i.value).sort(byOrder)//dot not omit this sort
        let fontSize = radius * 0.5
        let fontColor = (styles.summary && styles.summary.color) ? styles.summary.color : colorWithMeaningPalette.KIT
        let outerRadius = radius
        let innerRadius = styles.donut.innerRadius ? styles.donut.innerRadius : radius * 0.85
        let padAngle = 0.008

        data.sort(byOrder)//dot not omit this sort

        return (
            <g transform={`translate(${width / 2},${height / 2})`}>
                {
                    _pie([{value:1}]).map((item, i) => {
                        let {
                            startAngle,
                            value,
                            endAngle,
                        } = item

                        padAngle = .008

                        let d = _arc({ i, startAngle, innerRadius, outerRadius, value, endAngle, padAngle }, i)
                        return (
                            <path
                                key={i}
                                className='arc-base'
                                style={{ fill : UN_SELECTED }}
                                d={d}
                            />
                        )
                    })
                }
                {
                    _pie(data).map((item, i) => {
                        let {
                            startAngle,
                            value,
                            endAngle,
                        } = item

                        let fill = styles.donut.colors[i % styles.donut.colors.length]
                        let d = _arc({ i, startAngle, innerRadius, outerRadius, value, endAngle, padAngle }, i)
                        let hoverD = _arc({ i, startAngle, innerRadius: outerRadius, outerRadius: outerRadius + 4, value, endAngle, padAngle }, i)
                        let hover = hoverIndex === i
                        let light = selectedIndices.length > 0 ? selectedIndices[i] : true
                        let events = bindEvents(_events, item.data, i)

                        return (
                            <React.Fragment key={i}>
                                <path
                                    className='arc'
                                    style={{ fill: hover || light ? fill : UN_SELECTED }}
                                    d={d}
                                    {...events}
                                />
                                {
                                    hover &&
                                    <path
                                        className='arc-hover'
                                        style={{ fill: hover ? fill : 'transparent', opacity: 0.25 }}
                                        d={hoverD}
                                    />
                                }
                            </React.Fragment>
                        )
                    })
                }
                <text
                    fontSize={fontSize}
                    transform={`translate(0,${fontSize * 0.33})`}
                    textAnchor={'middle'}
                    fill={fontColor}
                >
                    {summary}
                </text>
            </g>
        )
    }
}

function byOrder(a, b) {
    return a.order - b.order
}