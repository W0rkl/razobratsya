export type ProgramBlock={topic:string;slug:string;title:string;description:string;lessonIds:string[]}
export const programBlocks:ProgramBlock[]=[
  {topic:'sales',slug:'understand',title:'клиент, разговор и доверие',description:'разобраться в работе человека и собрать доказательства под своё предложение.',lessonIds:['sales-client','sales-conversation','sales-trust']},
  {topic:'sales',slug:'agreement',title:'влияние и договорённость',description:'предложить добровольную пробу, объяснить ограничения и согласовать условия.',lessonIds:['sales-influence','sales-urgency','sales-offer']},
  {topic:'sales',slug:'text',title:'текст, проверка и повторная продажа',description:'написать объявление, проверить понимание и передать полезный результат.',lessonIds:['sales-copy','sales-copy-test','sales-repeat']},
  {topic:'vibe-code',slug:'build',title:'задача, ошибка и выпуск',description:'работать с помощником короткими проверяемыми изменениями.',lessonIds:['vibe-code-task','vibe-code-debug','vibe-code-release']},
  {topic:'money',slug:'foundation',title:'картина денег',description:'различать имущество, поток, личные выплаты и экономику заказа.',lessonIds:['money-map','money-budget','money-order']},
  {topic:'money',slug:'economics',title:'экономика и риск',description:'посчитать нужный объём, даты денег и последствия плохого сценария.',lessonIds:['money-break-even','money-cash','money-risk']},
  {topic:'money',slug:'development',title:'повторяемая работа и развитие',description:'создавать полезные рабочие ресурсы, выбирать вложения и сверять факты.',lessonIds:['money-ownership','money-reinvest','money-review']},
  {topic:'technology',slug:'systems',title:'как устроен и выбирается инструмент',description:'проследить данные, прочитать контракт api и выбрать подходящий способ работы.',lessonIds:['technology-path','technology-api','technology-choice']},
  {topic:'opportunities',slug:'experiment',title:'новость, опыт и решение',description:'найти изменение, проверить одно неизвестное и выбрать следующий шаг.',lessonIds:['opportunities-change','opportunities-test','opportunities-decision']},
  {topic:'thinking',slug:'evidence',title:'источники, числа и свой проект',description:'проверить основания выводов и собрать итоговую работу.',lessonIds:['thinking-source','thinking-numbers','thinking-project']}
]
export const blocksForTopic=(topic:string)=>programBlocks.filter(block=>block.topic===topic)
export const blockForLesson=(id:string)=>programBlocks.find(block=>block.lessonIds.includes(id))!
