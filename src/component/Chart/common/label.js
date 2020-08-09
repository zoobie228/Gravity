import React from 'react'
import PropTypes from 'prop-types'
import isFunction from 'lodash/isFunction'

export class Label extends React.Component {
    static propTypes = {
        role: PropTypes.string,
        x: PropTypes.oneOfType([PropTypes.func, PropTypes.number]),
        y: PropTypes.oneOfType([PropTypes.func, PropTypes.number])
    }

    static defaultProps = {
        role: 'label',
        x: 0,
        y: 0
    }

    render() {
        let { children, x, y, width, height, ...restProps } = this.props //eslint-disable-line
        x = isFunction(x) ? x(width, height) : x
        y = isFunction(y) ? y(width, height) : y

        return <text className='ssd-chart-label' x={x} y={y} {...restProps}>{children}</text>
    }
}