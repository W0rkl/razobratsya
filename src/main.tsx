import React,{useEffect,useRef,useState,type MouseEvent} from 'react'
import {createRoot} from 'react-dom/client'
import DiscCascadeCarousel,{type DiscCascadeItem} from '@/components/ui/disc-cascade-carousel'
import StackTower from '@/components/ui/stack-tower'
import {ArrowLeftIcon,CheckAllIcon} from '@/components/icons'
import {topics,lessons,programBlocks,blocksForTopic,blockForLesson,lessonFor,topicLessons,topicMinutes,lessonHref,homeHref,assetHref,topicFromUrl,routeFromUrl,type Topic} from '@/data/course'
import {emptyEntry,isComplete} from '@/data/progress'
import {useCourseProgress} from '@/use-course-progress'
import {useStudyProgress} from '@/use-study-progress'
import {emptySession,resumeLesson} from '@/data/study-progress'
import {scenarios} from '@/data/scenarios'
import {briefQuestion} from '@/data/briefs'
import ShortStudy from '@/components/short-study'
import ScenarioStudy from '@/components/scenario-study'
import QuestionQuiz from '@/components/question-quiz'
import './styles.css'

const currency=(n:number)=>new Intl.NumberFormat('ru-RU').format(n)+' ₽'
const isReader=location.pathname.endsWith('/learn.html')
const scenarioHref=(id:string)=>assetHref('learn.html')+'?case='+id
const lessonCount=(count:number)=>count+' '+(count%100>=11&&count%100<=14?'уроков':count%10===1?'урок':count%10>=2&&count%10<=4?'урока':'уроков')

