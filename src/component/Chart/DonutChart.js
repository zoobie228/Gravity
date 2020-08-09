import React from 'react'
import PropTypes from 'prop-types'
import { ShareProps } from './common/propsHelper'
import { dataVizColorPalette } from './common/color-palette'
import { Donut, Container, Legend, containerCommonPropTypes, assignStyle } from './common'
import { ToolTip } from './common/tooltip'
import { inject, updateSelectedIndices, getDOMEvents } from './common/util'
import { toolTipArrangement } from './common/toolTip-arrangement'
import { toolTipDecoratorArrangement } from './common/tooltip-decorator'
import debounce from 'lodash/debounce'

const colors = [
    dataVizColorPalette[3],
    dataVizColorPalette[4],
    dataVizColorPalette[5],
    dataVizColorPalette[6],
    dataVizColorPalette[7],
    dataVizColorPalette[8],
    dataVizColorPalette[0],
    dataVizColorPalette[1],
    dataVizColorPalette[2],
    dataVizColorPalette[9],
    dataVizColorPalette[10],
    dataVizColorPalette[11]
]

const defaultStyles = {
    legend: {
        width: 10,
        height: 10,
        colors: colors
    },
    donut: {
        innerRadius: 0,
        colors: colors
    },
    innerRadius: 0
}

