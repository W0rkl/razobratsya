import {lessons} from './curriculum'
export {lessons}
export type {Lesson,Question} from './curriculum'
export {programBlocks,blocksForTopic,blockForLesson} from './program'
export const topics = [
  {slug:'sales',title:'продажи',art:'sales.png',color:'#ff805f',description:'девять связанных глав: решение покупателя, разговор, доверие, показ пользы, сомнения, цена, текст, проверка и повтор.',alt:'пальмы на берегу бирюзового моря на закате'},
  {slug:'vibe-code',title:'vibe code',art:'vibe-code.png',color:'#8798ff',description:'поставь задачу помощнику, найди ошибку и доведи рабочую версию до публикации.',alt:'ретро-компьютер в синем и зелёном свете'},
  {slug:'money',title:'деньги',art:'money.png',color:'#ffcd50',description:'активы и поток, бюджет, экономика заказа, риск долга и повторяемые источники поступлений.',alt:'апельсины и дольки на солнечно-жёлтом фоне'},
  {slug:'technology',title:'технологии',art:'technology.png',color:'#50d4bd',description:'разберись с хранением, api и выбором между таблицей, сайтом и сервером.',alt:'стеклянная призма и отражения в бирюзовой воде'},
  {slug:'opportunities',title:'возможности',art:'opportunities.png',color:'#ff9caa',description:'найди изменение в новости, поставь небольшой опыт и реши, продолжать ли.',alt:'серфер на морской волне на коралловом рассвете'},
  {slug:'thinking',title:'мышление',art:'thinking.png',color:'#d4a5ff',description:'проверь источники и числа, затем собери всё в итоговую работу.',alt:'воздушные шары над горами на лиловом рассвете'},
] as const
export type Topic = typeof topics[number]
export const topicLessons = (topic:Topic) => lessons.filter(lesson=>lesson.topic===topic.slug)
export const lessonFor = (topic:Topic,slug?:string) => topicLessons(topic).find(lesson=>lesson.slug===slug)??topicLessons(topic)[0]
export const topicMinutes = (topic:Topic) => topicLessons(topic).reduce((total,lesson)=>total+lesson.minutes,0)
export const homeHref = (topic?:Topic) => import.meta.env.BASE_URL+(topic?'?topic='+topic.slug:'')
export const assetHref = (path:string) => import.meta.env.BASE_URL+path
export const lessonHref = (topic:Topic,lesson=lessonFor(topic)) => import.meta.env.BASE_URL+'learn.html?topic='+topic.slug+'&lesson='+lesson.slug
export function topicFromUrl(){return topics.find(topic=>topic.slug===new URLSearchParams(location.search).get('topic'))??topics[0]}
export function routeFromUrl(){const topic=topicFromUrl();return {topic,lesson:lessonFor(topic,new URLSearchParams(location.search).get('lesson')??undefined)}}
