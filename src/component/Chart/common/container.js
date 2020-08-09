import React from 'react'
import PropTypes from 'prop-types'

@computeBoundingClientRect
export class Container extends React.Component {
    static propTypes = containerCommonPropTypes

    static defaultProps = {
        padding: 40,
        width: 500,
        height: 500
    }

    constructor(props) {
        super(props)
        this.ref = null
        this.rect = null
        this.originalHeight = null
        this.originalWidth = null
        this.onMouseMove = this.onMouseMove.bind(this)
        this.onMouseOver = this.onMouseOver.bind(this)
    }

    componentDidMount() {
        window.addEventListener('mousemove', this.onMouseMove)
    }

    componentWillUnmount() {
        window.removeEventListener('mousemove', this.onMouseMove)
    }

    fireEvents(evt) {
        let { onMouseOut, padding, paddingTop = padding, paddingRight = padding, paddingBottom = padding, paddingLeft = padding, width, height } = this.props //eslint-disable-line
        if (onMouseOut && this.rect) {
            //in chart area
            if (this.clientX - this.rect.left - paddingLeft > 0
                && this.clientY - this.rect.top - paddingTop > 0
                && this.clientX < this.rect.left + width - paddingRight
                && this.clientY < this.rect.top + height - paddingBottom
            ) {
                //do nothing
            }
            //out of chart area
            else {
                this.rect = null
                onMouseOut(evt)
            }
        }
    }

    onMouseOver(evt) {
        if (this.rect) return
        setTimeout(() => {
            if (!this.rect && this.ref && this.ref.getBoundingClientRect) {
                let { top, right, bottom, left } = this.ref.getBoundingClientRect()
                this.rect = { top, right, bottom, left }
                this.fireEvents(evt)
            }
        }, 500)
    }

    onMouseMove(evt) {
        let { clientX, clientY } = evt
        this.clientX = clientX
        this.clientY = clientY
        if (this.rect && this.props.onMouseOut) {
            setTimeout(() => {
                this.fireEvents(evt)
            }, 500)
        }
    }

    render() {
        let {
            labels = [],
            height: originalHeight = 500,
            width: originalWidth = 500,
            padding,
            paddingTop = padding,
            paddingRight = padding,
            paddingBottom = padding,
            paddingLeft = padding,
            onMouseLeave,
            children //eslint-disable-line
        } = this.props

        const height = originalHeight - paddingTop - paddingBottom
        const width = originalWidth - paddingLeft - paddingRight

        let elements = []
        let accessories = []

        React.Children.toArray(children).forEach(component => {
            switch (component.props.role) {
                case 'tooltip': accessories.push(component); break
                default: elements.push(component)
            }
        })

        return (
            <div className='ssd-chart-wrapper' ref={ref => this.ref = ref} style={{ display: 'inline-block', position: 'relative' }} onMouseOverCapture={this.onMouseOver} onMouseLeave={onMouseLeave}>
                <svg className='ssd-chart' height={originalHeight} width={originalWidth} viewBox={`0 0 ${originalWidth} ${originalHeight}`} preserveAspectRatio='xMidYMid meet'>
                    <g transform={`translate(${paddingLeft},${paddingTop})`}>
                        {
                            elements.map((component, i) =>
                                React.cloneElement(component, { width, height, key: i })
                            )
                        }
                        {
                            labels.map((component, i) =>
                                React.cloneElement(component, { width, height, key: i })
                            )
                        }
                    </g>
                </svg>
                {
                    accessories
                }
            </div>
        )
    }
}


export function extractContainerCommonProps(props = {}) {
    let {
        height,
        width,
        padding,
        paddingTop,
        paddingRight,
        paddingBottom,
        paddingLeft,
        labels,
        ...restProps
    } = props

    return {
        containerProps: {
            height,
            width,
            padding,
            paddingTop,
            paddingRight,
            paddingBottom,
            paddingLeft,
            labels
        },
        ...restProps
    }
}

export const containerCommonPropTypes = {
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    padding: PropTypes.number,
    paddingTop: PropTypes.number,
    paddingRight: PropTypes.number,
    paddingBottom: PropTypes.number,
    paddingLeft: PropTypes.number,
    toolTip: PropTypes.func,
    onMouseOut: PropTypes.func,
    labels: PropTypes.arrayOf(PropTypes.element)
}

export const containerCommonDefaultProps = {
    height: 500,
    width: 500,
    padding: 30
}

/**
 * automatically get width and height if possible
 */
function computeBoundingClientRect(Component) {
    return class ComputeBoundingClientRectHOC extends React.Component {
        constructor(props) {
            super(props)
            this.ref = null
            this.state = {
                computedWidth: null,
                computedHeight: null
            }
        }

        getBoundingClientRect = () => {
            setTimeout(() => {
                if (this.ref && this.ref.getBoundingClientRect) {
                    const rect = this.ref.getBoundingClientRect()
                    const { width, height } = this.props //eslint-disable-line
                    this.setState({ //eslint-disable-line
                        computedWidth: isFinite(width) ? width : rect.width * toPercent(width), //eslint-disable-line
                        computedHeight: isFinite(height) ? height : rect.height * toPercent(height) //eslint-disable-line
                    })
                }    
            })
        }

        render() {
            const { children, width, height, ...restProps } = this.props, state = this.state //eslint-disable-line

            if (isFinite(width) && isFinite(height)) {
                return (
                    <Component height={height} width={width} {...restProps}>{children}</Component>
                )
            }

            if (state.computedHeight && state.computedWidth) {
                return (
                    <Component height={state.computedHeight} width={state.computedWidth} {...restProps} >{children}</Component>
                )
            }

            //if width and height is not specified, return empty div to get boundingClientRect
            return (
                <div ref={ref => this.ref = ref} style={{ width: '100%', height: '100%', display: 'block' }}></div>
            )
        }

        componentDidMount() {
            this.getBoundingClientRect()
        }

        componentDidUpdate() {
            this.getBoundingClientRect()
        }
    }
}

function toPercent(str) {
    try {
        let number = str.replace('%', '')
        let result = number / 100
        return isFinite(result) ? result : 1
    }
    catch (e) {
        return 1
    }
}