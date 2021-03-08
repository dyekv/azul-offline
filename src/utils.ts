export const deepCopyAoa = <T>(aoa:T[][]):T[][] => {
    return aoa.map(array => [...array])
}

export const roopTimes = (callback:(item:any,idx:any)=>void, count: number):void => {
    [...Array(count)].forEach(callback)
}

export const mapTimes = <T>(callback: (item:any,idx:any) => T, count: number): T[] => {
    return [...Array(count)].map(callback)
}