export type ID = string | number;

export type Column = {
  id: ID;
  title: string;
};

export type Task = {
  id: ID;
  columnId: ID;
  content: string;
};
