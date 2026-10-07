import lessonData from './lessons.json'
export const lessons = lessonData
export type Lesson = typeof lessons[number]
export const topics = [
  {slug:'sales',title:'продажи',lessonId:4,art:'sales.png',color:'#ff805f',description:'найди конкретного клиента и пойми, за какой результат он готов платить.',alt:'пальмы на берегу бирюзового моря на закате'},
  {slug:'vibe-code',title:'vibe code',lessonId:2,art:'vibe-code.png',color:'#8798ff',description:'поручи ии небольшую задачу и проверь её на живом проекте.',alt:'ретро-компьютер в синем и зелёном свете'},
  {slug:'money',title:'деньги',lessonId:3,art:'money.png',color:'#ffcd50',description:'посчитай расходы, остаток с продажи и сколько заказов покрывает затраты.',alt:'апельсины и дольки на солнечно-жёлтом фоне'},
  {slug:'technology',title:'технологии',lessonId:1,art:'technology.png',color:'#50d4bd',description:'проследи путь от нажатия кнопки до сохранённой записи.',alt:'стеклянная призма и отражения в бирюзовой воде'},
  {slug:'opportunities',title:'возможности',lessonId:5,art:'opportunities.png',color:'#ff9caa',description:'разбери новость и придумай небольшой опыт, который проверит идею.',alt:'серфер на морской волне на коралловом рассвете'},
  {slug:'thinking',title:'мышление',lessonId:6,art:'thinking.png',color:'#d4a5ff',description:'найди источник и отдели наблюдение от вывода, который ещё нужно проверить.',alt:'воздушные шары над горами на лиловом рассвете'},
] as const
export type Topic = typeof topics[number]
export const lessonFor = (topic:Topic) => lessons.find(lesson=>lesson.id===topic.lessonId)!
export const homeHref = (topic?:Topic) => import.meta.env.BASE_URL+(topic?'?topic='+topic.slug:'')
export const assetHref = (path:string) => import.meta.env.BASE_URL+path
export const lessonHref = (topic:Topic) => import.meta.env.BASE_URL+'learn.html?topic='+topic.slug
export function topicFromUrl(){return topics.find(topic=>topic.slug===new URLSearchParams(location.search).get('topic'))??topics[0]}
