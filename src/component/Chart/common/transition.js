import React from 'react'
import PropTypes from 'prop-types'
import { interpolateNumber } from 'd3-interpolate'

const fps = 60 // frame per second
const interval = 1000 / fps

export const transitionPropTypes = PropTypes.shape({
    enable: PropTypes.bool,
    transitionOn: PropTypes.arrayOf(PropTypes.string),
    duration: PropTypes.number,
    onEnter: PropTypes.object,
    onLeave: PropTypes.object
}).isRequired

function transition(Component) {
    return class TransitionElement extends React.Component {
        static propTypes = transitionPropTypes

        static defaultProps = {
            enable: false,
            transitionOn: [],
            duration: 1000,
            onEnter: {},
            onLeave: {}
        }

        constructor(props) {
            super(props)
            this.interpolator = {}
            this.transitionProps = this.getTransitionProps()
            this.nonTransitionProps = this.getNonTransitionProps()
            this.state = this.getInitState()
            this.progress = 1 // 0 ~ 1
            this.increament = 1 / props.duration * interval
            this.transit = this.transit.bind(this)
            this.ref = null
        }

        get transitionPropKeys() {
            return this.props.transitionOn
        }

        get selfPropKeys() {
            return ['enable','transitionOn','duration','onEnter','onLeave']
        }

        get isTransitionPropsChanged() {
            let isChanged = false
            this.transitionPropKeys.forEach(key => {
                let value = this.state[key]
                let nextValue = this.props[key]
                isChanged = isSame(value, nextValue) ? isChanged : true
                
                if (key === 'fill' || key === 'stroke') {
                    this.interpolator[key] = progress => nextValue
                }
                else if (Array.isArray(value)) {
                    this.interpolator[key] = progress => value.map((d, i) => interpolateNumber(value[i], nextValue[i])(progress))
                }
                else {
                    this.interpolator[key] = interpolateNumber(value, nextValue)
                }
            })
            
            return isChanged
        }

        getInitState() {
            //overwrite transiton props with onEnter when enable is true
            return Object.assign({}, this.getTransitionProps(), this.props.enable ? this.props.onEnter : {})
        }

        getTransitionProps() {
            let transitionProps = {}
            this.props.transitionOn.forEach(key => {
                transitionProps[key] = this.props[key]
            })
            return transitionProps
        }

        getNonTransitionProps() {
            let nonTransitionProps = {}

            Object.keys(this.props).forEach(key => {
                //exclude transition props and self props
                if (this.transitionPropKeys.some(i => i == key) || this.selfPropKeys.some(i => i == key)) {
                    //do nothing
                }
                else {
                    nonTransitionProps[key] = this.props[key]
                }
            })

            return nonTransitionProps
        }

        startTransition() {
            this.progress = 0
            this.transit()
        }

        transit() {
            let newState = {}
            this.progress += this.increament
            this.progress = this.progress >= 1 ? 1 : this.progress

            this.transitionPropKeys.forEach(key => {
                newState[key] = this.interpolator[key](this.progress)
            })

            let done = this.progress >= 1 ? true : false
            let transitionPropsToAttributes = this.props.transitionPropsToAttributes
            let attributes

            if (transitionPropsToAttributes) {
                //convert complex newState to svg attributes
                attributes = transitionPropsToAttributes(newState)
            }
            else {
                attributes = newState
            }

            window.requestAnimationFrame(() => {
                Object.keys(attributes).forEach(key => {
                    this.ref.setAttribute(key, attributes[key])//animate by setAttribute 
                })

                if (done) {
                    //delay to exec to improve animation performance
                    setTimeout(() => {
                        this.setState(newState)
                    }, 200)
                }
                else {
                    this.transit()
                }
            })
        }

        componentDidMount() {
            if (this.props.enable && this.isTransitionPropsChanged) {
                this.startTransition()
            }
        }

        componentDidUpdate() {
            //start trantition if transition props change
            if(this.props.enable && this.progress === 1 && this.isTransitionPropsChanged) {
                this.startTransition()
            }
        }

        render() {
            let { enable } = this.props
            let transitionProps = enable ? this.state : this.getTransitionProps()
            let nonTransitionProps = this.getNonTransitionProps()
            return <Component getRef={ref => this.ref = ref} {...nonTransitionProps} {...transitionProps} enable={enable}/>
        }
    }
}

class Text extends React.Component {
    shouldComponentUpdate(nextProps) {
        return this.props.enable && this.props.text == nextProps.text ? false : true //eslint-disable-line
    }

    render() {
        let { enable, getRef, text, ...restProps } = this.props //eslint-disable-line
        return (
            <text ref={getRef} {...restProps}>{text}</text>
        )
    }
}

export const TransitionText = transition(Text)

class Rect extends React.Component {
    shouldComponentUpdate() {
        return this.props.enable? false : true //eslint-disable-line
    }

