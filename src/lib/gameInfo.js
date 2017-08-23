// @flow
import type { UnitType } from "./GameTypes"

export const pixelsPerMeter: number = 40

export const gameParams = {
    bulletVelocity: 35, // (15 * pixelsPerMeter) * 10/1000,
    largeCircleRadius: 15,
    mediumCircleRadius: 8,
    smallCircleRadius: 3,
    millisecondsPerFrame: {
        normal: 5,
    },
    shieldRechargeMilliseconds: 3000
}

const assault: UnitType = {
    id:1,
    name: "Assault", short: "AS", hp: 5000, shield: 3000, travelSpeed: 1.2, targettingTime: 1000, 
    bulletsPerBurst: 2, bursts: 3, reload: 100, damagePerBullet: 300,
    bulletSpreadAtLongRange: 40,
    shootingLevelXOffset: 26,
    attackRange: {
        short: 90,
        medium: 50,
        long: 10
    }
}
const shotgun: UnitType = {
    id:2,
    name: "Shotgun", short: "SG", hp: 3000, shield: 5000, travelSpeed: 2.0, targettingTime: 1000, 
    bulletsPerBurst: 5, bursts: 1, reload: 100, damagePerBullet: 600,
    bulletSpreadAtLongRange: 80,
    shootingLevelXOffset: 30,
    attackRange: {
        short: 75,
        medium: 25,
        long: 5
    }
}
const machineGun: UnitType = {
    id:3,
    name: "Machine Gun", short: "MG", hp: 7000, shield: 5000, travelSpeed: 0.7, targettingTime: 2500, 
    bulletsPerBurst: 1, bursts: 100, reload: 75, damagePerBullet: 250,
    bulletSpreadAtLongRange: 60,
    shootingLevelXOffset: 42,
    attackRange: {
        short: 80,
        medium: 50,
        long: 10
    }
}
const sniper: UnitType = {
    id:4,
    name: "Sniper", short: "SN", hp: 3000, shield: 3000, travelSpeed: 1, targettingTime: 3000, 
    bulletsPerBurst: 1, bursts: 1, reload: 0, damagePerBullet: 2000,
    bulletSpreadAtLongRange: 0,
    shootingLevelXOffset: 13,
    attackRange: {
        short: 100,
        medium: 100,
        long: 100
    }
}

export const unitTypes = {
    assault: assault,
    shotgun: shotgun,
    machineGun: machineGun,
    sniper: sniper,
};

export const allUnitTypes = [ assault, shotgun, machineGun, sniper ]

export const teams = {
    red: { id: 0, name: "Red", class: "unit-red", colour: "#FF5555", bulletColour: "#FF9999" },
    blue: { id: 1, name: "Blue", class: "unit-blue", colour: "#8888FF", bulletColour: "#9999FF" }
}

export const allTeams = [teams.red, teams.blue]

export const actionTypes = {
    idle: 0, attack: 1, move: 2, retreat: 3
}

export const directions = {
    towards: 0, away: 1
}

export const distances = {
    short: 1,
    medium: 2,
    long: 3,
    outOfRange: 4
}