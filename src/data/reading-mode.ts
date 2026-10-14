export function fullReadingMode(search:string){return new URLSearchParams(search).get('mode')!=='short'}
export function modeSuffix(full:boolean){return full?'&mode=full':'&mode=short'}
