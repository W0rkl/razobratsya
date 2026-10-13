import {useEffect,useRef,useState} from 'react'
import {emptyStudy,loadStudy,saveStudy,nextSession,nextCase,mergeRead,studyKey,type Session,type CaseEntry,type Study,type StudyLoad,type Pending} from './data/study-progress'
function read():StudyLoad{try{return loadStudy(localStorage)}catch{return {study:emptyStudy(),issue:'unavailable'}}}
export function useStudyProgress(){
  const [state,setState]=useState(read)
  const memory=useRef(state),pending=useRef<Pending>({sessions:new Set(),cases:new Set(),lastLesson:false})
  useEffect(()=>{const sync=(event:StorageEvent)=>{
    if(event.key!==studyKey&&event.key!==null)return
    const latest=read(),dirty=pending.current
    const next:StudyLoad={study:mergeRead(latest,memory.current.study,dirty),issue:dirty.sessions.size||dirty.cases.size?'unavailable':latest.issue}
    memory.current=next;setState(next)
  };addEventListener('storage',sync);return()=>removeEventListener('storage',sync)},[])
  const mutate=(change:(study:Study)=>Study,id?:string,family:'sessions'|'cases'='sessions')=>{
      const latest=read(),study=mergeRead(latest,memory.current.study,pending.current)
      const changed=change(study);let saved=false
      try{saved=saveStudy(localStorage,changed)}catch{/* access to storage itself can be denied */}
      if(saved&&latest.issue!=='unavailable')pending.current={sessions:new Set(),cases:new Set(),lastLesson:false}
      else if(id){pending.current[family].add(id);if(family==='sessions')pending.current.lastLesson=true}
      const next:StudyLoad={study:changed,issue:saved&&latest.issue!=='unavailable'?null:'unavailable'}
      memory.current=next;setState(next)
  }
  const updateSession=(id:string,patch:Partial<Session>)=>mutate(study=>nextSession(study,id,patch),id,'sessions')
  const updateCase=(id:string,patch:Partial<CaseEntry>)=>mutate(study=>nextCase(study,id,patch),id,'cases')
  const message=state.issue==='unavailable'?'не удалось сохранить запись в браузере. сейчас она доступна, но после обновления может исчезнуть.':state.issue==='damaged'?'часть записей не удалось прочитать. пригодные записи сохранены; новое действие попробует записать данные снова.':'записи сохраняются только в этом браузере. можно закрыть страницу и вернуться; очистка данных сайта удалит записи.'
  const retrySave=()=>mutate(study=>study)
  return {study:state.study,issue:state.issue,message,updateSession,updateCase,retrySave}
}
