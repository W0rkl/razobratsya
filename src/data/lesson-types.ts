export type Question = { prompt:string; options:string[]; answer:number; explanation:string }
export type Lesson = {
  id:string; topic:string; slug:string; shortTitle:string; title:string; minutes:number;
  lead:string; outcome:string; sections:{title:string;text:string}[];
  example:{title:string;text:string}; task:{steps:string[];result:string;solution:string};
  questions:Question[]; sources:{label:string;url:string}[];
  foundation?:{title:string;text:string};
}
