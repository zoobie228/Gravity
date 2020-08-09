import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange, FloatingBar, Grids, XAxis, YAxis, Container, containerCommonPropTypes, assignStyle } from './common'
import { ShareProps } from './common/propsHelper'
import { colorWithMeaningPalette as colorPalette, dataVizColorPalette as colorPalette2 } from './common/color-palette'
import { inject } from './common/util'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'

const defaultStyles = {
    floatingBar: {
        cap: {
            height: 2
        },
        colors: [colorPalette['MAX30'], colorPalette['KAI30'], colorPalette['MAX'], colorPalette['KAI']],
        monoColors: [colorPalette2[4]]
    }
}

export default class FloatingChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            begin: PropTypes.number,
            end: PropTypes.number
        })),
        events: PropTypes.object,
        width: PropTypes.number,
        height: PropTypes.number,
        dataMapper: PropTypes.func,
        range: PropTypes.array,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        monoColor: PropTypes.bool
    }

    static defaultProps = {
        width: 800,
        height: 600
    }

    constructor(props) {
        super(props)
        this.state = {}
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
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
                color,
                prefer: this.props.pivot ? AutoTooltip.preferRight : AutoTooltip.preferTop
            }
        })
    }

    onMouseOverBar = (evt, data, index) => {
        const className = evt.target.getAttribute('class')
        if (className == 'bar' && this.props.toolTip) {
            let { pivot } = this.props
            let { top, left, width, height } = evt.target.getBoundingClientRect()
            let color = evt.target.getAttribute('fill')
            //let width = evt.target.getAttribute('width')
            //let height = evt.target.getAttribute('height')
            //let x = pivot ? left + width / 1 : left + width / 2
            //let y = pivot ? top + height / 2 : top
            let x = left
            let y = top
            // let toolTipStyle = Object.assign({},
            //     pivot ? toolTipArrangement.right
            //         : toolTipArrangement.top,
            //     { borderColor: color }
            // )
            // let toolTipDecoratorStyle =
            //     pivot ? Object.assign({ borderLeftColor: color, borderTopColor: color }, toolTipDecoratorArrangement.left)
            //         : Object.assign({ borderLeftColor: color, borderBottomColor: color }, toolTipDecoratorArrangement.bottom)
                    
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

    onMouseLeaveChart = (evt) => {
        this.debouncedShowOrHideToolTip(null) // hide
    }

    render() {
        let { toolTipProps, axisToolTipProps } = this.state
        let {
            data,
            dataMapper = d => d,
            events,
            pivot = false,
            monoColor = false,
            range,
            styles,
            toolTip,
            xToolTip,
            ...restProps
        } = this.props

        styles = assignStyle(defaultStyles, styles)
        let userEvents = inject(events, 'onMouseOver', this.onMouseOverBar)

        return (
            <Container {...this.props} onMouseLeave={this.onMouseLeaveChart}>
                <ShareProps
                    data={data}
                    dataMapper={dataMapper}
                    xScale={pivot ? scaleLinear() : scaleBand()}
                    xDomain={pivot ? range || (data => autoRange(data.map(d => Math.max(d.begin, d.end)))) : data => data.map(d => d.name)}
                    yScale={pivot ? scaleBand() : scaleLinear()}
                    yDomain={pivot ? data => data.map(d => d.name) : range || (data => autoRange(data.map(d => Math.max(d.begin, d.end))))}
                    {...restProps}
                >
                    <Grids xGrid={!pivot} yGrid={pivot} styles={styles.grid} />
                    <FloatingBar
                        pivot={pivot}
                        monoColor={monoColor}
                        xOffset={(xBandwidth, barWidth) => (xBandwidth - barWidth) / 2}
                        yOffset={(yBandwidth, barWidth) => (yBandwidth - barWidth) / 2}
                        styles={styles.floatingBar}
                        events={userEvents}
                    />
                    <XAxis domainAlignment={pivot ? 'start' : 'middle'} onAxisToolTipChange={this.onAxisToolTipChange}/>
                    <YAxis domainAlignment={pivot ? 'middle' : 'start'} />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='bar-tooltip'
                        {...toolTipProps}
                    />
                }
                {
                    xToolTip &&
                    <ToolTip
                        className='axis-tooltip'
                        {...axisToolTipProps}
                    />
                }
            </Container>
        )
    }
}