function Header({reading=false,topic=topicFromUrl()}:{reading?:boolean;topic?:Topic}){
  return <header className="site-header"><a className="wordmark" href={homeHref()}>разобраться<span>.</span></a><nav aria-label="страницы"><a href={homeHref()} aria-current={!reading?'page':undefined}>главная</a><a href={lessonHref(topic)} aria-current={reading?'page':undefined}>обучение</a></nav></header>
}
function Paragraphs({text}:{text:string}){return <>{text.split('\n\n').map((paragraph,i)=><p key={i}>{paragraph}</p>)}</>}
function Home(){
  const [active,setActive]=useState(()=>Math.max(0,topics.indexOf(topicFromUrl())))
  const [paused,setPaused]=useState(false)
  const {progress,message}=useCourseProgress()
  const studyState=useStudyProgress()
  const shortCount=Object.values(studyState.study.sessions).filter(entry=>entry.step===3).length
  const selected=topics[active]
  const completed=lessons.filter(lesson=>isComplete(lesson,progress[lesson.id])).length
  const resume=resumeLesson(studyState.study,lessons.filter(lesson=>isComplete(lesson,progress[lesson.id])).map(lesson=>lesson.id))
  const resumeTopic=topics.find(topic=>topic.slug===resume.topic)!
  const lastNote=studyState.study.lastLesson?studyState.study.sessions[studyState.study.lastLesson]?.note:undefined
  useEffect(()=>{document.title='разобраться — обучение и практика'},[])
  const discs:DiscCascadeItem[]=topics.map(topic=>({title:topic.title,src:assetHref('art/'+topic.art),alt:topic.alt,label:topic.title,labelStyle:'arc',ink:'#ffffff',fine:'разобраться · '+lessonCount(topicLessons(topic).length)}))
  return <>
    <a className="skip" href="#program">к программе курса</a><Header topic={selected}/>
    <main className="home-main">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy"><p className="small-label">сейчас достаточно одного небольшого шага</p><h1 id="welcome-title">начни с малого.<br/>пять минут здесь.</h1><p>одна мысль, одна запись по твоей задаче и один вопрос. про клиентов, деньги и работу с ии. можно закончить после этого и вернуться позже.</p><a className="start-course" href={lessonHref(resumeTopic,resume)}>{studyState.study.lastLesson?'продолжить свой шаг':'начать короткое занятие'} <span aria-hidden="true">→</span></a><p className="resume-caption">{resume.shortTitle} · примерно 5 минут{shortCount>0?' · коротких занятий завершено: '+shortCount:''}</p></div>
        <div className="tower-wrap" aria-hidden="true"><StackTower paused={paused}/></div>
      </section>
      {lastNote&&<section className="recent-note" aria-label="последняя запись"><p className="small-label">где ты остановился</p><p>{lastNote.slice(0,240)}{lastNote.length>240?'…':''}</p><p className="storage-note">{studyState.message}</p></section>}
      {studyState.issue&&!lastNote&&<p className="storage-note storage-warning" role="status">{studyState.message}</p>}
      <section className="scenario-list" id="situations" aria-labelledby="situations-title"><p className="small-label">новое · решения в незнакомых ситуациях</p><h2 id="situations-title">выбери действие. потом узнаешь больше.</h2><p>клиент меняет условия, инструмент ошибается, появляются новые данные. попробуй пересмотреть решение и сохранить вывод для своего проекта.</p><ol>{scenarios.map((scenario,index)=><li key={scenario.id}><a href={scenarioHref(scenario.id)}><span className="scenario-number">{index+1}.</span><span>{scenario.title}</span><span className="scenario-time">{studyState.study.cases[scenario.id]?.done?'разобрано':scenario.minutes+' мин'} <span aria-hidden="true">↗</span></span></a></li>)}</ol></section>
      <section id="topics" className="topic-picker" aria-label="выбор темы">
        <div className="picker-top"><h2>выбери свой диск</h2><button className="motion-toggle" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?'включить анимации':'остановить анимации'}</button></div>
        <DiscCascadeCarousel items={discs} height="520px" discSize="clamp(245px,30vw,365px)" index={active} onIndexChange={setActive} onSelect={(_,index)=>location.assign(lessonHref(topics[index]))} defaultIndex={0} spacing={.91} rise={.29} depth={.38} yaw={17} fan={-9} tilt={-6} roll={100} spin={paused?0:32} loop frame={false} reviews={false} details={false} indexLabel="" background="#000000" color="#ffffff" brand="" serif="Georgia,serif" sans="Arial,Helvetica,sans-serif" display="'Arial Black',Impact,Arial,sans-serif" hint="потяни диск или нажми клавиши ← →" ariaLabel="темы курса" className="course-discs"/>
        <div className="selected-topic"><div aria-live="polite"><p className="small-label">{String(active+1).padStart(2,'0')} / {String(topics.length).padStart(2,'0')} · {lessonCount(topicLessons(selected).length)} · около {topicMinutes(selected)} минут</p><h2>{selected.title}</h2><p>{selected.description}</p></div><a className="open-lesson" href={lessonHref(selected)}>открыть обучение</a></div>
        <div className="topic-jumps" aria-label="перейти к диску">{topics.map((topic,i)=><button key={topic.slug} onClick={()=>setActive(i)} aria-pressed={i===active}>{topic.title}</button>)}</div>
      </section>
      <section className="course-program" id="program" aria-labelledby="program-title">
        <p className="small-label">читай по порядку или выбери нужную тему</p><h2 id="program-title">что ты пройдёшь</h2>
        <p className="program-intro">каждый урок можно начать с короткого занятия. когда захочешь глубже — открой полный разбор: шесть частей, случай, большое задание и два вопроса. всего {topics.length} тем, {programBlocks.length} блоков и {lessonCount(lessons.length)}. темп выбираешь сам.</p>
        <div className="books-note"><p>для денег и бизнеса отправной точкой стал «богатый папа, бедный папа» роберта кийосаки. для общения и продаж — «психология влияния» роберта чалдини; для текста — «как создать крутой рекламный текст» джозефа шугермана.</p><p>берём отдельные идеи и разбираем свои ситуации. это самостоятельный курс с практикой; точные источники и границы применения указаны в уроках.</p></div>
        <div className="progress-line"><label htmlFor="course-progress">полных уроков завершено {completed} из {lessons.length}</label><progress id="course-progress" value={completed} max={lessons.length}/></div><p className="storage-note">{message}</p>
        <ol className="program-list">{topics.map((topic,i)=><li key={topic.slug}><div><span className="small-label">{String(i+1).padStart(2,'0')} · {lessonCount(topicLessons(topic).length)}</span><h3>{topic.title}</h3><p>{topic.description}</p></div><div>{blocksForTopic(topic.slug).map((block,j)=><section className="program-block" key={block.slug}><h4>{blocksForTopic(topic.slug).length>1?String(j+1)+'. ':''}{block.title}</h4><p>{block.description}</p><ol>{block.lessonIds.map(id=>{const lesson=lessons.find(item=>item.id===id)!;return <li key={id}><a href={lessonHref(topic,lesson)}>{lesson.shortTitle}</a><span>{isComplete(lesson,progress[id])?'пройдено':lesson.minutes+' мин'}</span></li>})}</ol></section>)}</div></li>)}</ol>
        <p className="course-method">как проходить: выбери один проект и делай все задания на нём. урок отмечается завершённым после отметки о практике и двух правильных ответов. это твоя отметка работы, а не проверка задания преподавателем.</p>
      </section>
    </main><footer className="site-footer"><span>разобраться.</span><span>от одной задачи до первой проверки</span></footer>
  </>
}