export default class DonutChart extends React.Component {
    static propTypes = {
        ...containerCommonPropTypes,
        data: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.number,
            order: PropTypes.number
        })),
        onSelectionChange: PropTypes.func,
        selectedIndices: PropTypes.array,
        selectedData: PropTypes.array,
        events: PropTypes.object,
        x: PropTypes.string,
        y: PropTypes.string,
        innerRadius: PropTypes.number,
        dataMapper: PropTypes.func,
        legendData: PropTypes.arrayOf(PropTypes.string),
        legendX: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendY: PropTypes.oneOfType([PropTypes.number, PropTypes.func]),
        legendArrangement: PropTypes.string,
        styles: PropTypes.shape({
            donut: PropTypes.shape({
                innerRadius: PropTypes.number,
                colors: PropTypes.arrayOf(dataVizColorPalette)
            }),
            summary: PropTypes.shape({
                color: PropTypes.string
            }),
            legend: PropTypes.shape({
                width: PropTypes.number,
                height: PropTypes.number,
                colors: PropTypes.arrayOf(dataVizColorPalette)
            })
        })
    }

    static defaultProps = {
        width: 300,
        height: 300
    }

    constructor(props) {
        super(props)
        this.state = {
            hoverIndex: null,
            selectedIndices: this.initialSelectedIndices,
            toolTipX: -1,
            toolTipY: -1,
            showToolTip: false,
            toolTipContent: null
        }
        this.debouncedShowOrHideToolTip = debounce(this.showOrHideToolTip, 50)
    }

    get data() {
        let { data, dataMapper = d => d, x, y } = this.props
        //API - backward compatible
        if (typeof (x) === 'string' && typeof (y) === 'string') {
            data = data.map(i => Object.assign({}, i, { name: i[x], value: i[y] }))
        }
        //End
        return data.map(dataMapper)
    }

    get initialSelectedIndices() {
        return this.data.map(i => true)
    }

    get selectedIndices() {
        let {selectedIndices, selectedData} = this.props

        if(selectedIndices){
            if(typeof selectedIndices[0] === "number"){
                let selected = this.props.data.map(i => false)
        
                selectedIndices.forEach(item => {
                    selected[item] = true
                })
                return selected
            }
            else{
                return selectedIndices
            }
        }

        else if(selectedData){
            return this.props.data.map((d,i)=>{
                return selectedData.filter((item)=>item.name==d.name).length!=0
            }) 
        }
        
        return this.state.selectedIndices
    }

    onMouseOverPath = (evt, data, index) => {
        const className = evt.target.getAttribute('class')
        if (className == 'arc' && this.props.toolTip) {
            const { clientX, clientY } = evt
            const color = evt.target.style.fill
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
        const className = evt.target.getAttribute('class')
        if (className == 'arc' && this.props.toolTip) {
            this.debouncedShowOrHideToolTip(null) // hide 
        }
        this.setState({ hoverIndex: null })
    }

    onClickPath = (evt, item, index) => {
        const { events, data, onSelectionChange_Data, onSelectionChange } = this.props
        let selectedIndices = updateSelectedIndices(this.selectedIndices, index)

        if(onSelectionChange) {
            let callBackSelectedIndices =[]
            selectedIndices.forEach((selected, index) => {
                if(selected){
                    callBackSelectedIndices.push(index)
                }
            })

            let clickedItem = data[index]
            let selectedData = data.filter((d,i)=>selectedIndices[i])

            onSelectionChange(index, callBackSelectedIndices, clickedItem, selectedData)
        }
        else  if(events && events.onSelectedChange){
            let dataWidthSelectedStatus = data.map((item, index) => Object.assign({}, item, { selected: selectedIndices[index]}))
            events.onSelectedChange(dataWidthSelectedStatus)
        }
        else {
            this.setState({
                selectedIndices
            })
        }
    }

    showOrHideToolTip = (data, x, y, toolTipStyle = {}, toolTipStyleDecoratorStyle = {}) => {
        if (data === null) {
            this.setState({
                showToolTip: false,
                toolTipContent: null
            })
        } else {
            const { toolTip } = this.props
            this.setState({
                showToolTip: true,
                toolTipContent: toolTip(data),
                toolTipX: x,
                toolTipY: y,
                toolTipStyle,
                toolTipStyleDecoratorStyle
            })
        }
    }

    render() {
        let {
            hoverIndex,
            showToolTip,
            toolTipContent,
            toolTipX,
            toolTipY,
            toolTipStyle = {},
            toolTipStyleDecoratorStyle = {}
        } = this.state
        let {
            events,
            data: _data,
            dataMapper: _dataMapper,
            innerRadius,
            styles: _styles,
            legendData,
            legendX,
            legendY,
            x,
            y,
            legendArrangement,
            toolTip,
            selectedIndices,
            ...restProps
        } = this.props
        let data = this.data
        let styles = assignStyle(defaultStyles, _styles)

        //API - backward compatible
        if (innerRadius) {
            styles = assignStyle(styles, { donut: { innerRadius } })
        }
        //End
        let userEvents = inject(getDOMEvents(events),
            ['onMouseOver', 'onMouseLeave', 'onClick'],
            [this.onMouseOverPath, this.onMouseLeavePath, this.onClickPath]
        )
        let builtInEvents = {
            'onMouseOver': this.onMouseOverPath,
            'onMouseLeave': this.onMouseLeavePath,
            'onClick': this.onClickPath
        }

        return (
            <Container {...this.props}>
                <ShareProps
                    data={data}
                    {...restProps}
                >
                    <Donut
                        styles={styles}
                        hoverIndex={hoverIndex}
                        selectedIndices={this.selectedIndices}
                        events={userEvents}
                    />
                    {
                        legendData &&
                        <Legend
                            legendData={legendData}
                            legendArrangement={legendArrangement}
                            hoverIndex={hoverIndex}
                            selectedIndices={this.selectedIndices}
                            events={builtInEvents}
                            x={legendX}
                            y={legendY}
                            styles={styles.legend}
                        />
                    }
                </ShareProps>
                {
                    toolTip &&
                    <ToolTip
                        className='donut-tooltip'
                        show={showToolTip}
                        traceMouse
                        content={toolTipContent}
                        x={toolTipX}
                        y={toolTipY}
                        style={toolTipStyle}
                        decoratorStyle={toolTipStyleDecoratorStyle}
                    />
                }
            </Container>
        )
    }
}