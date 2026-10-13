import {lessons} from './curriculum.ts'
import {scenarios} from './scenarios.ts'
import {briefQuestion} from './briefs.ts'
import type {Store} from './progress.ts'
export const studyKey='razobratsya-short-study-v1'
export type Session={step:number;note:string;answer:number|null}
export type CaseEntry={first:number|null;second:number|null;note:string;done:boolean}
export type Study={lastLesson:string|null;sessions:Record<string,Session>;cases:Record<string,CaseEntry>}
export type StudyLoad={study:Study;issue:'unavailable'|'damaged'|null}
export const emptyStudy=():Study=>({lastLesson:null,sessions:{},cases:{}})
export const emptySession=():Session=>({step:0,note:'',answer:null})
export const emptyCase=():CaseEntry=>({first:null,second:null,note:'',done:false})
export const hasNote=(note:string)=>note.trim().length>=10
const validAnswer=(value:unknown,count:number)=>value===null||(Number.isInteger(value)&&Number(value)>=0&&Number(value)<count)
const validNote=(value:unknown):value is string=>typeof value==='string'&&value.length<=2000
export function sessionReady(id:string,entry:Session){const lesson=lessons.find(item=>item.id===id);return !!lesson&&hasNote(entry.note)&&entry.answer===briefQuestion(lesson).answer}
export function caseReady(id:string,entry:CaseEntry){const scenario=scenarios.find(item=>item.id===id);return !!scenario&&entry.first!==null&&validAnswer(entry.first,scenario.options.length)&&entry.second!==null&&validAnswer(entry.second,scenario.choices.length)&&hasNote(entry.note)}
export function decodeStudy(raw:string|null):StudyLoad{
  if(raw===null)return {study:emptyStudy(),issue:null}
  try{
    const data=JSON.parse(raw)
    if(data?.version!==1||!data.sessions||!data.cases||typeof data.sessions!=='object'||typeof data.cases!=='object'||Array.isArray(data.sessions)||Array.isArray(data.cases))throw Error('schema')
    const study=emptyStudy();let damaged=false
    if(data.lastLesson===null||lessons.some(lesson=>lesson.id===data.lastLesson))study.lastLesson=data.lastLesson;else damaged=true
    for(const lesson of lessons){
      const entry=data.sessions[lesson.id];if(entry===undefined)continue
      if(!entry||!Number.isInteger(entry.step)||entry.step<0||entry.step>3||!validNote(entry.note)||!validAnswer(entry.answer,briefQuestion(lesson).options.length)){damaged=true;continue}
      const valid={step:entry.step,note:entry.note,answer:entry.answer} as Session
      if((valid.step>=2&&!hasNote(valid.note))||(valid.step===3&&!sessionReady(lesson.id,valid))){valid.step=hasNote(valid.note)?2:1;damaged=true}
      study.sessions[lesson.id]=valid
    }
    for(const scenario of scenarios){
      const entry=data.cases[scenario.id];if(entry===undefined)continue
      if(!entry||!validNote(entry.note)||typeof entry.done!=='boolean'||!validAnswer(entry.first,scenario.options.length)||!validAnswer(entry.second,scenario.choices.length)){damaged=true;continue}
      const valid={first:entry.first,second:entry.second,note:entry.note,done:entry.done} as CaseEntry
      if(valid.first===null&&valid.second!==null){valid.second=null;damaged=true}
      if(valid.done&&!caseReady(scenario.id,valid)){valid.done=false;damaged=true}
      study.cases[scenario.id]=valid
    }
    return {study,issue:damaged?'damaged':null}
  }catch{return {study:emptyStudy(),issue:'damaged'}}
}
export function loadStudy(store:Store):StudyLoad{try{return decodeStudy(store.getItem(studyKey))}catch{return {study:emptyStudy(),issue:'unavailable'}}}
export function saveStudy(store:Store,study:Study){try{store.setItem(studyKey,JSON.stringify({version:1,...study}));return true}catch{return false}}
export function nextSession(study:Study,id:string,patch:Partial<Session>):Study{
  if(!lessons.some(lesson=>lesson.id===id))return study
  const entry={...emptySession(),...study.sessions[id],...patch}
  const candidate={...study,lastLesson:id,sessions:{...study.sessions,[id]:entry}}
  return decodeStudy(JSON.stringify({version:1,...candidate})).study
}
export function nextCase(study:Study,id:string,patch:Partial<CaseEntry>):Study{
  if(!scenarios.some(item=>item.id===id))return study
  const entry={...emptyCase(),...study.cases[id],...patch}
  return decodeStudy(JSON.stringify({version:1,...study,cases:{...study.cases,[id]:entry}})).study
}
export function resumeLesson(study:Study,completedIds:string[]=[]){
  const last=lessons.find(lesson=>lesson.id===study.lastLesson)
  if(last&&(study.sessions[last.id]?.step??0)<3)return last
  return lessons.find(lesson=>(study.sessions[lesson.id]?.step??0)<3&&!completedIds.includes(lesson.id))??lessons.find(lesson=>(study.sessions[lesson.id]?.step??0)<3)??lessons[0]
}
export type Pending={sessions:Set<string>;cases:Set<string>;lastLesson:boolean}
export function mergeUnsaved(latest:Study,memory:Study,pending:Pending):Study{
  const study:Study={lastLesson:pending.lastLesson?memory.lastLesson:latest.lastLesson,sessions:{...latest.sessions},cases:{...latest.cases}}
  for(const id of pending.sessions)if(memory.sessions[id])study.sessions[id]=memory.sessions[id]
  for(const id of pending.cases)if(memory.cases[id])study.cases[id]=memory.cases[id]
  return study
}
export function mergeRead(latest:StudyLoad,memory:Study,pending:Pending):Study{
  return mergeUnsaved(latest.issue==='unavailable'?memory:latest.study,memory,pending)
}
