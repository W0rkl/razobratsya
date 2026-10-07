export const progressKey='razobratsya-learning-v3'
export type Entry={answers:(number|null)[];practice:boolean}
export type Progress=Record<string,Entry>
export type Definition={id:string;questions:{options:string[];answer:number}[]}
export type Store=Pick<Storage,'getItem'|'setItem'>
export type Load={progress:Progress;issue:'unavailable'|'damaged'|null}
export function decodeProgress(raw:string|null,definitions:Definition[]):Load {
  if(raw===null)return {progress:{},issue:null}
  try{
    const parsed=JSON.parse(raw)
    if(parsed?.version!==1||!parsed.lessons||typeof parsed.lessons!=='object'||Array.isArray(parsed.lessons))throw Error('schema')
    const progress:Progress={}
    let damaged=false
    for(const lesson of definitions){
      const entry=parsed.lessons[lesson.id]
      if(entry===undefined)continue
      if(!entry||typeof entry.practice!=='boolean'||!Array.isArray(entry.answers)||entry.answers.length!==lesson.questions.length||!entry.answers.every((answer:unknown,i:number)=>answer===null||(Number.isInteger(answer)&&Number(answer)>=0&&Number(answer)<lesson.questions[i].options.length))){damaged=true;continue}
      progress[lesson.id]={practice:entry.practice,answers:[...entry.answers]}
    }
    return {progress,issue:damaged?'damaged':null}
  }catch{return {progress:{},issue:'damaged'}}
}
export function loadProgress(store:Store,definitions:Definition[]):Load {
  try{return decodeProgress(store.getItem(progressKey),definitions)}catch{return {progress:{},issue:'unavailable'}}
}
export function saveProgress(store:Store,progress:Progress):boolean {
  try{store.setItem(progressKey,JSON.stringify({version:1,lessons:progress}));return true}catch{return false}
}
export function emptyEntry(lesson:Definition):Entry{return {answers:lesson.questions.map(()=>null),practice:false}}
export function isComplete(lesson:Definition,entry?:Entry):boolean{return !!entry?.practice&&lesson.questions.every((question,i)=>entry.answers[i]===question.answer)}
