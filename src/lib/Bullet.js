// @flow
import { observable } from 'mobx'
import Victor from "./Victor"
import guid from "./guid"
import Unit from "./Unit"
import type { Coordinate } from "./GameTypes"
import { gameParams } from "./gameInfo"
import { metersToPixel, metersPerSecondToPixelsPerTick } from "./TickUtils"

class Bullet {
    id: number
    willHit: boolean
    sourceUnit: Unit
    targetUnit: Unit
    originalTargetCoordinate: Victor
    sourceCoordinate: Coordinate
    currentCoordinate: Coordinate
    velocity: Coordinate
    accuracy: number
    tickCreated: number

    @observable.ref currentCoordinate: Coordinate;

    constructor({ sourceUnit, targetUnit, tickCreated }:
        {
            sourceUnit: Unit, targetUnit: Unit, tickCreated: number
        }) {

        const distanceToTarget = sourceUnit.absoluteDistance(targetUnit)
        const maximumOffset = sourceUnit.unitType.bulletSpreadAtLongRange * distanceToTarget / metersToPixel(gameParams.largeCircleRadius) 
        const offset = (Math.random() * maximumOffset) - (maximumOffset / 2)
        const diff = new Victor((targetUnit.x + offset) - sourceUnit.x, (targetUnit.y + offset) - sourceUnit.y).normalize();
        const bulletVelocityPixelsPerTick = metersPerSecondToPixelsPerTick(gameParams.bulletVelocity)

        this.id = guid()
        this.tickCreated = tickCreated
        this.sourceUnit = sourceUnit
        this.targetUnit = targetUnit
        this.accuracy = sourceUnit.accuracy(targetUnit)
        this.originalTargetCoordinate = Victor.fromObject({ x: sourceUnit.x, y: sourceUnit.y })
        this.sourceCoordinate = { x: sourceUnit.x, y: sourceUnit.y }
        this.currentCoordinate = { x: sourceUnit.x, y: sourceUnit.y }
        this.velocity = { x: diff.x * bulletVelocityPixelsPerTick, y: diff.y * bulletVelocityPixelsPerTick}
        this.willHit = true
    }
}

export default Bullet
