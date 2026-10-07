import React,{useEffect,useRef,useState,type MouseEvent} from 'react'
import {createRoot} from 'react-dom/client'
import DiscCascadeCarousel,{type DiscCascadeItem} from '@/components/ui/disc-cascade-carousel'
import StackTower from '@/components/ui/stack-tower'
import {SparklesText} from '@/components/ui/sparkles-text'
import {ArrowLeftIcon,CheckAllIcon} from '@/components/icons'
import {topics,lessons,lessonFor,topicLessons,topicMinutes,lessonHref,homeHref,assetHref,topicFromUrl,routeFromUrl,type Topic,type Question} from '@/data/course'
import {emptyEntry,isComplete} from '@/data/progress'
import {useCourseProgress} from '@/use-course-progress'
import './styles.css'

const currency=(n:number)=>new Intl.NumberFormat('ru-RU').format(n)+' ₽'
const isReader=location.pathname.endsWith('/learn.html')
const totalMinutes=lessons.reduce((sum,lesson)=>sum+lesson.minutes,0)

function Header({reading=false,topic=topicFromUrl()}:{reading?:boolean;topic?:Topic}){
  return <header className="site-header"><a className="wordmark" href={homeHref()}>разобраться<span>.</span></a><nav aria-label="страницы"><a href={homeHref()} aria-current={!reading?'page':undefined}>главная</a><a href={lessonHref(topic)} aria-current={reading?'page':undefined}>обучение</a></nav></header>
}
function Paragraphs({text}:{text:string}){return <>{text.split('\n\n').map((paragraph,i)=><p key={i}>{paragraph}</p>)}</>}
function Home(){
  const [active,setActive]=useState(()=>Math.max(0,topics.indexOf(topicFromUrl())))
  const [paused,setPaused]=useState(false)
  const {progress,message}=useCourseProgress()
  const selected=topics[active]
  const completed=lessons.filter(lesson=>isComplete(lesson,progress[lesson.id])).length
  const resume=lessons.find(lesson=>!isComplete(lesson,progress[lesson.id]))??lessons[0]
  const resumeTopic=topics.find(topic=>topic.slug===resume.topic)!
  useEffect(()=>{document.title='разобраться — обучение и практика'},[])
  const discs:DiscCascadeItem[]=topics.map(topic=>({title:topic.title,src:assetHref('art/'+topic.art),alt:topic.alt,label:topic.title,labelStyle:'arc',ink:'#ffffff',fine:'разобраться · 3 урока'}))
  return <>
    <a className="skip" href="#program">к программе курса</a><Header topic={selected}/>
    <main className="home-main">
      <section className="welcome" aria-labelledby="welcome-title">
        <div className="welcome-copy"><p className="small-label">6 тем / 18 уроков / свой проект</p><h1 id="welcome-title">разобраться.<br/>и попробовать.</h1><p>как найти клиента, посчитать деньги и собрать рабочую версию с ии. здесь ты пройдёшь весь путь на одной небольшой задаче.</p><p className="course-time">около {Math.round(totalMinutes/60)} часов на разборы и вопросы · практика в своём темпе</p><a className="start-course" href={lessonHref(resumeTopic,resume)}>{completed>0?'продолжить обучение':'начать с первого урока'} <span aria-hidden="true">→</span></a></div>
        <div className="tower-wrap" aria-hidden="true"><StackTower paused={paused}/></div>
      </section>
      <section id="topics" className="topic-picker" aria-label="выбор темы">
        <div className="picker-top"><h2>выбери свой диск</h2><button className="motion-toggle" onClick={()=>setPaused(value=>!value)} aria-pressed={paused}>{paused?'включить анимации':'остановить анимации'}</button></div>
        <DiscCascadeCarousel items={discs} height="520px" discSize="clamp(245px,30vw,365px)" index={active} onIndexChange={setActive} onSelect={(_,index)=>location.assign(lessonHref(topics[index]))} defaultIndex={0} spacing={.91} rise={.29} depth={.38} yaw={17} fan={-9} tilt={-6} roll={100} spin={paused?0:32} loop frame={false} reviews={false} details={false} indexLabel="" background="#000000" color="#ffffff" brand="" serif="Georgia,serif" sans="Arial,Helvetica,sans-serif" display="'Arial Black',Impact,Arial,sans-serif" hint="потяни диск или нажми клавиши ← →" ariaLabel="темы курса" className="course-discs"/>
        <div className="selected-topic"><div aria-live="polite"><p className="small-label">{String(active+1).padStart(2,'0')} / 06 · 3 урока · около {topicMinutes(selected)} минут</p><h2>{selected.title}</h2><p>{selected.description}</p></div><a className="open-lesson" href={lessonHref(selected)}>открыть обучение</a></div>
        <div className="topic-jumps" aria-label="перейти к диску">{topics.map((topic,i)=><button key={topic.slug} onClick={()=>setActive(i)} aria-pressed={i===active}>{topic.title}</button>)}</div>
      </section>
      <section className="course-program" id="program" aria-labelledby="program-title">
        <p className="small-label">читай по порядку или выбери нужную тему</p><h2 id="program-title">что ты пройдёшь</h2>
        <p className="program-intro">в каждом уроке — объяснение, разобранный случай, задание и два вопроса с разбором. результат курса — предложение услуги или небольшое приложение, расчёт и план его проверки.</p>
        <div className="progress-line"><label htmlFor="course-progress">завершено {completed} из 18 уроков</label><progress id="course-progress" value={completed} max={18}/></div><p className="storage-note">{message}</p>
        <ol className="program-list">{topics.map((topic,i)=><li key={topic.slug}><div><span className="small-label">{String(i+1).padStart(2,'0')}</span><h3>{topic.title}</h3><p>{topic.description}</p></div><ol>{topicLessons(topic).map(lesson=><li key={lesson.id}><a href={lessonHref(topic,lesson)}>{lesson.shortTitle}</a><span>{isComplete(lesson,progress[lesson.id])?'пройдено':lesson.minutes+' мин'}</span></li>)}</ol></li>)}</ol>
        <p className="course-method">как проходить: выбери один проект и делай все задания на нём. урок отмечается завершённым после отметки о практике и двух правильных ответов. это твоя отметка работы, а не проверка задания преподавателем.</p>
      </section>
    </main><footer className="site-footer"><span>разобраться.</span><span>от одной задачи до первой проверки</span></footer>
  </>
}

