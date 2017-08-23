// @flow
import React, { Component } from 'react';
import { observer } from 'mobx-react';

import Bar from "./Bar"
import Unit from "../lib/Unit"
import { distances } from "../lib/gameInfo"

@observer
class UnitView extends Component {

    props: {
        unit: Unit,
        clickOnUnit: any
    }

    clickOnUnit = () => {
        const { clickOnUnit, unit } = this.props
        clickOnUnit(unit)
    }

    classNames() {
        const { unit } = this.props
        let classNames = ["unit-body", unit.team.class]
        if (unit.distanceToSelectedUnit !== 0) {
            // A unit is selected and this unit is within one of the visible distance rings.
            switch (unit.distanceToSelectedUnit) {
                case distances.outOfRange:
                    break;
                case distances.short:
                    classNames.push("short")
                    break;
                case distances.medium:
                    classNames.push("medium")
                    break;
                case distances.long:
                    classNames.push("long")
                    break;
                default:
                    break;
            }
        }
        return classNames
    }

    render() {
        const {
            unit,
            unit: {
                x, y, shieldPercentage, hpPercentage,
                unitType: { short, hp: hpMax, shield: shieldMax }
            }
        } = this.props;
        return (
            <div
                className="unit"
                style={{ transform: "translate(" + x + "px, " + y + "px)" }}
                onClick={this.clickOnUnit}>
                <div className="unitStatus">
                    <div>
                        <Bar color="white" percent={shieldPercentage} maxLevel={shieldMax} />
                        <Bar color={unit.team.colour} percent={hpPercentage} maxLevel={hpMax} />
                    </div> 
                </div>
                <div className="unit-body-wrap">
                    <div className={this.classNames().join(" ")}>
                        {short}
                    </div>
                </div>
            </div>
        )
    }
}

export default UnitView
