import test from 'node:test'
import assert from 'node:assert/strict'
import {lessons} from '../src/data/curriculum.ts'
import {programBlocks,blocksForTopic,blockForLesson} from '../src/data/program.ts'
import {progressKey,decodeProgress,loadProgress,saveProgress,emptyEntry,isComplete} from '../src/data/progress.ts'
import {briefs,briefQuestion} from '../src/data/briefs.ts'
import {scenarios} from '../src/data/scenarios.ts'
import {studyKey,emptyStudy,emptySession,emptyCase,decodeStudy,loadStudy,saveStudy,nextSession,nextCase,resumeLesson,sessionReady,caseReady,mergeUnsaved,mergeRead} from '../src/data/study-progress.ts'
import {fullReadingMode,modeSuffix} from '../src/data/reading-mode.ts'

test('30 lessons cover six topics, with deeper sales and money blocks',()=>{
  assert.equal(lessons.length,30)
  assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length)
  assert.equal(new Set(lessons.map(l=>l.topic+'/'+l.slug)).size,lessons.length)
  for(const [topic,count] of Object.entries({sales:9,'vibe-code':3,money:9,technology:3,opportunities:3,thinking:3}))assert.equal(lessons.filter(l=>l.topic===topic).length,count)
  for(const lesson of lessons){
    assert.equal(lesson.sections.length,6,lesson.id)
    assert.equal(new Set(lesson.sections.map(section=>section.title)).size,lesson.sections.length,lesson.id)
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
test('blocks form one ordered program, without missing or duplicated lessons',()=>{
  assert.equal(programBlocks.length,10)
  const ids=programBlocks.flatMap(block=>block.lessonIds)
  assert.equal(new Set(ids).size,lessons.length)
  assert.deepEqual(ids,lessons.map(lesson=>lesson.id))
  for(const block of programBlocks){
    assert.equal(block.lessonIds.length,3)
    assert.ok(blocksForTopic(block.topic).includes(block))
    for(const id of block.lessonIds){
      const lesson=lessons.find(value=>value.id===id)!
      assert.equal(lesson.topic,block.topic)
      assert.equal(blockForLesson(id),block)
    }
  }
  assert.equal(lessons.at(-1)?.id,'thinking-project')
})
test('existing lesson progress remains usable after reordering and expansion',()=>{
  const legacyIds=['sales-client','sales-offer','sales-repeat','vibe-code-task','vibe-code-debug','vibe-code-release','money-order','money-break-even','money-cash','technology-path','technology-api','technology-choice','opportunities-change','opportunities-test','opportunities-decision','thinking-source','thinking-numbers','thinking-project']
  const oldEntries=Object.fromEntries(legacyIds.map(id=>[id,{practice:true,answers:[0,1]}]))
  const decoded=decodeProgress(JSON.stringify({version:1,lessons:oldEntries}),lessons)
  assert.equal(decoded.issue,null)
  assert.deepEqual(decoded.progress,oldEntries)
  assert.equal(progressKey,'razobratsya-learning-v3')
  for(const lesson of lessons.filter(item=>!legacyIds.includes(item.id)))assert.equal(decoded.progress[lesson.id],undefined)
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

test('every existing lesson has one small actionable brief; five scenarios have valid routes and sources',()=>{
  assert.deepEqual(Object.keys(briefs).sort(),lessons.map(lesson=>lesson.id).sort())
  for(const brief of Object.values(briefs))assert.ok(brief.idea.length>100&&brief.prompt.length>30&&brief.placeholder.length>20)
  assert.equal(scenarios.length,5)
  assert.equal(new Set(scenarios.map(item=>item.id)).size,5)
  for(const scenario of scenarios){
    assert.ok(lessons.some(lesson=>lesson.id===scenario.related&&lesson.topic===scenario.topic))
    assert.ok(scenario.options.length>=2&&scenario.choices.length>=2)
    assert.ok(scenario.news.length>100&&scenario.takeaway.length>150)
    assert.ok(scenario.options.every(option=>option.feedback.length>60))
    assert.ok(scenario.sources.every(source=>new URL(source.url).protocol==='https:'))
  }
})
test('short session preserves its note and stage and never completes the full lesson',()=>{
  const lesson=lessons[0]
  let study=nextSession(emptyStudy(),lesson.id,{step:1,note:'проверю последний случай клиента'})
  study=nextSession(study,lesson.id,{step:2})
  assert.equal(study.sessions[lesson.id].step,2)
  assert.equal(sessionReady(lesson.id,study.sessions[lesson.id]),false)
  study=nextSession(study,lesson.id,{answer:lesson.questions[0].answer,step:3})
  assert.equal(study.sessions[lesson.id].step,3)
  assert.equal(isComplete(lesson,emptyEntry(lesson)),false)
  assert.equal(study.lastLesson,lesson.id)
  assert.deepEqual(decodeStudy(JSON.stringify({version:1,...study})).study,study)
})
test('blank notes and wrong answers cannot become finished short sessions',()=>{
  const lesson=lessons[0]
  const noNote=nextSession(emptyStudy(),lesson.id,{step:3,answer:lesson.questions[0].answer})
  assert.equal(noNote.sessions[lesson.id].step,1)
  const wrong=nextSession(emptyStudy(),lesson.id,{step:3,note:'проверю последний случай',answer:(lesson.questions[0].answer+1)%lesson.questions[0].options.length})
  assert.equal(wrong.sessions[lesson.id].step,2)
  assert.equal(sessionReady(lesson.id,wrong.sessions[lesson.id]),false)
})
test('home resumes the last unfinished selected topic, then finds another step',()=>{
  const lesson=lessons.find(item=>item.topic==='technology')!
  let study=nextSession(emptyStudy(),lesson.id,{step:1,note:'уточню путь заявки'})
  assert.equal(resumeLesson(study).id,lesson.id)
  study=nextSession(study,lesson.id,{step:3,answer:briefQuestion(lesson).answer})
  assert.equal(resumeLesson(study).id,lessons[0].id)
  assert.equal(resumeLesson(emptyStudy(),[lessons[0].id]).id,lessons[1].id)
})
test('scenario completion requires two decisions and a note; unfinished data survives reload',()=>{
  const scenario=scenarios[0]
  let study=nextCase(emptyStudy(),scenario.id,{first:1,note:'проверю время согласования'})
  assert.equal(caseReady(scenario.id,study.cases[scenario.id]),false)
  study=nextCase(study,scenario.id,{done:true})
  assert.equal(study.cases[scenario.id].done,false)
  study=nextCase(study,scenario.id,{second:2,done:true})
  assert.equal(study.cases[scenario.id].done,true)
  assert.deepEqual(decodeStudy(JSON.stringify({version:1,...study})).study,study)
})
test('damaged study keeps valid records and rejects unsupported stages, indices and oversized notes',()=>{
  const a=lessons[0],b=lessons[1],scenario=scenarios[0]
  const raw=JSON.stringify({version:1,lastLesson:b.id,sessions:{[a.id]:{...emptySession(),step:99},[b.id]:{...emptySession(),step:1,note:'одна полезная запись'}},cases:{[scenario.id]:{...emptyCase(),second:99}}})
  const loaded=decodeStudy(raw)
  assert.equal(loaded.issue,'damaged')
  assert.equal(loaded.study.sessions[a.id],undefined)
  assert.equal(loaded.study.sessions[b.id].note,'одна полезная запись')
  assert.equal(loaded.study.cases[scenario.id],undefined)
  assert.equal(nextSession(emptyStudy(),a.id,{note:'x'.repeat(2001)}).sessions[a.id],undefined)
  assert.equal(decodeStudy('{').issue,'damaged')
  assert.equal(decodeStudy('null').issue,'damaged')
  assert.equal(decodeStudy('{"version":99}').issue,'damaged')
  assert.deepEqual(nextSession(emptyStudy(),'unknown',{step:1}),emptyStudy())
})
test('study storage is separate from legacy progress, and denied storage leaves a usable memory snapshot',()=>{
  const legacy=JSON.stringify({version:1,lessons:{[lessons[0].id]:emptyEntry(lessons[0])}})
  const data=new Map([[progressKey,legacy]])
  const store={getItem:(key:string)=>data.get(key)??null,setItem:(key:string,value:string)=>{data.set(key,value)}}
  const study=nextSession(emptyStudy(),lessons[0].id,{note:'моя небольшая запись',step:1})
  assert.notEqual(studyKey,progressKey)
  assert.equal(saveStudy(store,study),true)
  assert.equal(data.get(progressKey),legacy)
  assert.deepEqual(loadStudy(store).study,study)
  const denied={getItem:()=>{throw Error('denied')},setItem:()=>{throw Error('quota')}}
  assert.equal(loadStudy(denied).issue,'unavailable')
  assert.equal(saveStudy(denied,study),false)
  assert.equal(study.sessions[lessons[0].id].note,'моя небольшая запись')
})
test('unsaved draft survives cross-tab storage events while unrelated saved changes are accepted',()=>{
  const a=lessons[0],b=lessons[1]
  const memory=nextSession(emptyStudy(),a.id,{step:1,note:'несохранённая запись в первой вкладке'})
  let latest=nextSession(emptyStudy(),a.id,{note:'старый сохранённый текст'})
  latest=nextSession(latest,b.id,{step:1,note:'новая запись из другой вкладки'})
  const merged=mergeUnsaved(latest,memory,{sessions:new Set([a.id]),cases:new Set(),lastLesson:true})
  assert.equal(merged.sessions[a.id].note,memory.sessions[a.id].note)
  assert.equal(merged.sessions[b.id].note,latest.sessions[b.id].note)
  assert.equal(merged.lastLesson,a.id)
  assert.equal(mergeUnsaved(emptyStudy(),memory,{sessions:new Set([a.id]),cases:new Set(),lastLesson:true}).sessions[a.id].note,memory.sessions[a.id].note)
})
test('selected short question uses matching acceptance rules without changing full questions',()=>{
  const release=lessons.find(lesson=>lesson.id==='vibe-code-release')!
  const question=briefQuestion(release)
  assert.equal(question,release.questions[1])
  assert.match(question.prompt,/публикация/)
  const complete=nextSession(emptyStudy(),release.id,{step:3,note:'проверю форму после публикации',answer:question.answer})
  assert.equal(complete.sessions[release.id].step,3)
  assert.deepEqual(decodeStudy(JSON.stringify({version:1,...complete})).study,complete)
  assert.equal(sessionReady(release.id,{step:2,note:'проверю форму после публикации',answer:(question.answer+1)%question.options.length}),false)
  for(const lesson of lessons)assert.ok(briefQuestion(lesson))
})
test('read access denied after a successful load keeps all known records before a new update',()=>{
  const a=lessons[0],b=lessons[1]
  let memory=nextSession(emptyStudy(),a.id,{step:1,note:'раньше сохранённая заметка'})
  memory=nextSession(memory,b.id,{step:1,note:'сохранённая другая тема'})
  memory=nextCase(memory,scenarios[0].id,{first:1,note:'другая сохранённая ситуация'})
  const merged=mergeRead({study:emptyStudy(),issue:'unavailable'},memory,{sessions:new Set(),cases:new Set(),lastLesson:false})
  assert.deepEqual(merged,memory)
  const changed=nextSession(merged,a.id,{step:2})
  assert.equal(changed.sessions[a.id].step,2)
  assert.equal(changed.sessions[a.id].note,memory.sessions[a.id].note)
  assert.deepEqual(changed.sessions[b.id],memory.sessions[b.id])
  assert.deepEqual(changed.cases,memory.cases)
})
test('ordinary and legacy sales URLs show full explanation; short mode is explicit and round-trips',()=>{
  assert.equal(fullReadingMode('?topic=sales&lesson=client'),true)
  assert.equal(fullReadingMode('?topic=sales&lesson=client&mode=full'),true)
  assert.equal(fullReadingMode('?topic=sales&mode=unknown'),true)
  assert.equal(fullReadingMode('?topic=sales&lesson=client&mode=short'),false)
  assert.equal(fullReadingMode('?topic=money'+modeSuffix(false)),false)
  assert.equal(fullReadingMode('?topic=money'+modeSuffix(true)),true)
})
test('reframed sales examples keep historic answer meanings at the same stored positions',()=>{
  const historicAnswers:Record<string,number[]>={'sales-client':[1,2],'sales-conversation':[1,2],'sales-trust':[1,0],'sales-influence':[2,0],'sales-urgency':[2,1],'sales-offer':[1,1],'sales-copy':[0,1],'sales-copy-test':[1,2],'sales-repeat':[0,1]}
  const stored=Object.fromEntries(Object.entries(historicAnswers).map(([id,answers])=>[id,{answers,practice:true}]))
  const decoded=decodeProgress(JSON.stringify({version:1,lessons:stored}),lessons)
  assert.equal(decoded.issue,null)
  for(const lesson of lessons.filter(item=>item.topic==='sales')){
    assert.deepEqual(lesson.questions.map(question=>question.answer),historicAnswers[lesson.id])
    assert.equal(isComplete(lesson,decoded.progress[lesson.id]),true)
  }
})