const flow=[['браузер','человек заполняет форму. браузер собирает данные и отправляет запрос на сервер. проверка полей на экране помогает заметить опечатки.'],['сервер','сервер проверяет данные и права пользователя. затем решает, можно ли выполнить действие. проверка в браузере не заменяет проверку на сервере.'],['база','сервер записывает заявку в базу данных. теперь её можно прочитать при следующем посещении. если запись не удалась, сервер должен сообщить об ошибке.'],['ответ','сервер возвращает результат. браузер показывает подтверждение или ошибку. при повторной отправке важно не создать две одинаковые заявки.']]
function Flow(){const [step,setStep]=useState(0);return <section className="demo" aria-label="путь запроса"><p className="demo-title">путь одной заявки · нажми на шаг</p><ol className="pipeline">{flow.map(([title],i)=><li key={title}><button type="button" onClick={()=>setStep(i)} aria-pressed={step===i}><span>{String(i+1).padStart(2,'0')}</span>{title}</button></li>)}</ol><p className="pipeline-description" aria-live="polite">{flow[step][1]}</p></section>}
function Calculator(){const [count,setCount]=useState(20);const profit=count*800-12000;return <section className="demo calculator" aria-label="пример расчёта прибыли"><p className="demo-title">условный сервис: цена 1 000 ₽, расходы на заказ 200 ₽,<br/>постоянные расходы 12 000 ₽ в месяц</p><label htmlFor="orders">заказов в месяц <output id="order-count" htmlFor="orders">{count}</output></label><input id="orders" type="range" min="0" max="50" value={count} onChange={event=>setCount(Number(event.target.value))}/><p className="calculation" aria-live="polite">выручка: {currency(count*1000)}<br/>после расходов на заказы: {currency(count*800)}<br/><strong>{profit<0?'убыток':profit===0?'результат':'прибыль'}: {currency(Math.abs(profit))}</strong></p><p className="demo-title model-note">упрощённый расчёт, без налогов и оплаты твоего труда</p></section>}

