import {useEffect,useRef,type ReactNode} from 'react'
import type {Lesson} from '../data/lesson-types'
import {briefs} from '../data/briefs'
import {emptySession,hasNote,sessionReady} from '../data/study-progress'
import type {useStudyProgress} from '../use-study-progress'
import {CheckAllIcon} from './icons'
type Props={lesson:Lesson;state:ReturnType<typeof useStudyProgress>;question:ReactNode;next:ReactNode;home:string}
export default function ShortStudy({lesson,state,question,next,home}:Props){
  const entry=state.study.sessions[lesson.id]??emptySession(),brief=briefs[lesson.id]
  const heading=useRef<HTMLHeadingElement>(null),previous=useRef(entry.step)
  useEffect(()=>{if(state.study.lastLesson!==lesson.id&&state.issue!=='damaged')state.updateSession(lesson.id,{})},[lesson.id])
  useEffect(()=>{if(previous.current!==entry.step){heading.current?.focus({preventScroll:true});heading.current?.scrollIntoView({block:'start',behavior:'instant'});previous.current=entry.step}},[entry.step])
  const move=(step:number)=>state.updateSession(lesson.id,{step})
  return <section className="short-study" aria-label="короткое занятие">
    <p className="short-intro">короткое повторение · примерно {brief.minutes??5} минут. сначала объяснение, затем запись и вопрос. полный разбор доступен по переключателю выше.</p>
    <ol className="study-steps" aria-label="шаги занятия">{['мысль','попробуй','проверь'].map((label,index)=><li key={label} aria-current={entry.step===index?'step':undefined}><span aria-hidden="true">{index<entry.step?'✓':index+1}</span>{label}</li>)}</ol>
    <h2 ref={heading} tabIndex={-1} className="step-heading">{['одна мысль','одна запись по твоей задаче','проверь понимание','на сегодня готово'][entry.step]}</h2>
    {entry.step===0&&<>{brief.explanation&&<div className="brief-explanation">{brief.explanation.split('\n\n').map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div>}<p className={brief.explanation?'short-hint':'brief-idea'}>{brief.idea}</p><p className="short-hint">дальше — небольшое упражнение. в продажах можно использовать готовый случай магазина.</p><button className="study-primary" onClick={()=>move(1)}>попробовать →</button></>}
    {entry.step===1&&<><p>{brief.prompt}</p><label className="note-label" htmlFor="session-note">твоя запись</label><textarea id="session-note" maxLength={2000} value={entry.note} placeholder={brief.placeholder} aria-describedby="note-hint" onChange={event=>state.updateSession(lesson.id,{note:event.target.value})}/><p id="note-hint" className="short-hint">одной-двух фраз достаточно · минимум 10 символов. можно записать гипотезу и то, чего пока не знаешь.</p><div className="study-actions"><button className="study-primary" disabled={!hasNote(entry.note)} onClick={()=>move(2)}>к одному вопросу →</button><button className="study-secondary" onClick={()=>move(0)}>назад к мысли</button></div></>}
    {entry.step===2&&<>{question}<div className="study-actions"><button className="study-primary" disabled={!sessionReady(lesson.id,entry)} onClick={()=>move(3)}>закончить занятие</button><button className="study-secondary" onClick={()=>move(1)}>к своей записи</button></div></>}
    {entry.step===3&&<><p className="short-success"><CheckAllIcon/>короткое занятие завершено.</p><p>можно остановиться. следующий шаг подождёт.</p><blockquote className="saved-note">{entry.note}</blockquote><p className="short-hint">это отметка короткой работы. полный урок с большим заданием отмечается отдельно.</p><div className="study-actions"><a className="study-primary" href={home}>на главную</a>{next}</div></>}
    <p className={'storage-note '+(state.issue?'storage-warning':'')} role={state.issue?'status':undefined}>{state.message}</p>
    {state.issue==='unavailable'&&<button className="study-secondary" onClick={state.retrySave}>попробовать сохранить ещё раз</button>}
    <p className="stop-note">если сейчас мало времени, можно закрыть страницу. при доступном хранении вернёшься к этому же шагу.</p>
  </section>
}