const flow=[['браузер','человек заполняет форму. браузер собирает данные и отправляет запрос на сервер. проверка полей на экране помогает заметить опечатки.'],['сервер','сервер проверяет данные и права пользователя. затем решает, можно ли выполнить действие. проверка в браузере не заменяет проверку на сервере.'],['база','сервер записывает заявку в базу данных. теперь её можно прочитать при следующем посещении. если запись не удалась, сервер должен сообщить об ошибке.'],['ответ','сервер возвращает результат. браузер показывает подтверждение или ошибку. при повторной отправке важно не создать две одинаковые заявки.']]
function Flow(){const [step,setStep]=useState(0);return <section className="demo" aria-label="путь запроса"><p className="demo-title">путь одной заявки · нажми на шаг</p><ol className="pipeline">{flow.map(([title],i)=><li key={title}><button type="button" onClick={()=>setStep(i)} aria-pressed={step===i}><span>{String(i+1).padStart(2,'0')}</span>{title}</button></li>)}</ol><p className="pipeline-description" aria-live="polite">{flow[step][1]}</p></section>}
function Calculator(){const [count,setCount]=useState(20);const profit=count*800-12000;return <section className="demo calculator" aria-label="пример расчёта прибыли"><p className="demo-title">условный сервис: цена 1 000 ₽, расходы на заказ 200 ₽,<br/>постоянные расходы 12 000 ₽ в месяц</p><label htmlFor="orders">заказов в месяц <output id="order-count" htmlFor="orders">{count}</output></label><input id="orders" type="range" min="0" max="50" value={count} onChange={event=>setCount(Number(event.target.value))}/><p className="calculation" aria-live="polite">выручка: {currency(count*1000)}<br/>после расходов на заказы: {currency(count*800)}<br/><strong>{profit<0?'убыток':profit===0?'результат':'прибыль'}: {currency(Math.abs(profit))}</strong></p><p className="demo-title model-note">упрощённый расчёт, без налогов и оплаты твоего труда</p></section>}

