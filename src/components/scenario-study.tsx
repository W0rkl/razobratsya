import {useEffect,useRef} from 'react'
import type {Scenario} from '../data/scenarios'
import {emptyCase,caseReady,hasNote} from '../data/study-progress'
import type {useStudyProgress} from '../use-study-progress'
import {CheckAllIcon} from './icons'
export default function ScenarioStudy({scenario,state}:{scenario:Scenario;state:ReturnType<typeof useStudyProgress>}){
  const entry=state.study.cases[scenario.id]??emptyCase(),news=useRef<HTMLHeadingElement>(null),first=useRef(entry.first)
  useEffect(()=>{if(first.current===null&&entry.first!==null){news.current?.focus({preventScroll:true});news.current?.scrollIntoView({block:'start',behavior:'instant'})}first.current=entry.first},[entry.first])
  return <article className="scenario-study">
    <p className="small-label">ситуация · около {scenario.minutes} минут · вымышленные вводные</p><h1>{scenario.title}</h1><p className="lead">{scenario.opening}</p>
    <p className="short-hint">здесь несколько допустимых решений. выбери, что проверишь, прочитай последствия и пересмотри план после новых данных.</p>
    <section aria-labelledby="first-choice"><h2 id="first-choice">{scenario.question}</h2><div className="scenario-options">{scenario.options.map((option,index)=><button key={option.label} disabled={entry.first!==null} aria-pressed={entry.first===index} onClick={()=>state.updateCase(scenario.id,{first:index})}>{option.label}</button>)}</div>{entry.first!==null&&<p className="scenario-feedback">{scenario.options[entry.first].feedback}</p>}</section>
    {entry.first!==null&&<section aria-labelledby="new-data"><h2 id="new-data" ref={news} tabIndex={-1}>теперь появились новые данные</h2><p className="new-data">{scenario.news}</p><h3>{scenario.followup}</h3><div className="scenario-options">{scenario.choices.map((option,index)=><button key={option.label} disabled={entry.done} aria-pressed={entry.second===index} onClick={()=>state.updateCase(scenario.id,{second:index})}>{option.label}</button>)}</div><div role="status">{entry.second!==null&&<p className="scenario-feedback">{scenario.choices[entry.second].feedback}</p>}</div></section>}
    {entry.second!==null&&<section className="scenario-reflection"><h2>что забрать в свой проект</h2><p>{scenario.takeaway}</p><label className="note-label" htmlFor="case-note">{scenario.prompt}</label>{entry.done?<blockquote className="saved-note">{entry.note}</blockquote>:<><textarea id="case-note" maxLength={2000} value={entry.note} placeholder={scenario.example} aria-describedby="case-note-hint" onChange={event=>state.updateCase(scenario.id,{note:event.target.value})}/><p className="short-hint" id="case-note-hint">одна-две фразы · минимум 10 символов. запись остаётся в этом браузере.</p><button className="study-primary" disabled={!hasNote(entry.note)||!caseReady(scenario.id,entry)} onClick={()=>state.updateCase(scenario.id,{done:true})}>сохранить вывод и закончить</button></>}{entry.done&&<p className="short-success" role="status"><CheckAllIcon/>ситуация разобрана. на сегодня можно закончить.</p>}</section>}
    <p className={'storage-note '+(state.issue?'storage-warning':'')} role={state.issue?'status':undefined}>{state.message}</p>
    {state.issue==='unavailable'&&<button className="study-secondary" onClick={state.retrySave}>попробовать сохранить ещё раз</button>}
    <details className="source-list"><summary>откуда взята идея и что здесь придумано</summary><p>проверено в ресерче 10 октября 2026. ситуации, варианты и суммы составлены для курса. это применение известных идей, а не подтверждение спроса или обещание результата.</p><ul>{scenario.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></details>
  </article>
}
