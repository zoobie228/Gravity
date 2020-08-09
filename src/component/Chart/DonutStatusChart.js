import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { ShareProps } from './common/propsHelper'
import { dataVizColorPalette, colorWithMeaningPalette } from './common/color-palette'
import { Donut, Container, containerCommonPropTypes, assignStyle, StatusLegend } from './common'
import { legendPreset } from './common/statusLegend'
import { inject } from './common/util'
import { ToolTip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'

const colors = [...dataVizColorPalette, ...Object.values(colorWithMeaningPalette)]

const defaultStyles = {
    donut: {
        innerRadius: 0,
        colors: colors
    },
    legend: {
        width: 5,
        height: 40
    },
    summary: {
        color: colorWithMeaningPalette.KIT
    }
}


export default class DonutStatusChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.number),
        colors: PropTypes.array,
        legends: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.number
        })),
        hideLegend: PropTypes.bool,
        events: PropTypes.object,
        dataMapper: PropTypes.func,
        styles: PropTypes.shape({
            legend: PropTypes.shape({
                height: PropTypes.number,
                width: PropTypes.number
            }),
            donut: PropTypes.shape({
                innerRadius: PropTypes.number
            }),
            summary: PropTypes.shape({
                color: PropTypes.string
            })
        }),
        summary: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    }

    static defaultProps = {
        onClick: function (evt, data) { },
        width: 400,
        height: 400,
        styles: defaultStyles,
        hideLegend: false,
        transformY: 20
    }

    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: null
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
    }

    showOrHideToolTip = (data, x, y, style, decoratorStyle) => {
        if (!this.props.toolTip) { return }
        this.setState({
            toolTipProps: {
                show: data ? true : false,
                content: data ? this.props.toolTip(data) : null,
                traceMouse: true,
                x,
                y,
                style,
                decoratorStyle
            }
        })
    }

    onMouseOverPath = (evt, data, index) => {
        const className = evt.target.getAttribute('class')
        if (className == 'arc') {
            let target = evt.target
            let color = target.style.fill
            let { clientX, clientY } = evt
            this.debouncedShowOrHideToolTip(
                data,
                clientX,
                clientY,
                Object.assign({ borderColor: color }, toolTipArrangement.topRight),
                Object.assign({ borderLeftColor: color, borderBottomColor: color }, toolTipDecoratorArrangement.bottomLeft)
            )
        }
        this.setState({ hoverIndex: index })
    }

    onMouseLeavePath = (evt) => {
        this.debouncedShowOrHideToolTip(null) // hide
        this.setState({ hoverIndex: null })
    }

    getColors = (data) => {
        let colors = []
        data.map((datum, i) => {
            colors.push(datum.color);
        })

        return colors;
    }

    render() {
        let { hoverIndex,
        toolTipProps } = this.state
        let {
            data: _data_array,
            transformY,
            hideLegend,
            events,
            legends = [],
            legendData = legends, // backward compatible
            summary,
            dataMapper = d => d,
            colors,
            styles: _styles,
            toolTip,
            ...restProps
        } = this.props

        let styles = assignStyle(defaultStyles, _styles)
        if (colors) {
            styles = assignStyle(styles, { donut: { colors: colors } })
        }

        let data = [];
        let remaining = 100;
        _data_array.map((datum, index) => {
            let d = Object.assign({}, { order: index, value: datum, index })
            data.push(d);
            remaining = remaining - datum;
        })
        if (remaining > 0) {
            let d = Object.assign({}, { order: _data_array.length + 1, value: remaining, index: _data_array.length})
            data.push(d);
            styles.donut.colors = styles.donut.colors.slice(0, data.length - 1)
            styles.donut.colors.push(colorWithMeaningPalette.KIT)
        }

        let userEvents = inject(events,
            ['onMouseOver', 'onMouseLeave'],
            [this.onMouseOverPath, this.onMouseLeavePath]
        )

        return (
            <Container {...this.props}>
                <ShareProps
                    data={data}
                    xScale={scaleBand()}
                    yScale={scaleLinear()}
                    yDomain={[0, 100]}
                >
                    <Donut
                        styles={styles}
                        hoverIndex={hoverIndex}
                        events={userEvents}
                        summary={summary}
                    />
                    {
                        !hideLegend &&
                        <StatusLegend
                            legendData={legendData}
                            transformY={transformY}
                            colors={styles.donut.colors}
                            x={legendPreset.legendX}
                            y={legendPreset.legendY}
                            styles={styles.legend}
                        />
                    }
                </ShareProps>
                {
                    toolTip &&
                    <ToolTip
                        className='donut-tooltip'
                        {...toolTipProps}
                    />
                }
            </Container>
        )
    }
}