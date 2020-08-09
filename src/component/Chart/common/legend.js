
import React from 'react'
import PropTypes from 'prop-types'
import { Square } from './legend-decorator'
import { legendPresetArrangement } from './legend-arrangement'
import { bindEvents } from './events'
import { UN_SELECTED, colorWithMeaningPalette } from './color-palette'

export class Legend extends React.Component {
    static propTypes = {
        x: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        y: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        width: PropTypes.number,
        height: PropTypes.number,
        legendArrangement: PropTypes.string,
        legendData: PropTypes.arrayOf(PropTypes.string),
        styles: PropTypes.shape({
            width: PropTypes.number,
            height: PropTypes.number,
            colors: PropTypes.arrayOf(PropTypes.string)
        }),
        hoverIndex: PropTypes.number,
        selectedIndices: PropTypes.array,
        events: PropTypes.object,
        decoratorComponent: PropTypes.oneOfType([PropTypes.func, PropTypes.array]),
        offset: PropTypes.shape({
            x: PropTypes.number,
            y: PropTypes.number
        })
    }

    render() {
        let {
            legendData,
            legendArrangement = 'right',
            x = legendPresetArrangement[legendArrangement].legendX,
            y = legendPresetArrangement[legendArrangement].legendY,
            styles = {},
            width,
            height,
            hoverIndex,
            selectedIndices = [],
            events,
            decoratorComponent = Square,
            offset = { x: 0, y: 0 }
        } = this.props
        let {
            colors,
            width: legendWidth = 10,
            height: legendHeight = 10
        } = styles
        let Decorator

        //backward compatable
        x = typeof x === 'function' ? x : legendPresetArrangement[legendArrangement].legendX
        y = typeof y === 'function' ? y : legendPresetArrangement[legendArrangement].legendY

        let getX = typeof x === 'function' ? index => x(width, height, legendWidth, legendHeight, index, legendData) + offset.x : () => x + offset.x
        let getY = typeof y === 'function' ? index => y(width, height, legendWidth, legendHeight, index, legendData) + offset.y : () => y + offset.y

        return legendData ? legendData.map((name, index) => {
            Decorator = Array.isArray(decoratorComponent) ? decoratorComponent[index] : decoratorComponent
            let _events = bindEvents(events, name, index)
            let fill = colors[index % colors.length]
            let hover = hoverIndex === index
            let selected = selectedIndices.length > 0 ? selectedIndices[index] : true
            let { CAL, ELI } = colorWithMeaningPalette

            return (
                <React.Fragment key={index}>
                    <Decorator
                        className={`legend-decorator`}
                        decorator
                        key={0}
                        x={getX(index)}
                        y={getY(index)}
                        color={hover || selected ? fill : UN_SELECTED}
                        width={legendWidth}
                        height={legendHeight}
                        hover={hover}
                        events={_events}
                    />,
                    <text
                        className={'legend-text'}
                        key={1}
                        x={getX(index) + legendWidth + 10}
                        y={getY(index) + legendHeight * 0.5}
                        dy={'.66ex'}
                        // fill={
                        //     selected ?
                        //         hover ? CAL : ELI
                        //         :
                        //         hover ? ELI : UN_SELECTED
                        // }
                        fill={
                            this.props.selectedIndices ? 
                            selected ?
                                CAL
                                :
                                hover ? CAL : UN_SELECTED
                            : ELI
                        }
                        textDecoration={
                            selected && hover ? 'underline' : 'none'
                        }
                        {..._events}
                    >
                        {name}
                    </text>
                </React.Fragment>
            )
        }) : null
    }
}
