export interface Topic {
  id: string;
  title: string;
  description?: string;
  subTopics?: Topic[]; // iç içe
}