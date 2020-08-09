import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { autoRange as _autoRange, XAxis, YAxis, Container, Legend, containerCommonPropTypes, assignStyle } from './common'
import { groups, distinct, inject, updateSelectedIndices, getDOMEvents } from './common/util'
import { StackedArea } from './common/stackedArea'
import { StackedLine } from './common/stackedLine'
import { StackedDot } from './common/stackedDot'
import sum from 'lodash/sum'
import uniq from 'lodash/uniq'
import { ShareProps } from './common/propsHelper'
import { dataVizColorPalette as colorPalette } from './common/color-palette'
import { CircleUponLine } from './common/legend-decorator'
import { Grids } from './common/grids'
import { ToolTip, AutoTooltip } from './common/tooltip'

const colors = [
    colorPalette[4],
    colorPalette[7],
    colorPalette[1],
    colorPalette[10],
    colorPalette[2],
    colorPalette[3]
]

const defaultStyles = {
    StackedLine: {
        colors: colors
    },
    StackedDot: {
        colors: colors
    },
    stackedArea: {
        colors: colors
    },
    legend: {
        width: 15,
        height: 15,
        colors: colors
    }
}

export default class StackedLineChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            group: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })),
        dataMapper: PropTypes.func,
        events: PropTypes.object,
        selectiedData: PropTypes.array,
        onSelectionChange: PropTypes.func,
        selectedIndices: PropTypes.array,
        range: PropTypes.array,
        area: PropTypes.bool,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string
    }

    static defaultProps = {
        width: 800,
        height: 600
    }
    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: null,
            selectedIndices: this.initialSelectedIndices
        }
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    get initialSelectedIndices() {
        return groups(this.props.data).map(i => true)
    }

    get selectedIndices() {
        let { data, selectedIndices, selectedData } = this.props

        if (selectedIndices) {
            if (typeof selectedIndices[0] === "number") {
                let selected = groups(data, 'name')[0].map(i => false)

                selectedIndices.forEach(item => {
                    selected[item] = true
                })
                return selected
            }
            else {
                return selectedIndices
            }
        }
        else if (selectedData) {
            let _groups = uniq(data.map((d) => d.group))
            let _selectedGroups = uniq(selectedData.map((d) => d.group))
            let selectedIndices = _groups.map(group => _selectedGroups.some(g => g == group))
            return selectedIndices
        }
        return this.state.selectedIndices
    }

    onMouseOverLine = (evt, data, index) => {
        this.setState({
            hoverIndex: index
        })
    }

    onMouseLeaveLine = () => {
        this.setState({
            hoverIndex: null
        })
    }

    onClickLine = (evt, data, index) => {
        const { events, onSelectionChange } = this.props
        let selectedIndices = updateSelectedIndices(this.selectedIndices, index)

        if (onSelectionChange) {
            let callBackSelectedIndices = []
            selectedIndices.forEach((selected, index) => {
                if (selected) {
                    callBackSelectedIndices.push(index)
                }
            })
            let _groups = uniq(this.props.data.map((d) => d.group))
            let clickedItem = this.props.data.filter((d) => d.group == _groups[index])
            let selectionData = this.props.data.filter((d) => _groups.filter((d, i) => selectedIndices[i]).indexOf(d.group) > -1)

            onSelectionChange(index, callBackSelectedIndices, clickedItem, selectionData)
        }
        else if (events && events.onSelectedChange) {
            let groupData = groups(this.props.data)
            let dataWidthSelectedStatus = groupData.map((item, index) => Object.assign({}, item, { selected: selectedIndices[index] }))
            events.onSelectedChange(dataWidthSelectedStatus)
        }
        else {
            this.setState({
                selectedIndices
            })
        }
    }

    onMouseOverDot = (evt, data) => {
        if (!this.props.toolTip) { return }
        let target = evt.target
        let color = target.getAttribute('stroke')
        let { top, left, width, height } = target.getBoundingClientRect()
        let offset = 25
        let x = left - offset
        let y = top
        this.setState({
            toolTipProps: {
                show: true,
                x,
                y,
                content: this.props.toolTip(data),
                decorator: false,
                color,
                prefer: ['bottom-end', 'top-end', 'bottom-start', 'top-start'],
                width: width + offset * 2,
                height: height
            }
        })
    }

    onMouseLeaveDot = () => {
        if (!this.props.toolTip) { return }
        this.setState({
            toolTipProps: {
                show: false
            }
        })
    }

    render() {
        let {
            hoverIndex,
            toolTipProps,
            axisToolTipProps
        } = this.state
        let {
            area,
            data,
            dataMapper = d => d,
            events,
            range,
            styles: _styles,
            legendData,
            legendArrangement,
            legendX,
            legendY,
            xGrid,
            yGrid,
            toolTip,
            xToolTip,
            selectedIndices,
            ...restProps
        } = this.props

        let styles = assignStyle(defaultStyles, _styles)
        let mappers = [
            dataMapper,
            (d, i) => Object.assign({ order: i }, d)
        ]
        let _events = inject(getDOMEvents(events), 'onMouseOver', this.onMouseOverLine)
        _events = inject(_events, 'onMouseLeave', this.onMouseLeaveLine)
        _events = inject(_events, 'onClick', this.onClickLine)

        let userEvents = inject(getDOMEvents(events),
            ['onMouseOver', 'onMouseLeave'],
            [this.onMouseOverDot, this.onMouseLeaveDot]
        )
        let builtInEvents = {
            'onMouseOver': this.onMouseOverLine,
            'onMouseLeave': this.onMouseLeaveLine,
            'onClick': this.onClickLine
        }

        return (
            <Container {...this.props}>
                <ShareProps
                    data={data}
                    dataMapper={mappers}
                    xScale={scaleBand()}
                    xDomain={data => distinct(data, 'name')}
                    yScale={scaleLinear()}
                    yDomain={range || autoRange}
                    {...restProps}
                >
                    <Grids
                        xGrid={xGrid}
                        yGrid={yGrid}
                    />
                    {
                        area &&
                        <StackedArea
                            styles={styles.stackedArea}
                            hoverIndex={hoverIndex}
                            selectedIndices={this.selectedIndices}
                        />
                    }
                    <StackedLine
                        styles={styles.StackedLine}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                        events={builtInEvents}
                    />
                    <StackedDot
                        styles={styles.StackedDot}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                        events={userEvents}
                    />
                    <Legend
                        legendData={legendData}
                        legendArrangement={legendArrangement}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                        events={builtInEvents}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                        decoratorComponent={CircleUponLine}
                    />
                    <XAxis onAxisToolTipChange={this.onAxisToolTipChange} />
                    <YAxis />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='dot-tooltip'
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

function autoRange(data) {
    let values = groups(data, 'name'/*groupBy*/, g => sum(
        g.map(i => i.value)
    ))
    return _autoRange(values)
}
