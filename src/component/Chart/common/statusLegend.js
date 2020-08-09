import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import { colorWithMeaningPalette } from './color-palette'

const margin = 20

const legendHeight = (decoratorHeight, legendData) => (decoratorHeight + margin) * legendData.length - margin

const legendPreset = {
    legendX: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => chartWidth + 33,
    legendY: (chartWidth, chartHeight, decoratorWidth, decoratorHeight, index, legendData) => index * (decoratorHeight + margin) + chartHeight / 2 - legendHeight(decoratorHeight, legendData) / 2
}

export { legendPreset }

export class StatusLegend extends React.Component {
    static propTypes = {
        x: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        y: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        colors: PropTypes.array,
        width: PropTypes.number,
        height: PropTypes.number,
        styles: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number,
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        legendData: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        offset: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }

    static defaultProps = {
        offset: { x: 0, y: 0 }
    }

    render() {
        let { legendData, x, y, styles, colors, width, height, offset } = this.props
        let { width: decoratorWidth, ...restStyle } = styles
        let textStyle = Object.assign({}, restStyle)
        let getX = typeof x === 'function' ? index => x(width, height, styles.width, styles.height, index, legendData) + offset.x : () => x + offset.x
        let getY = typeof y === 'function' ? index => y(width, height, styles.width, styles.height, index, legendData) + offset.y : () => y + offset.y

        return (
            <g transform={`translate(${(width / 2) + 10},0)`}>
                {
                    legendData ? legendData.map((d, index) =>
                        <LegendElement
                            data={d.value}
                            index={index}
                            key={`${index}`}
                            name={d.label}
                            length={legendData.length}
                            x={getX(index)}
                            y={getY(index)}
                            decoratorWidth={styles.width}
                            decoratorHeight={styles.height}
                            decoratorStyle={{
                                fill: colors[index]
                            }}
                            textStyle={textStyle}
                        />)
                        : null
                }
            </g>
        )
    }
}

export class LegendElement extends React.Component {
    static propTypes = {
        data: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        decoratorWidth: PropTypes.number,
        decoratorHeight: PropTypes.number,
        length: PropTypes.number,
        index: PropTypes.number,
        name: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        decoratorStyle: PropTypes.object,
        textStyle: PropTypes.object
    }

    constructor(props) {
        super(props)
        this.state = {
            inactive: false
        }
    }
    render() {
        let { index,
            name,
            x,
            y,
            decoratorWidth,
            decoratorHeight,
            decoratorStyle,
            textStyle,
            data,
            length,
            ...restProps
        } = this.props
        let fontSize = decoratorWidth
        let className = classnames({ inactive: this.state.inactive })
        let color = colorWithMeaningPalette.KIT
        let legendElements = [
            <rect className={`legend-decorator ${className}`}
                key={`legend-decorator ${index}`}
                x={x / 2}
                y={y}
                width={decoratorWidth}
                height={decoratorHeight}
                style={decoratorStyle}
                fill={color}
            />,

            <text className={`legend-number ${className}`}
                key={`legend-number ${index}`}
                x={x / 2 + 19}
                fontSize={25}
                y={y + fontSize * 3.5}
                style={textStyle}
            >
                {data}
            </text>,

            <text className={`legend-text ${className}`}
                key={`legend-text ${index}`}
                x={x / 2 + 19}
                fontSize={13}
                y={y + fontSize * 7}
                style={textStyle}
            >
                {name}
            </text>

        ]
        if (this.props.index != length - 1) {
            legendElements.push(
                <line className={`legend-line ${className}`}
                    key={`legend-line ${index}`}
                    x1={x / 2}
                    y1={y + decoratorHeight + margin / 2}
                    x2={x / 2 + 80}
                    y2={y + decoratorHeight + margin / 2}
                    stroke={color}
                    strokeWidth="0.5"
                />
            )
        } 

        return legendElements
    }
}