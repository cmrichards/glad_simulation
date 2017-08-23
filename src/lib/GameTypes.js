// @flow
import Unit from "../lib/Unit"
import { gameParams } from "./gameInfo"

export type Coordinate = {
    x: number,
    y: number
}

export type UnitType = {
    name: string,
    short: string,
    hp: number,
    shield: number,
    travelSpeed: number,
    targettingTime: number,
    bulletsPerBurst: number,
    bursts: number,
    reload: number,
    damagePerBullet: number,
    bulletSpreadAtLongRange: number,
    attackRange: {
        short: number,
        medium: number,
        long: number
    }
}

export type Team = {
    name: string,
    class: string,
    colour: string
}

export type UnitAction = {
    actionType: number,
    target_unit?: Unit,
    direction?: number
}
