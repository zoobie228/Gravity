import React from 'react'
import PropTypes from 'prop-types'
import { scaleBand, scaleLinear } from 'd3-scale'
import { XAxis, YAxis, Container, Legend, GroupLine, GroupDot, containerCommonPropTypes, assignStyle } from './common'
import { GroupArea } from './common/area'
import { getXDomain, getYDomain, inject, groups, updateSelectedIndices, getDOMEvents, creatNewInstanceWhenPropsChange } from './common/util'
import { Grids } from './common/grids'
import { ToolTip, AutoTooltip } from './common/tooltip'
import { ShareProps } from './common/propsHelper'
import { CircleUponLine } from './common/legend-decorator'
import { dataVizColorPalette as colorPalette } from './common/color-palette'
import uniq from 'lodash/uniq'

const colors = [
    colorPalette[4],
    colorPalette[7],
    colorPalette[1],
    colorPalette[10],
    colorPalette[2],
    colorPalette[3]
]

const defaultStyles = {
    groupLine: {
        colors: colors
    },
    groupDot: {
        colors: colors
    },
    groupArea: {
        colors: colors
    },
    legend: {
        width: 15,
        height: 15,
        colors: colors
    }
}

export default class LineChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            group: PropTypes.string
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
        legendArrangement: PropTypes.string,
        styles: PropTypes.object,
        xAxisName: PropTypes.string,
        yAxisName: PropTypes.string,
        xGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        yGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func])
    }

    static defaultProps = {
        width: 800,
        height: 600
    }

    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: null,
            selectedIndices: this.initialSelectedIndices,
            toolTipX: -1,
            toolTipY: -1,
            showToolTip: false,
            toolTipStyle: {},
            toolTipContent: null
        }
        this.onAxisToolTipChange = XAxis.onAxisToolTipChangeHelper.bind(this)
    }

    get initialSelectedIndices() {
        return this.props.selectedIndices || groups(this.props.data).map(i => true)
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

    onMouseOverDot = (evt, data) => {
        if (!this.props.toolTip) { return }
        let target = evt.target
        let color = target.getAttribute('stroke')
        let { top, left, width, height } = target.getBoundingClientRect()
        let offset = 25
        let x = left - offset
        let y = top
        this.setState({
            tooltipProps: {
                show: true,
                x,
                y,
                content: this.props.toolTip(data),
                color,
                decorator: false,
                prefer: ['bottom-end', 'top-end', 'bottom-start', 'top-start'],
                width: width + offset * 2,
                height: height
            }
        })
    }

    onMouseLeaveDot = () => {
        if (!this.props.toolTip) { return }
        this.setState({
            tooltipProps: {
                show: false,
                content: null
            }
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

    render() {
        let {
            hoverIndex,
            tooltipProps,
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
            xDomain = getXDomain,
            yDomain = range || getYDomain,
            xGrid,
            yGrid,
            toolTip,
            xToolTip,
            selectedIndices,
            ...restProps } = this.props
        let styles = assignStyle(defaultStyles, _styles)
        let mappers = [
            dataMapper,
            d => Object.assign({ group: 'default' }, d)
        ]
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
                    xDomain={xDomain}
                    yScale={scaleLinear()}
                    yDomain={yDomain}
                    {...restProps}
                >
                    <Grids
                        xGrid={xGrid}
                        yGrid={yGrid}
                    />
                    {
                        area &&
                        <GroupArea
                            styles={styles.groupArea}
                            hoverIndex={hoverIndex}
                            selectedIndices={this.selectedIndices}
                        />
                    }
                    <GroupLine
                        styles={styles.groupLine}
                        events={builtInEvents}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                    />
                    <GroupDot
                        styles={styles.groupDot}
                        events={userEvents}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                    />
                    <Legend
                        legendData={legendData}
                        legendArrangement={legendArrangement}
                        x={legendX}
                        y={legendY}
                        styles={styles.legend}
                        decoratorComponent={CircleUponLine}
                        events={builtInEvents}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                    />
                    <XAxis onAxisToolTipChange={this.onAxisToolTipChange} />
                    <YAxis />
                </ShareProps>
                {
                    toolTip &&
                    <AutoTooltip
                        className='dot-tooltip'
                        {...tooltipProps}
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
