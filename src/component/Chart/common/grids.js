import React from 'react'
import PropTypes from 'prop-types'

export class Grids extends React.Component {
    static propTypes = {
        xDomain: PropTypes.array,
        yDomain: PropTypes.array,
        xScale: PropTypes.func,
        yScale: PropTypes.func,
        width: PropTypes.number,
        xBandwidth: PropTypes.number,
        yBandwidth: PropTypes.number,
        height: PropTypes.number,
        xGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        yGrid: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
        styles: PropTypes.shape({
            stroke: PropTypes.string
        })
    }

    render() {
        let { 
            xBandwidth,
            xDomain,
            xScale,
            yDomain,
            yScale,
            width,
            height,
            xGrid = false,
            yGrid = false
        } = this.props
        let xData = xDomain
        let yData = yDomain
        
        return(
            <g className='grids'>
                {
                    yGrid && xData.map((d, i) => 
                    <line
                        key={i}
                        className='y-grid'
                        x1={xScale(d)}
                        y1={typeof yGrid === 'function' ? yGrid(d, i, height) : height}
                        x2={xScale(d)}
                        y2={0}
                    />)
                }
                {
                    xGrid && yData.map((d,i)=>
                    <line
                        key={i}
                        className='x-grid'
                        x1={0}
                        y1={yScale(d)}
                        x2={typeof xGrid === 'function' ? xGrid(d, i, width) : width}
                        y2={yScale(d)}
                    />)
                }
            </g>
        )
    }
}