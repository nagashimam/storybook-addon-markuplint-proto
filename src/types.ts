export interface Message {
  title: string;
  description: string;
}

export interface Result {
  danger: Message[];
  warning: Message[];
}
