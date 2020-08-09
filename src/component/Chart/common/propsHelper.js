import React from 'react'
import PropTypes from 'prop-types'
import { containerCommonPropTypes } from './container'
import isFunction from 'lodash/isFunction'
import isFinite from 'lodash/isFinite'
import { getXDomain, getYDomain } from './util'

export class ShareProps extends React.Component {
    static get propTypes() {
        return {
            data: PropTypes.array,
            dataMapper: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            xScale: PropTypes.func,
            yScale: PropTypes.func,
            xAxisName: PropTypes.string,
            yAxisName: PropTypes.string,
            xDomain: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            xRange: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            yDomain: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            xBandwidth: PropTypes.number,
            yBandwidth: PropTypes.number,
            yRange: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
            ...containerCommonPropTypes
        }
    }

    render() {
        let { 
            children, //eslint-disable-line
            data,
            dataMapper,
            xScale,
            xAxisName,
            xDomain = getXDomain,
            xRange,
            xBandwidth,
            yAxisName,
            yScale,
            yDomain = getYDomain,
            yTicks,
            yRange,
            yBandwidth,
            width,
            height,
            ...restProps } = this.props;

        [].concat(dataMapper).forEach(mapper => {
            if (mapper) data = data.map(mapper)
        })

        //API backward compatible
        if (typeof (xAxisName) === 'string' && typeof (yAxisName) === 'string') {
            data = data.map(i => Object.assign({}, i, { name: i[xAxisName], value: i[yAxisName] }))
        }
        //End

        let _xTicks, _xBandwidth, _xDomain, _xRange

        if (xScale && xDomain) {
            _xDomain = isFunction(xDomain) ? xDomain(data) : xDomain

            if (xScale.ticks) {// instance of scaleLinear
                xScale.domain([
                    _xDomain[0], // min
                    _xDomain[_xDomain.length - 1] // max
                ])
            } else if (xScale.domain) { // instance of scaleBand
                xScale.domain(_xDomain)
            } else {
                throw 'unexpected xScale'
            }

            _xTicks = _xDomain.length > 2 ? _xDomain : getTicks(xScale)

            _xBandwidth = getBandwidth(xBandwidth, _xTicks, width, xScale)

            _xRange = isFunction(xRange) ? xRange(_xBandwidth, _xTicks, width) : xRange || [0, _xBandwidth * _xTicks.length]

            xScale.range(_xRange)
        }

        let _yTicks, _yBandwidth, _yDomain, _yRange

        if (yScale && yDomain) {
            _yDomain = isFunction(yDomain) ? yDomain(data) : yDomain

            if (yScale.ticks) {// instance of scaleLinear
                yScale.domain([
                    _yDomain[0], // min
                    _yDomain[_yDomain.length - 1] // max
                ])
            } else if (yScale.domain) { // instance of scaleBand
                yScale.domain(_yDomain)
            } else {
                throw 'unexpected yScale'
            }

            _yTicks = _yDomain.length > 2 ? _yDomain : getTicks(yScale)

            _yBandwidth = getBandwidth(yBandwidth, _yTicks, height, yScale)

            _yRange = isFunction(yRange) ? yRange(_yBandwidth, _yTicks, height) : yRange || [_yBandwidth * _yTicks.length, 0]

            yScale.range(_yRange)
        }

        return React.Children.map(children, component =>
            component && React.cloneElement(component, Object.assign({},
                data ? { data } : null,
                _xTicks ? { xDomain: _xTicks } : null,
                _yTicks ? { yDomain: _yTicks } : null,
                xScale ? { xScale } : null,
                yScale ? { yScale } : null,
                width ? { width } : null,
                height ? { height } : null,
                _xBandwidth ? { xBandwidth: _xBandwidth } : null,
                _yBandwidth ? { yBandwidth: _yBandwidth } : null,
                restProps
            ))
        )
    }
}

function getTicks(scale) {
    if (scale.ticks) {
        return scale.ticks()
    }

    if (scale.domain) {
        return scale.domain()
    }
}

function getBandwidth(original, ticks, distance, scale) {
    if (isFinite(original)) return original

    if (ticks) return distance / ticks.length

    return 0
}

