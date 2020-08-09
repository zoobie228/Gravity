import React from 'react'
import PropTypes from 'prop-types'
import { assignStyle, animationFrame } from './util'
import { line } from 'd3-shape'

const defaultStyles = {
    background: {
        stroke:'#eeeeee',
        strokeWidth:3,
        strokeLinecap: 'round'
    },
    foreground: {
        stroke:'#f6a828',
        strokeWidth:3,
        strokeLinecap: 'round'
    },
    handle: {
        fill: '#f6f6f6',
        stroke: '#cccccc',
        strokeWidth: 1,
        r: 10
    }
}

export class Slider extends React.Component {
    static defaultProps = {
        groundComponent: <g role="presentation"/>,
        backgroundComponent: <line />,
        foregroundComponent: <path />,
        handleComponent: <circle />,
        paddingLeft: 5,
        paddingRight: 5,
        slide: function(){},
        min: 0,
        max: 0,
        x: 0,
        y: 0,
        values: 0
    }

    static propTypes = {
        groundComponent: PropTypes.element,
        backgroundComponent: PropTypes.element,
        foregroundComponent: PropTypes.element,
        handleComponent: PropTypes.element,
        min: PropTypes.number,
        max: PropTypes.number,
        values: PropTypes.oneOfType([PropTypes.number, PropTypes.array]),
        width: PropTypes.number,
        paddingLeft: PropTypes.number,
        paddingRight: PropTypes.number,
        x: PropTypes.number,
        y: PropTypes.number,
        slide: PropTypes.func,
        styles: PropTypes.object
    }

    constructor(props) {
        super(props)

        const values = Array.from(props.values)

        this.state = {
            values: values,
            handleCoors : this.initCoordinates(values)
        }

        this.onMouseDown = this.onMouseDown.bind(this)
        this.onMouseUp = this.onMouseUp.bind(this)
        this.onMouseMove = this.onMouseMove.bind(this)
    }

    

    getBackgroundComponentProps() {
        const { width, paddingLeft, paddingRight, x, y} = this.props
        return {
            key: 'background',
            x1: x + paddingLeft,
            y1: y,
            x2: x + width - paddingRight,
            y2: y
        }
    }

    getForegroundComponentProps() {
        const { handleCoors } = this.state
        const _line = line()
                        .x(d => d.cx)
                        .y(d => this.props.y)
        return {
            key: 'foreground',
            d: _line(handleCoors)
        }
    }

    getHandleComponentProps(value, index) {
        const coor = this.state.handleCoors[index]
        
        return {
            key: index,
            cx: coor.cx,
            cy: coor.cy,
            onMouseDown: evt => this.onMouseDown(evt, index)
        }
    }

    onMouseDown(evt, index) {
        this.tempCoor = { x: evt.clientX}
        this.tempOnMouseMove = evt => this.onMouseMove(evt, index)

        document.addEventListener('mousemove', this.tempOnMouseMove)
        document.addEventListener('mouseup',this.onMouseUp)
        document.addEventListener('mouseleave',this.onMouseUp)
    }

    onMouseUp(evt, index) {
        document.removeEventListener('mousemove', this.tempOnMouseMove)
        document.removeEventListener('mouseup', this.onMouseUp)
        document.removeEventListener('mouseleave',  this.onMouseUp)
        this.tempCoor = null
    }

    onMouseMove(evt, index) {    
        try{
            const { width, paddingLeft, paddingRight, x, y, min, max, slide } = this.props, { handleCoors, values } = this.state
            
            let minX = x + paddingLeft
            let maxX = x + paddingLeft + this.width
    
            let leftCoor = handleCoors[index - 1] || { cx: minX }
            let rightCoor = handleCoors[index + 1] || { cx: maxX }
    
            let xDiff = evt.clientX - this.tempCoor.x
    
            this.tempCoor.x = evt.clientX
    
            let newCx = this.state.handleCoors[index].cx + xDiff
            let percentage = (newCx - x - paddingLeft) / this.width  
            let span = max - min
            let newValue = min + Math.round(span * percentage)
    
            if( leftCoor.cx <= newCx && newCx <= rightCoor.cx) {
                handleCoors[index] = { cx: newCx}
                values[index] = newValue
                animationFrame(()=>{
                    this.setState({ 
                        handleCoors: Array.from(handleCoors), 
                        values: Array.from(values)
                    }, () => {
                        slide(this.state.values.length === 1 ? this.state.values[0] : this.state.values)
                    })
                })
            }
        }
        catch(e) {
            this.onMouseUp()
        }
    }

    initCoordinates(values) {
        const { paddingLeft, x, y, min, max } = this.props

        return values.map(v => {
            const percentage = (v - min) / (max - min)
            return {
                cx: x + paddingLeft + percentage * this.width,
                cy: y
            }
        })
    }

    get width() {
        return this.props.width - this.props.paddingLeft - this.props.paddingRight
    }

    render() {
        const styles = assignStyle(defaultStyles, this.props.styles)
        const { groundComponent, backgroundComponent, foregroundComponent, handleComponent, min, max} = this.props

        const backgroundProps = this.getBackgroundComponentProps()
        const backgroundStyles = styles.background
        const BackgroundComponent = React.cloneElement(backgroundComponent, Object.assign({}, backgroundProps, backgroundStyles))

        const foregroundProps = this.getForegroundComponentProps()
        const foregroundStyles = styles.foreground
        const ForegroundComponent = React.cloneElement(foregroundComponent, Object.assign({}, foregroundProps, foregroundStyles))

        const handleStyles = styles.handle
        const HandleComponents = this.state.values.map((value,index) => {
            const handleProps = this.getHandleComponentProps(value,index)
            return React.cloneElement(handleComponent, Object.assign({}, handleProps, handleStyles))
        })

        const children = [BackgroundComponent, ForegroundComponent, ...HandleComponents]

        return React.cloneElement(groundComponent, {}, children )
    }
}