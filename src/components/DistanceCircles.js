// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { Circle } from "react-shapes" // distance circles

import { gameParams } from "../lib/gameInfo"
import Unit from "../lib/Unit"
import { metersToPixel } from "../lib/TickUtils"

@observer
class DistanceCircles extends Component {
    props: {
        unit: Unit
    }

    render() {
        const { unit, unit: { x, y } } = this.props
        if (!unit.showDistanceRings) return null;

        let { largeCircleRadius, mediumCircleRadius, smallCircleRadius } = gameParams;
        largeCircleRadius = metersToPixel(largeCircleRadius)
        mediumCircleRadius = metersToPixel(mediumCircleRadius)
        smallCircleRadius = metersToPixel(smallCircleRadius)

        return (
            <div
                className="item"
                style={{ transform: "translate(" + (x - largeCircleRadius) + "px, " + (y - largeCircleRadius) + "px)" }}>
                {
                    [["large", largeCircleRadius], ["medium", mediumCircleRadius], ["small", smallCircleRadius]].map((v, i) => {
                            let className = v[0], r = v[1] 
                            return ( 
                                <div key={i} className="circle item" style={{ left: largeCircleRadius - r, top: largeCircleRadius - r }}>
                                    <Circle className={"distanceCircle "+className} r={r} />
                                </div>
                            )
                        }
                    )
                }
            </div>
        )
    }
}

export default DistanceCircles
