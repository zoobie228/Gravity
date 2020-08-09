import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { Container, StackedStatusBar, StatusLegend, containerCommonPropTypes, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import { colorWithMeaningPalette } from './common/color-palette'
import { legendPreset } from './common/statusLegend'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'
import { inject } from './common/util'

const colors = Object.values(colorWithMeaningPalette)

const defaultStyles = {
    stackedStatusBar: {
        width: 44,
        colors: colors
    },
    StatusLegend: {
        width: 5,
        height: 40,
        colors: colors
    }
}

export default class StackedStatusChart extends Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.number),
        colors: PropTypes.array,
        legends: PropTypes.arrayOf(PropTypes.shape({
            label: PropTypes.string,
            value: PropTypes.number
        })),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func])
    }

    static defaultProps = {
        width: 400,
        height: 400,
        transformY: 25
    }

    constructor(props) {
        super(props)
        this.state = {}
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
    }

    showOrHideToolTip = (data, x, y, width, height, color) => {
        if (!this.props.toolTip) { return }
        this.setState({
            toolTipProps: {
                show: data ? true : false,
                content: data ? this.props.toolTip(data) : null,
                x,
                y,
                width,
                height,
                color
            }
        })
    }

    onMouseOverBar = (evt, data, index) => {
        let className = evt.target.getAttribute('class')
        if (className == 'statusbar' && this.props.toolTip) {
            let { top, left, width, height } = evt.target.getBoundingClientRect()
            let color = evt.target.getAttribute('fill')
            let x = left
            let y = top
            this.debouncedShowOrHideToolTip(
                data,
                x,
                y,
                width,
                height,
                color
            )
        }
    }

    onMouseLeavePathBar = (evt) => {
        const className = evt.target.getAttribute('class')
        if (className == 'statusbar' && this.props.toolTip) {
            this.debouncedShowOrHideToolTip(null) // hide 
        }
    }

    render() {
        let { toolTipProps = {} } = this.state
        let { 
            data: _data_array,
            events = {},
            range,
            colors,
            transformY,
            type,
            styles: _styles,
            legends = [],
            legendData = legends,
            legendX,
            legendY,
            containerProps,
            toolTip,
            ...restProps } = this.props

        let styles = assignStyle(defaultStyles, _styles)
        if (colors) {
            styles = assignStyle(styles, { stackedStatusBar: { colors: colors } })
        }

        let data = [], remaining = 100;

        _data_array.map((datum, index) => {
            let d = Object.assign({}, { order: index, value: datum })
            data.push(d);
            remaining = remaining - datum;
        })

        if (remaining > 0) {
            let d = Object.assign({}, { order: data.length, value: remaining })
            data.push(d);
            styles.stackedStatusBar.colors = styles.stackedStatusBar.colors.slice(0, data.length - 1)
            styles.stackedStatusBar.colors.push(colorWithMeaningPalette.KIT);
        }

        let userEvents = inject(events,
            ['onMouseOver', 'onMouseLeave'],
            [this.onMouseOverBar, this.onMouseLeavePathBar]
        )

        return (
            <Container {...this.props}>
                <ShareProps
                    data={data}
                    xScale={scaleBand()}
                    xDomain={data}
                    yScale={scaleLinear()}
                    yDomain={[0, 100]}
                >
                    <StackedStatusBar
                        styles={styles.stackedStatusBar}
                        events={userEvents}
                    />
                    <StatusLegend
                        legendData={legendData}
                        transformY={transformY}
                        colors={styles.stackedStatusBar.colors}
                        x={legendX || legendPreset.legendX}
                        y={legendY || legendPreset.legendY}
                        styles={styles.StatusLegend}
                    />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='bar-tooltip'
                        {...toolTipProps}
                    />
                }
            </Container>
        )
    }
}
