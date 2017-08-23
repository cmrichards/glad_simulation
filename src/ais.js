//@flow 
import _ from 'lodash'
import type { UnitAction } from "./lib/GameTypes"
import Unit from "./lib/Unit"
import Board from "./lib/Board"
import { unitTypes, actionTypes, directions, distances } from "./lib/gameInfo"
import Victor from "./lib/Victor"

function moveFromAverage(unit: Board, board: Board, averageFunction: Func): Object {
    let mediumRangeUnits = board.units.slice().filter(u => u !== unit && 
        u.team !== unit.team && 
        (u.distance(unit) === distances.medium || u.distance(unit) === distances.short))

    let targetUnit; 
    let currentAction;
    if (mediumRangeUnits.length > 0) {
        targetUnit = averageFunction(mediumRangeUnits, unit)
    } else {
        let longRangeUnits = board.units.slice().filter(u => u !== unit && 
            u.team !== unit.team && 
            u.distance(unit) === distances.long)
        if (longRangeUnits.length > 0) {
            targetUnit = averageFunction(longRangeUnits, unit)
        } else {
            return {
                actionType: actionTypes.idle
            }
        }
    }
    return {
        target_unit: targetUnit,
        actionType: actionTypes.move,
        direction: directions.away
    }
}

const doNothing = {
    id: 1,
    name: "Idle",
    findNextAction: function () {
        return {
            actionType: actionTypes.idle
        }
    }
}

const justAttack = {
    id: 2,
    name: "Attack closest in-range enemy",
    findNextAction: function (unit: Board, board: Board): Object {
        let closestUnit = _.minBy(board.units.slice().filter(u => u !== unit && u.team !== unit.team),
            u => unit.absoluteDistance(u))
        let currentAction;
        if (closestUnit && (closestUnit.distance(unit) !== distances.outOfRange)) {
            currentAction = {
                target_unit: closestUnit,
                actionType: actionTypes.attack,
            }
        } else {
            currentAction = {
                actionType: actionTypes.idle
            }
        }
        return currentAction
    }
}

function averageCoordinate(units, sourceUnit) {
    let sumX = 0;
    let sumY = 0;
    units.forEach(u => {sumX += u.x ; sumY += u.y})
    return {
        x: sumX / units.length,
        y: sumY / units.length,
        averageCoordinate: true
    }
}

function averageAngle(units, sourceUnit) {
    let sumAngle = 0;
    let sourceCoordinate = {
        x: sourceUnit.x,
        y: sourceUnit.y
    }
    units.forEach(u => {
        sumAngle += Math.atan2(u.y - sourceUnit.y, sourceUnit.x - u.x);
    })
    let angleRadians = sumAngle / units.length

    let one = new Victor(200, 0);
    one.rotate(angleRadians)

    return {
        x: sourceUnit.x - one.x,
        y: sourceUnit.y + one.y,
        averageCoordinate: true
    }
}

function weightedAngle(units, sourceUnit) {
    let sumAngle = 0;
    let sumCoordinate = {
        x: 0, 
        y: 0,
        averageCoordinate: true
    }
    units.forEach(u => {
        let factor = 1.0 / ( new Victor(sourceUnit.x, sourceUnit.y)).distance(new Victor(u.x, u.y))
        sumCoordinate.x += factor * (u.x - sourceUnit.x)
        sumCoordinate.y += factor * (u.y - sourceUnit.y)
    })

    sumCoordinate.x *= 100
    sumCoordinate.y *= 100
    sumCoordinate.x += sourceUnit.x
    sumCoordinate.y += sourceUnit.y
    return sumCoordinate;
}

const fleeFromAll = {
    id: 3,
    name: "Flee from All (Medium then Long)",
    findNextAction: function (unit: Board, board: Board): Object {
        return moveFromAverage(unit, board, averageCoordinate);
    }
}

const fleeFromAverageAngle = {
    id: 6,
    name: "Flee from Average Angle",
    findNextAction: function (unit: Board, board: Board): Object {
        return moveFromAverage(unit, board, averageAngle);
    }
}

const fleeFromWeightedAngle = {
    id: 7,
    name: "Flee from Weighted Angle",
    findNextAction: function (unit: Board, board: Board): Object {
        return moveFromAverage(unit, board, weightedAngle);
    }
}

