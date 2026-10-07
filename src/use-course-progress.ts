import {useEffect,useState} from 'react'
import {lessons,type Lesson} from './data/curriculum'
import {emptyEntry,loadProgress,progressKey,saveProgress,type Entry,type Load,type Progress} from './data/progress'

function read():Load {
  try{return loadProgress(localStorage,lessons)}catch{return {progress:{},issue:'unavailable'}}
}
export function useCourseProgress(){
  const [state,setState]=useState(read)
  useEffect(()=>{
    const sync=(event:StorageEvent)=>{if(event.key===progressKey||event.key===null)setState(read())}
    addEventListener('storage',sync)
    return()=>removeEventListener('storage',sync)
  },[])
  const update=(lesson:Lesson,patch:{practice?:boolean;answer?:{index:number;value:number}})=>{
    const latest=read()
    const progress:Progress=state.issue==='unavailable'
      ?{...latest.progress,...state.progress}
      :{...state.progress,...latest.progress}
    const entry:Entry={...emptyEntry(lesson),...progress[lesson.id]}
    entry.answers=[...entry.answers]
    if(patch.practice!==undefined)entry.practice=patch.practice
    if(patch.answer)entry.answers[patch.answer.index]=patch.answer.value
    progress[lesson.id]=entry
    let saved=false
    try{saved=saveProgress(localStorage,progress)}catch{/* storage may be denied before setItem */}
    setState({progress,issue:saved?null:'unavailable'})
  }
  const message=state.issue==='unavailable'
    ?'браузер не разрешил сохранить прогресс. сейчас отметки работают, но после обновления могут исчезнуть.'
    :state.issue==='damaged'
      ?'часть сохранённого прогресса не удалось прочитать. доступные отметки оставлены; новые ответы попробуем сохранить заново.'
      :'прогресс хранится в этом браузере. на другом устройстве его не будет; очистка данных сайта уберёт отметки.'
  return {progress:state.progress,update,message,issue:state.issue}
}
