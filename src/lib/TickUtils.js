// @flow
import { gameParams, pixelsPerMeter, distances } from "./gameInfo"

function timePerTick() { 
    return gameParams.millisecondsPerFrame.normal / 1000.0
}

export function pixelsPerTick(metersPerSecond: number): number {
    return metersPerSecond * pixelsPerMeter * timePerTick()
}

export function millisecondsToTick(milliseconds: number): number {
    return milliseconds / gameParams.millisecondsPerFrame.normal
}

export function metersToPixel(meters: number): number {
    return meters * pixelsPerMeter
}

export function pixelsToMeter(pixels: number): number {
    return pixels / pixelsPerMeter
}
export function metersPerSecondToPixelsPerTick(meters: number): number {
    return (meters * pixelsPerMeter) * timePerTick()
}

export function distanceType(distanceInPixels: number): number {
    if (distanceInPixels <= metersToPixel(gameParams.smallCircleRadius))
        return distances.short
    if (distanceInPixels <= metersToPixel(gameParams.mediumCircleRadius))
        return distances.medium
    if (distanceInPixels <= metersToPixel(gameParams.largeCircleRadius))
        return distances.long
    return distances.outOfRange
}

function pad(num) {
    var s = "00" + num;
    return s.substr(s.length - 2);
}

export function formatTime(seconds: number): string {
    const secondPart = pad(seconds % 60)
    const minutePart = pad(Math.floor(seconds / 60))
    return minutePart+":"+secondPart
}