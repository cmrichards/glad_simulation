import React, { Component } from 'react';
import { observer } from 'mobx-react';

var HEIGHT = 12;
var STROKEWIDTH = 2
var RADIUS = (HEIGHT - (2 * STROKEWIDTH)) / 2;
var CIRCUMFERENCE = 2 * Math.PI * RADIUS; 

@observer
class Circ extends Component { 
    render () {
        const { unit } = this.props
        var progress = unit.shootingLevelC / 100;
        var dashoffset = CIRCUMFERENCE * (1 - progress); 
        return (
            <circle
                strokeDashoffset={-dashoffset}
                strokeDasharray={CIRCUMFERENCE}
                className="progress__value"
                cx={HEIGHT / 2}
                cy={HEIGHT / 2}
                r={(HEIGHT / 2) - STROKEWIDTH}
            />
        )
    }

    // shouldComponentUpdate(nextProps, _) {
    //     console.log("shit")
    //     const { unit: { shootingLevel: level1 }} = nextProps
    //     const { unit: { shootingLevel: level2 }} = this.props
    //     console.log([Math.floor(level1 / 10) , Math.floor(level2 / 10)])
    //     return Math.floor(level1 / 10) === Math.floor(level2 / 10)
    // }
    // shouldComponentUpdate(nextProps, _) {
    //     return this.props.unit.shoo
    // }
}

export default class CircularBar extends Component {
    render() {
        return (
            <svg className="progress">
                <circle
                    className="progress__back"
                    cx={HEIGHT / 2} 
                    cy={HEIGHT / 2} 
                    r={(HEIGHT / 2) - STROKEWIDTH} 
                    />
                <Circ unit={this.props.unit}/>
            </svg>
        )
    }
}