function Reader(){
  const [route,setRoute]=useState(routeFromUrl)
  const [full,setFull]=useState(()=>new URLSearchParams(location.search).get('mode')==='full')
  const [menuOpen,setMenuOpen]=useState(false)
  const mainRef=useRef<HTMLElement>(null),toggleRef=useRef<HTMLButtonElement>(null)
  const {progress,update,message,issue}=useCourseProgress()
  const studyState=useStudyProgress()
  const {topic,lesson}=route
  const position=lessons.indexOf(lesson),moduleLessons=topicLessons(topic),modulePosition=moduleLessons.indexOf(lesson)
  const block=blockForLesson(lesson.id)
  const entry=progress[lesson.id]??emptyEntry(lesson)
  const completed=lessons.filter(item=>isComplete(item,progress[item.id])).length
  const complete=isComplete(lesson,entry)
  useEffect(()=>{const pop=()=>{setRoute(routeFromUrl());setFull(new URLSearchParams(location.search).get('mode')==='full');setMenuOpen(false)};addEventListener('popstate',pop);return()=>removeEventListener('popstate',pop)},[])
  useEffect(()=>{document.title=lesson.title+' — разобраться'},[lesson])
  useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&menuOpen){setMenuOpen(false);toggleRef.current?.focus()}};addEventListener('keydown',escape);return()=>removeEventListener('keydown',escape)},[menuOpen])
  const navigate=(event:MouseEvent<HTMLAnchorElement>,nextTopic:Topic,nextLesson=lessonFor(nextTopic))=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
    event.preventDefault();history.pushState(null,'',lessonHref(nextTopic,nextLesson)+(full?'&mode=full':''));setRoute({topic:nextTopic,lesson:nextLesson});setMenuOpen(false);mainRef.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})
  }
  const lessonLink=(item:typeof lesson,direction:'prev'|'next',short=false)=>{const nextTopic=topics.find(topic=>topic.slug===item.topic)!;return <a className={short?'study-secondary':direction==='prev'?'prev-link':'next-link'} href={lessonHref(nextTopic,item)+(full?'&mode=full':'')} onClick={event=>navigate(event,nextTopic,item)}>{short?'ещё один шаг →':direction==='prev'?<><ArrowLeftIcon size={20}/>предыдущий урок</>:'следующий урок'}</a>}
  const toggleMode=()=>{const next=!full,url=new URL(location.href);if(next)url.searchParams.set('mode','full');else url.searchParams.delete('mode');history.pushState(null,'',url);setFull(next);mainRef.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})}
  const session=studyState.study.sessions[lesson.id]??emptySession()
  const readerHref=(item:Topic,part=lessonFor(item))=>lessonHref(item,part)+(full?'&mode=full':'')
  return <>
    <a className="skip" href="#lesson" onClick={event=>{event.preventDefault();mainRef.current?.focus();mainRef.current?.scrollIntoView()}}>к уроку</a><Header reading topic={topic}/>
    <div className="reader-heading"><a className="back-to-discs" href={homeHref(topic)}><ArrowLeftIcon size={20}/>к дискам</a><button ref={toggleRef} className="contents-toggle" aria-expanded={menuOpen} aria-controls="contents" onClick={()=>setMenuOpen(open=>!open)}>оглавление <span aria-hidden="true">☰</span></button></div>
    <div className="reading-layout">
      <aside id="contents" className={'contents '+(menuOpen?'is-open':'')} aria-label="оглавление курса"><div className="contents-heading">программа <span>{completed} / {lessons.length}</span></div><nav aria-label="темы и уроки">{topics.map((item,i)=><div key={item.slug}><a className={'lesson-link '+(item.slug===topic.slug?'current-module':'')} href={readerHref(item)} onClick={event=>navigate(event,item)}><span className="lesson-number">{String(i+1).padStart(2,'0')}</span><span>{item.title}</span></a>{item.slug===topic.slug&&blocksForTopic(item.slug).map(partBlock=><div className="contents-block" key={partBlock.slug}><p>{partBlock.title}</p><ol className="module-lessons">{partBlock.lessonIds.map((id,j)=>{const part=lessons.find(value=>value.id===id)!;return <li key={id}><a href={readerHref(item,part)} onClick={event=>navigate(event,item,part)} aria-current={part.id===lesson.id?'page':undefined}><span>{j+1}.</span> {part.shortTitle}{isComplete(part,progress[id])&&<span className="completed-label"> · пройдено</span>}</a></li>})}</ol></div>)}</div>)}</nav><p className="aside-note">выбери один проект<br/>и делай задания на нём.</p></aside>
      <main className="lesson-main" id="lesson" ref={mainRef} tabIndex={-1} style={{'--accent':topic.color} as React.CSSProperties}>
        <article key={lesson.id}>
          <div className="lesson-meta"><span className="fraction">{full?String(position+1).padStart(2,'0')+' / '+lessons.length:'короткое занятие'}</span><span>{full?'около '+lesson.minutes+' минут на разбор и вопросы':'примерно 5 минут'}</span><span>{topic.title}{full?' · '+(modulePosition+1)+' из '+moduleLessons.length:''}</span></div>
          <p className="block-label">блок: {block.title} · урок {block.lessonIds.indexOf(lesson.id)+1} из {block.lessonIds.length}</p>
          <h1>{lesson.title}</h1><button className="reading-mode" onClick={toggleMode}>{full?'вернуться к короткому занятию':'открыть полный урок с большим заданием'} <span aria-hidden="true">↗</span></button>
          {!full?<ShortStudy key={lesson.id} lesson={lesson} state={studyState} home={homeHref()} question={<QuestionQuiz key={lesson.id+'-short'} question={briefQuestion(lesson)} index={0} total={1} stored={session.answer} onAnswer={answer=>studyState.updateSession(lesson.id,{answer})}/>} next={position<lessons.length-1?lessonLink(lessons[position+1],'next',true):<a className="study-secondary" href={homeHref()+'#situations'}>попробовать ситуацию →</a>}/>:<>
          <p className="lead">{lesson.lead}</p><p className="lesson-outcome"><strong>после урока:</strong> {lesson.outcome}</p>
          {lesson.foundation&&<aside className="book-foundation"><h2>{lesson.foundation.title}</h2><p>{lesson.foundation.text}</p></aside>}
          <nav className="reading-shortcuts" aria-label="разделы урока"><a href="#explanation">разбор</a><a href="#case">пример</a><a href="#practice">задание</a><a href="#questions">проверка</a></nav>
          <details className="reading-outline"><summary>план урока · {lesson.sections.length} разборов</summary><ol>{lesson.sections.map((section,i)=><li key={section.title}><a href={'#part-'+(i+1)}>{section.title.replace(/^\d+\.\s*/,'')}</a></li>)}</ol></details>
          <div className="reading-rule" aria-hidden="true"/>
          <div id="explanation">{lesson.sections.map((section,i)=><React.Fragment key={section.title}><section id={'part-'+(i+1)} className="lesson-section"><h2>{section.title}</h2><Paragraphs text={section.text}/></section>{i===1&&lesson.id==='technology-path'&&<Flow/>}</React.Fragment>)}</div>
          <aside className="example" id="case"><span className="eyebrow">разобранный случай · учебный пример</span><h2>{lesson.example.title}</h2><Paragraphs text={lesson.example.text}/></aside>
          {lesson.id==='money-break-even'&&<Calculator/>}
          <section className="exercise" id="practice"><span className="eyebrow">практика · на своём проекте</span><h2>твоё задание</h2><ol>{lesson.task.steps.map(step=><li key={step}>{step}</li>)}</ol><p className="task-result"><strong>что должно получиться:</strong> {lesson.task.result}</p><details className="task-solution"><summary>посмотреть образец и сверить свою работу</summary><Paragraphs text={lesson.task.solution}/></details><label className="practice-check"><input type="checkbox" checked={entry.practice} onChange={event=>update(lesson,{practice:event.target.checked})}/><span>задание выполнено, результат у меня есть</span></label></section>
          <section id="questions" className="questions-section" aria-labelledby="questions-title"><h2 id="questions-title">проверь понимание</h2><p>выбери ответ и прочитай объяснение. при ошибке можно попробовать ещё раз.</p>{lesson.questions.map((question,i)=><QuestionQuiz key={lesson.id+'-'+i} question={question} index={i} stored={entry.answers[i]} onAnswer={value=>update(lesson,{answer:{index:i,value}})}/>)}</section>
          <div className="lesson-completion" role="status">{complete?<><CheckAllIcon/><span>{completed===lessons.length?'все '+lessonCount(lessons.length)+' завершены. теперь проверь итоговую работу на реальном проекте.':'урок завершён. можно идти дальше.'}</span></>:<span>чтобы завершить урок, выполни задание, поставь отметку и правильно ответь на оба вопроса.</span>}</div>
          <p className={'storage-note '+(issue?'storage-warning':'')} role={issue?'status':undefined}>{message}</p>
          <details className="source-list"><summary>источники и дополнительное чтение</summary><p>ссылки проверены 8 октября 2026. истории, суммы, задания и способы их применения составлены для курса; они не являются обещанием заработка.</p><ul>{lesson.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></details>
          <nav className="lesson-bottom" aria-label="переход между уроками">{position>0?lessonLink(lessons[position-1],'prev'):<span/>}{position<lessons.length-1?lessonLink(lessons[position+1],'next'):<a className="next-link" href={homeHref()+'#program'}>к программе курса</a>}</nav>
          {position<lessons.length-1&&<p className="next-lesson-title">дальше: {lessons[position+1].shortTitle}</p>}
          </>}
        </article>
      </main>
    </div><footer className="site-footer"><span>разобраться.</span><span>{completed} из {lessons.length} уроков завершено</span></footer>
  </>
}
function ScenarioPage(){
  const id=new URLSearchParams(location.search).get('case'),scenario=scenarios.find(item=>item.id===id),state=useStudyProgress()
  const topic=topics.find(item=>item.slug===scenario?.topic)??topics[0]
  useEffect(()=>{document.title=(scenario?.title??'ситуация не найдена')+' — разобраться'},[scenario])
  const related=lessons.find(lesson=>lesson.id===scenario?.related)
  return <><a className="skip" href="#scenario">к ситуации</a><Header reading topic={topic}/><main className="scenario-main" id="scenario" style={{'--accent':topic.color} as React.CSSProperties}><a className="back-to-discs" href={homeHref()+'#situations'}><ArrowLeftIcon size={20}/>к ситуациям</a>{scenario?<><ScenarioStudy scenario={scenario} state={state}/><nav className="scenario-bottom" aria-label="после ситуации"><a className="study-primary" href={homeHref()+'#situations'}>на сегодня закончить</a>{related&&<a className="study-secondary" href={lessonHref(topic,related)+'&mode=full'}>связанный полный урок</a>}</nav></>:<><h1>такой ситуации нет</h1><p>можно выбрать другую на главной.</p><a href={homeHref()+'#situations'}>выбрать ситуацию</a></>}</main><footer className="site-footer"><span>разобраться.</span><span>одного шага достаточно</span></footer></>
}
createRoot(document.getElementById('root')!).render(isReader?(new URLSearchParams(location.search).has('case')?<ScenarioPage/>:<Reader/>):<Home/>)
