import test from 'node:test'
import assert from 'node:assert/strict'
import {lessons} from '../src/data/curriculum.ts'
import {progressKey,decodeProgress,loadProgress,saveProgress,emptyEntry,isComplete} from '../src/data/progress.ts'

test('18 lessons cover six modules and have usable tasks, explanations and quizzes',()=>{
  assert.equal(lessons.length,18)
  assert.equal(new Set(lessons.map(l=>l.id)).size,18)
  assert.equal(new Set(lessons.map(l=>l.topic+'/'+l.slug)).size,18)
  for(const topic of ['sales','vibe-code','money','technology','opportunities','thinking'])assert.equal(lessons.filter(l=>l.topic===topic).length,3)
  for(const lesson of lessons){
    assert.equal(lesson.sections.length,4,lesson.id)
    assert.ok(lesson.sections.every(section=>section.text.length>200),lesson.id)
    assert.ok(lesson.task.steps.length>=4&&lesson.task.solution.length>100,lesson.id)
    assert.equal(lesson.questions.length,2,lesson.id)
    for(const question of lesson.questions){
      assert.ok(Number.isInteger(question.answer)&&question.answer>=0&&question.answer<question.options.length,lesson.id)
      assert.equal(new Set(question.options).size,question.options.length,lesson.id)
      assert.ok(question.explanation.length>50,lesson.id)
    }
    assert.ok(lesson.sources.every(source=>new URL(source.url).protocol==='https:'),lesson.id)
  }
})
test('completion needs practice and both correct submitted answers',()=>{
  const lesson=lessons[0],entry=emptyEntry(lesson)
  assert.equal(isComplete(lesson,entry),false)
  entry.practice=true
  entry.answers[0]=lesson.questions[0].answer
  assert.equal(isComplete(lesson,entry),false)
  entry.answers[1]=lesson.questions[1].answer
  assert.equal(isComplete(lesson,entry),true)
  entry.practice=false
  assert.equal(isComplete(lesson,entry),false)
})
test('save/load keeps wrong attempts and practice without falsely completing',()=>{
  let raw:string|null=null
  const store={getItem:(key:string)=>{assert.equal(key,progressKey);return raw},setItem:(key:string,value:string)=>{assert.equal(key,progressKey);raw=value}}
  const lesson=lessons[0],entry=emptyEntry(lesson)
  entry.practice=true;entry.answers=[0,lesson.questions[1].answer]
  assert.equal(saveProgress(store,{[lesson.id]:entry}),true)
  assert.deepEqual(loadProgress(store,lessons),{progress:{[lesson.id]:entry},issue:null})
  assert.equal(isComplete(lesson,loadProgress(store,lessons).progress[lesson.id]),false)
})
test('damaged storage is reported, invalid entries dropped and valid work retained',()=>{
  const a=lessons[0],b=lessons[1],valid=emptyEntry(b)
  const raw=JSON.stringify({version:1,lessons:{[a.id]:{practice:true,answers:[999,1]},[b.id]:valid}})
  assert.deepEqual(decodeProgress(raw,lessons),{progress:{[b.id]:valid},issue:'damaged'})
  assert.deepEqual(decodeProgress('{',lessons),{progress:{},issue:'damaged'})
  assert.deepEqual(decodeProgress('null',lessons),{progress:{},issue:'damaged'})
})
test('denied storage never throws and memory entry can still be completed',()=>{
  const denied={getItem:()=>{throw Error('denied')},setItem:()=>{throw Error('quota')}}
  assert.deepEqual(loadProgress(denied,lessons),{progress:{},issue:'unavailable'})
  const lesson=lessons[0],entry={practice:true,answers:lesson.questions.map(q=>q.answer)}
  assert.equal(saveProgress(denied,{[lesson.id]:entry}),false)
  assert.equal(isComplete(lesson,entry),true)
})
test('empty and old-version storage do not invent completed lessons',()=>{
  assert.deepEqual(decodeProgress(null,lessons),{progress:{},issue:null})
  assert.deepEqual(decodeProgress('{"version":99,"lessons":{}}',lessons),{progress:{},issue:'damaged'})
})