const justFlee = {
    id: 5,
    name: "Flee closest in-range enemy",
    findNextAction: function (unit: Board, board: Board): Object {
        let closestUnit = _.minBy(board.units.slice().filter(u => u !== unit && u.team !== unit.team),
            u => unit.absoluteDistance(u))
        let currentAction;
        if (closestUnit && closestUnit.distance(unit) !== distances.outOfRange) {
            currentAction = {
                target_unit: closestUnit,
                actionType: actionTypes.move,
                direction: directions.away,
            }
        } else {
            currentAction = {
                actionType: actionTypes.idle
            }
        }
        return currentAction
    }
}

const complexAi = {
    id: 4,
    name: "Complex AI",
    findNextAction: function (unit: Unit, board: Board) {
        const oldAction = unit.currentAction
        let otherUnits = board.units.slice().filter(u => u !== unit && u.team !== unit.team)
        let targetUnitExists = oldAction && oldAction.target_unit && !oldAction.target_unit.dead
        let distanceToTargetUnit = unit.distance(oldAction.target_unit)

        let closestAttackingMe
        let distanceToClosestAttacking
        let unitsAttackingMe = otherUnits.filter(
            u => u.currentAction && u.currentAction.target_unit === unit && u.currentAction.actionType === actionTypes.attack)
        if (unitsAttackingMe.length > 0) {
            closestAttackingMe = _.minBy(unitsAttackingMe, u => u.absoluteDistance(unit))
            distanceToClosestAttacking = unit.distance(closestAttackingMe)
        }

        let closestTarget = _.minBy(otherUnits, u => unit.absoluteDistance(u))
        let closestTargetDistance = unit.distance(closestTarget)

        let currentAction: UnitAction;
        if (distanceToClosestAttacking && distanceToClosestAttacking !== distances.outOfRange && unit.shield / unit.unitType.shield <= 0.25) {
            currentAction = {
                target_unit: closestAttackingMe,
                actionType: actionTypes.move,
                direction: directions.away
            }
        }
        else if (targetUnitExists && oldAction.actionType === actionTypes.attack &&
            distanceToTargetUnit !== distances.outOfRange &&
            (unit.unitType === unitTypes.sniper || unit.unitType === unitTypes.machineGun || distanceToTargetUnit !== distances.long)) {
            if (distanceToTargetUnit === distances.short || distanceToTargetUnit === distances.medium) {
                // Keep attacking selfAttacking if at short/medium
                currentAction = oldAction
            }
            else if ((unit.unitType === unitTypes.sniper || unit.unitType === unitTypes.machineGun) && distanceToTargetUnit === distances.long) {
                currentAction = oldAction
            } else if (closestTargetDistance === distances.short || closestTargetDistance === distances.medium) {
                currentAction = {
                    target_unit: closestTarget,
                    actionType: actionTypes.attack,
                }
            } else if (distanceToTargetUnit === distances.long) {
                currentAction = oldAction
            }
        } else {
            if (closestTargetDistance === distances.short || closestTargetDistance === distances.medium) {
                currentAction = {
                    target_unit: closestTarget,
                    actionType: actionTypes.attack,
                }
            } else if ((unit.unitType === unitTypes.sniper || unit.unitType === unitTypes.machineGun) && closestTargetDistance === distances.long) {
                currentAction = {
                    target_unit: closestTarget,
                    actionType: actionTypes.attack,
                }
            } else {
                currentAction = {
                    target_unit: closestTarget,
                    actionType: actionTypes.move,
                    direction: directions.towards,
                }
            }
        }
        return currentAction
    }

}

export function findAi(id) { 
    return allAis.find(ai => ai.id === id)
}

export const allAis = [ doNothing, justAttack, justFlee, complexAi, fleeFromAll, fleeFromAverageAngle, fleeFromWeightedAngle ]

export const ais = {
    doNothing: 1,
    justAttack: 2,
    justFlee: 5,
    simpleAi: 4,
    fleeFromAll: 3,
    fleeFromAverageAngle: 6,
    fleeFromWeightedAngle: 7
}
// export const ais = {
//     doNothing: doNothing,
//     justAttack: justAttack,
//     justFlee: justFlee,
//     simpleAi: complexAi
// }