function QuestionQuiz({question,index,stored,onAnswer}:{question:Question;index:number;stored:number|null;onAnswer:(value:number)=>void}){
  const [choice,setChoice]=useState<number|null>(stored)
  const [submitted,setSubmitted]=useState<number|null>(stored)
  useEffect(()=>{setChoice(stored);setSubmitted(stored)},[stored])
  const correct=submitted===question.answer
  return <form className="quiz" onSubmit={event=>{event.preventDefault();if(choice===null||correct)return;onAnswer(choice);setSubmitted(choice)}}>
    <span className="eyebrow">вопрос {index+1} из 2</span><fieldset><legend>{question.prompt}</legend>{question.options.map((option,i)=><label key={option}><input type="radio" name={'answer-'+index} value={i} checked={choice===i} disabled={correct} onChange={()=>{setChoice(i);setSubmitted(null)}} required/><span>{option}</span></label>)}</fieldset>
    <button className="quiz-submit" type="submit" disabled={choice===null||correct}>{correct?'ответ проверен':submitted!==null?'проверить ещё раз':'проверить ответ'}</button>
    <div className={'feedback '+(correct?'correct':'incorrect')} role="status" aria-live="polite">{submitted!==null&&<><div className="answer-heading">{correct?<><CheckAllIcon/><SparklesText text="верно" sparklesCount={5} colors={{first:'#ffffff',second:'#c8e7a0'}} className="answer-sparkles"/></>:'пока нет'}</div><p>{question.explanation}</p></>}</div>
  </form>
}
function Reader(){
  const [route,setRoute]=useState(routeFromUrl)
  const [menuOpen,setMenuOpen]=useState(false)
  const mainRef=useRef<HTMLElement>(null),toggleRef=useRef<HTMLButtonElement>(null)
  const {progress,update,message,issue}=useCourseProgress()
  const {topic,lesson}=route
  const position=lessons.indexOf(lesson),moduleLessons=topicLessons(topic),modulePosition=moduleLessons.indexOf(lesson)
  const entry=progress[lesson.id]??emptyEntry(lesson)
  const completed=lessons.filter(item=>isComplete(item,progress[item.id])).length
  const complete=isComplete(lesson,entry)
  useEffect(()=>{const pop=()=>{setRoute(routeFromUrl());setMenuOpen(false)};addEventListener('popstate',pop);return()=>removeEventListener('popstate',pop)},[])
  useEffect(()=>{document.title=lesson.title+' — разобраться'},[lesson])
  useEffect(()=>{const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'&&menuOpen){setMenuOpen(false);toggleRef.current?.focus()}};addEventListener('keydown',escape);return()=>removeEventListener('keydown',escape)},[menuOpen])
  const navigate=(event:MouseEvent<HTMLAnchorElement>,nextTopic:Topic,nextLesson=lessonFor(nextTopic))=>{
    if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return
    event.preventDefault();history.pushState(null,'',lessonHref(nextTopic,nextLesson));setRoute({topic:nextTopic,lesson:nextLesson});setMenuOpen(false);mainRef.current?.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'})
  }
  const lessonLink=(item:typeof lesson,direction:'prev'|'next')=>{const nextTopic=topics.find(topic=>topic.slug===item.topic)!;return <a className={direction==='prev'?'prev-link':'next-link'} href={lessonHref(nextTopic,item)} onClick={event=>navigate(event,nextTopic,item)}>{direction==='prev'?<><ArrowLeftIcon size={20}/>предыдущий урок</>:'следующий урок'}</a>}
  return <>
    <a className="skip" href="#lesson" onClick={event=>{event.preventDefault();mainRef.current?.focus();mainRef.current?.scrollIntoView()}}>к уроку</a><Header reading topic={topic}/>
    <div className="reader-heading"><a className="back-to-discs" href={homeHref(topic)}><ArrowLeftIcon size={20}/>к дискам</a><button ref={toggleRef} className="contents-toggle" aria-expanded={menuOpen} aria-controls="contents" onClick={()=>setMenuOpen(open=>!open)}>оглавление <span aria-hidden="true">☰</span></button></div>
    <div className="reading-layout">
      <aside id="contents" className={'contents '+(menuOpen?'is-open':'')} aria-label="оглавление курса"><div className="contents-heading">программа <span>{completed} / 18</span></div><nav aria-label="темы и уроки">{topics.map((item,i)=><div key={item.slug}><a className={'lesson-link '+(item.slug===topic.slug?'current-module':'')} href={lessonHref(item)} onClick={event=>navigate(event,item)}><span className="lesson-number">{String(i+1).padStart(2,'0')}</span><span>{item.title}</span></a>{item.slug===topic.slug&&<ol className="module-lessons">{topicLessons(item).map((part,j)=><li key={part.id}><a href={lessonHref(item,part)} onClick={event=>navigate(event,item,part)} aria-current={part.id===lesson.id?'page':undefined}><span>{j+1}.</span> {part.shortTitle}{isComplete(part,progress[part.id])&&<span className="completed-label"> · пройдено</span>}</a></li>)}</ol>}</div>)}</nav><p className="aside-note">выбери один проект<br/>и делай задания на нём.</p></aside>
      <main className="lesson-main" id="lesson" ref={mainRef} tabIndex={-1} style={{'--accent':topic.color} as React.CSSProperties}>
        <article key={lesson.id}>
          <div className="lesson-meta"><span className="fraction">{String(position+1).padStart(2,'0')} / 18</span><span>около {lesson.minutes} минут на разбор</span><span>{topic.title} · {modulePosition+1} из 3</span></div>
          <h1>{lesson.title}</h1><p className="lead">{lesson.lead}</p><p className="lesson-outcome"><strong>после урока:</strong> {lesson.outcome}</p>
          <nav className="reading-shortcuts" aria-label="разделы урока"><a href="#explanation">разбор</a><a href="#case">пример</a><a href="#practice">задание</a><a href="#questions">проверка</a></nav>
          <div className="reading-rule" aria-hidden="true"/>
          <div id="explanation">{lesson.sections.map((section,i)=><React.Fragment key={section.title}><section className="lesson-section"><h2>{section.title}</h2><Paragraphs text={section.text}/></section>{i===1&&lesson.id==='technology-path'&&<Flow/>}</React.Fragment>)}</div>
          <aside className="example" id="case"><span className="eyebrow">разобранный случай · учебный пример</span><h2>{lesson.example.title}</h2><Paragraphs text={lesson.example.text}/></aside>
          {lesson.id==='money-break-even'&&<Calculator/>}
          <section className="exercise" id="practice"><span className="eyebrow">практика · на своём проекте</span><h2>твоё задание</h2><ol>{lesson.task.steps.map(step=><li key={step}>{step}</li>)}</ol><p className="task-result"><strong>что должно получиться:</strong> {lesson.task.result}</p><details className="task-solution"><summary>посмотреть образец и сверить свою работу</summary><Paragraphs text={lesson.task.solution}/></details><label className="practice-check"><input type="checkbox" checked={entry.practice} onChange={event=>update(lesson,{practice:event.target.checked})}/><span>задание выполнено, результат у меня есть</span></label></section>
          <section id="questions" className="questions-section" aria-labelledby="questions-title"><h2 id="questions-title">проверь понимание</h2><p>выбери ответ и прочитай объяснение. при ошибке можно попробовать ещё раз.</p>{lesson.questions.map((question,i)=><QuestionQuiz key={lesson.id+'-'+i} question={question} index={i} stored={entry.answers[i]} onAnswer={value=>update(lesson,{answer:{index:i,value}})}/>)}</section>
          <div className="lesson-completion" role="status">{complete?<><CheckAllIcon/><span>{completed===18?'все 18 уроков завершены. теперь проверь итоговую работу на реальном проекте.':'урок завершён. можно идти дальше.'}</span></>:<span>чтобы завершить урок, выполни задание, поставь отметку и правильно ответь на оба вопроса.</span>}</div>
          <p className={'storage-note '+(issue?'storage-warning':'')} role={issue?'status':undefined}>{message}</p>
          <details className="source-list"><summary>источники и дополнительное чтение</summary><p>ссылки проверены 8 октября 2026. истории, суммы, задания и способы их применения составлены для курса; они не являются обещанием заработка.</p><ul>{lesson.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a></li>)}</ul></details>
          <nav className="lesson-bottom" aria-label="переход между уроками">{position>0?lessonLink(lessons[position-1],'prev'):<span/>}{position<lessons.length-1?lessonLink(lessons[position+1],'next'):<a className="next-link" href={homeHref()+'#program'}>к программе курса</a>}</nav>
          {position<lessons.length-1&&<p className="next-lesson-title">дальше: {lessons[position+1].shortTitle}</p>}
        </article>
      </main>
    </div><footer className="site-footer"><span>разобраться.</span><span>{completed} из 18 уроков завершено</span></footer>
  </>
}
createRoot(document.getElementById('root')!).render(isReader?<Reader/>:<Home/>)