    render() {
        let { enable, getRef, ...restProps} = this.props //eslint-disable-line
        return(
            <rect ref={getRef} {...restProps} shapeRendering='auto'/>
        )
    }
}

export const TransitionRect = transition(Rect)

class Line extends React.Component {
    shouldComponentUpdate() {
        return this.props.enable? false : true //eslint-disable-line
    }

    render() {
        let { enable, getRef, ...restProps} = this.props //eslint-disable-line
        return(
            <line ref={getRef} {...restProps} shapeRendering='auto'/>
        )
    }
}

export const TransitionLine = transition(Line)

class Circle extends React.Component {
    shouldComponentUpdate() {
        return this.props.enable? false : true //eslint-disable-line
    }

    render() {
        let { enable, getRef, ...restProps} = this.props //eslint-disable-line
        return(
            <circle ref={getRef} {...restProps} shapeRendering='auto'/>
        )
    }
}

export const TransitionCircle = transition(Circle)

class Arc extends React.Component {
    shouldComponentUpdate() {
        return this.props.enable? false : true //eslint-disable-line
    }

    render() {
        let { arc, enable, getRef, transitionPropsToAttributes, startAngle, endAngle, padAngle, ...restProps } = this.props //eslint-disable-line
        let attribute = transitionPropsToAttributes({startAngle, endAngle, padAngle})

        return (
            <path ref={getRef} {...attribute} {...restProps} shapeRendering='auto'/>
        )
    }
}

export class TransitionArc extends React.Component {
    static Component = transition(Arc)

    static propTypes = {
        arc: PropTypes.func.isRequired, //non transition prop
        index: PropTypes.number.isRequired, //non transition prop
        value: PropTypes.number.isRequired, //non transition prop
        startAngle: PropTypes.number.isRequired, //transition prop
        endAngle: PropTypes.number.isRequired, //transition prop
        padAngle: PropTypes.number.isRequired //transition prop
    }

    constructor(props) {
        super(props)
        this.transitionPropsToAttributes = this.transitionPropsToAttributes.bind(this)
    }

    transitionPropsToAttributes(props) {
        let { startAngle, endAngle, padAngle } = props
        let { arc, index, value } = this.props
        let d = arc({ index, startAngle, value, endAngle, padAngle }, index)

        return {
            d: d
        }
    }

    render() {
        let { enable, duration, ...restProps } = this.props //eslint-disable-line

        return(
            <TransitionArc.Component
                enable={enable}
                transitionOn={['startAngle', 'endAngle', 'padAngle']}
                duration={duration}
                transitionPropsToAttributes={this.transitionPropsToAttributes}
                {...restProps}
            />
        )
    }
}

class Path extends React.Component {
    shouldComponentUpdate() {
        return this.props.enable ? false : true //eslint-disable-line
    }

    render() {
        let { d, enable, getRef, transitionPropsToAttributes, numberArray, ...restProps } = this.props //eslint-disable-line
        let attribute = enable ? transitionPropsToAttributes({ numberArray }) : { d: d } //if transition is enable return transitionPropsToAttributes else return original d

        return (
            <path ref={getRef} {...attribute} {...restProps} shapeRendering='auto'/>
        )
    }
}

export class TransitionPath extends React.Component {
    static Component = transition(Path)
    static letters = new RegExp('([A-Za-z]|,)','ig')
    static numbers = new RegExp('[0-9]+(\\.[0-9]+)?','ig')

    static propTypes = {
        d: PropTypes.string,
        enable: PropTypes.bool,
        duration: PropTypes.number
    }

    constructor(props) {
        super(props)
        this.dTemplate = this.getDTemplate()
        this.transitionPropsToAttributes = this.transitionPropsToAttributes.bind(this)
    }

    dToArray() {
        let d = this.props.d.replace(TransitionPath.letters,';')
        return d.split(';').filter( i => i !== '')
    }

    getDTemplate() {
        return this.props.d.replace(TransitionPath.numbers,'@'/*number holder*/)
    }

    transitionPropsToAttributes(props) {
        let { numberArray, stroke } = props
        let d = this.dTemplate
        numberArray.forEach(number => d = d.replace(/@/, number))
        return {
            d: d,
            stroke: stroke
        }
    }

    render() {
        let { d, enable, duration, ...restProps } = this.props

        return (
            <TransitionPath.Component
                className='line'
                d={d}
                enable={enable}
                transitionOn={['numberArray', 'stroke']}
                duration={duration}
                numberArray={this.dToArray()}
                transitionPropsToAttributes={this.transitionPropsToAttributes}
                {...restProps}
            />
        )
    }
}

function isSame(value, nextValue) {
    if (Array.isArray(value)) {
        return value.every((d, i) => d == nextValue[i])
    }
    else {
        return value == nextValue
    }
}

