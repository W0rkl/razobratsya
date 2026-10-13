import {useEffect,useState} from 'react'
import type {Question} from '../data/lesson-types'
import {CheckAllIcon} from './icons'
import {SparklesText} from './ui/sparkles-text'
export default function QuestionQuiz({question,index,stored,onAnswer,total=2}:{question:Question;index:number;stored:number|null;onAnswer:(value:number)=>void;total?:number}){
  const [choice,setChoice]=useState<number|null>(stored),[submitted,setSubmitted]=useState<number|null>(stored)
  useEffect(()=>{setChoice(stored);setSubmitted(stored)},[stored])
  const correct=submitted===question.answer
  return <form className="quiz" onSubmit={event=>{event.preventDefault();if(choice===null||correct)return;onAnswer(choice);setSubmitted(choice)}}>
    <span className="eyebrow">{total===1?'один вопрос':'вопрос '+(index+1)+' из '+total}</span><fieldset><legend>{question.prompt}</legend>{question.options.map((option,i)=><label key={option}><input type="radio" name={'answer-'+index} value={i} checked={choice===i} disabled={correct} onChange={()=>{setChoice(i);setSubmitted(null)}} required/><span>{option}</span></label>)}</fieldset>
    <button className="quiz-submit" type="submit" disabled={choice===null||correct}>{correct?'ответ проверен':submitted!==null?'проверить ещё раз':'проверить ответ'}</button>
    <div className={'feedback '+(correct?'correct':'incorrect')} role="status" aria-live="polite">{submitted!==null&&<><div className="answer-heading">{correct?<><CheckAllIcon/><SparklesText text="верно" sparklesCount={5} colors={{first:'#ffffff',second:'#c8e7a0'}} className="answer-sparkles"/></>:'пока нет'}</div><p>{question.explanation}</p></>}</div>
  </form>
}
