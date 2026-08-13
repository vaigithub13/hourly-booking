import { LangObject } from "./../../types/common-types";
import { FAQ } from "./faqs.model";

export interface CreateFAQ {
  title: LangObject;
  question: LangObject;
  answer: LangObject;
}
export interface UpdateFAQ {
  id: number;
  title?: LangObject;
  question?: LangObject;
  answer?: LangObject;
}
export interface FaqResponse {
  id: number;
  title: string | LangObject;
  question: string | LangObject;
  answer: string | LangObject;
}
export interface GetFaqsQuery {
  search?: string;
}

export const faqResponse = (
  faq: FAQ,
  langCode: string,
  isAdmin: boolean = false
) => {
  const { id, title, question, answer } = faq;
  const response: FaqResponse = {
    id,
    title: isAdmin ? title : title[langCode],
    question: isAdmin ? question : question[langCode],
    answer: isAdmin ? answer : answer[langCode],
  };
  return response;
};
