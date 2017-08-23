// @flow 
import { observable, computed } from 'mobx'
import Victor from "./Victor"
import guid from "./guid"
import { distances, actionTypes } from "./gameInfo"
import type { Coordinate, Team, UnitAction, UnitType } from "./GameTypes"
import { distanceType } from "./TickUtils"

class Unit {
    id: number
    hitCounter: 0
    lastDamageTick: 0

    initialX: number 
    initialY: number
    initialHp: number
    initialShield: number
    nextAction: UnitAction
    performAction: () => (() => void)

    @observable.ref ai: Object;
    @observable.ref unitType: UnitType;
    @observable.ref currentAction: UnitType;
    @observable.ref team: Team;
    @observable x: number;
    @observable y: number;
    @observable rotation: number;
    @observable hp: number;
    @observable shield: number;
    @observable shootingLevel: number;
    @observable showDistanceRings = false;
    @observable dead = false;
    @observable distanceToSelectedUnit: number;

    constructor({ ai, rotation, x, y, team, type, hp, shield }:
        { ai: number, rotation: number, x: number, y: number, type: UnitType, team: Team, hp: ?number, shield: ?number }) {
        this.distanceToSelectedUnit = 0
        this.hitCounter = 0
        this.lastDamageTick = 0
        this.id = guid()
        this.ai = ai;
        this.rotation = rotation;
        this.x = x;
        this.y = y
        this.initialX = x 
        this.initialY = y
        this.team = team;
        this.unitType = type
        this.hp = type.hp
        this.initialHp = hp || type.hp
        this.shield = shield || type.shield
        this.initialShield = type.shield
        this.currentAction = { actionType: actionTypes.idle }
        this.performAction = () => { return () => { } }
    }

    setInitialHp(value) {
        this.hp = value
        this.initialHp = value
    }

    setInitialShield(value) {
        this.shield = value
        this.initialShield = value
    }

    increaseHp(percent: number) {
        let increase = (percent/100) * this.unitType.hp
        this.hp = increase > 0 
            ? this.hp = Math.min(this.unitType.hp, this.hp + increase)
            : this.hp = Math.max(0, this.hp + increase)
    }

    increaseShield(percent: number) {
        let increase = (percent/100) * this.unitType.shield
        if(increase > 0) {
            this.shield = Math.min(this.unitType.shield, this.shield + increase)
        } else {
            this.shield = Math.max(0, this.shield + increase)
        }
    }

    setInitialX(x) {
        this.initialX = x
    }

    setInitialY(y) {
        this.initialY = y
    }

    absoluteDistance(unit: Unit): number {
        return Victor.fromObject(this).distance(Victor.fromObject(unit))
    }

    distance(unit: ?Unit) {
        if (!unit) return false;
        let distance: number = this.absoluteDistance(unit)
        return distanceType(distance)
    }

    accuracy(targetUnit: Unit) {
        const distanceType = this.distance(targetUnit)
        let accuracy:number;
        if (distanceType === distances.long)
            accuracy = this.unitType.attackRange.long
        else if (distanceType === distances.medium)
            accuracy = this.unitType.attackRange.medium
        else if (distanceType === distances.short)
            accuracy = this.unitType.attackRange.short
        else {
            // throw new Error("This should not happen")
            accuracy = 0
        }
        return accuracy;
    }

    @computed get shieldPercentage(): number {
        return Math.round(this.shield / this.unitType.shield * 100.0)
    }

    @computed get hpPercentage(): number {
        return Math.round(this.hp / this.unitType.hp * 100.0)
    }

    @computed get targetCoordinates(): ?Coordinate {
        if(this.currentAction && this.currentAction.target_unit && !this.currentAction.target_unit.dead) {
            return { x: this.currentAction.target_unit.x, y: this.currentAction.target_unit.y }
        }
    }

    hideDistanceRings() {
        if(this.showDistanceRings) this.toggleDistanceRings()
    }

    toggleDistanceRings = () => {
        this.showDistanceRings = !this.showDistanceRings;
    }

    damage(amount: number) {
        if (this.shield >= amount) {
            this.shield -= amount
        } else if (this.shield > 0) {
            amount -= this.shield
            this.shield = 0
            this.hp -= amount
        } else {
            this.hp -= amount
        }
    }
}

export const createUnit: ({ ai: any, x: number, y: number, team: Team, type: UnitType, hp: ?number, shield: ?number } => Unit)  = 
({ ai, x, y, team, type, hp, shield }) => {
    return new Unit({ ai, rotation: 0, x, y, team, type, hp, shield })
}

export default Unit
