import { InstaQLEntity } from "@instantdb/react";
import { Schema } from "./db";

export type WordEntity = InstaQLEntity<Schema, "words">;
export type ListWordEntity = InstaQLEntity<Schema, "listWords"> & {
  word?: WordEntity;
};
export type ListEntity = InstaQLEntity<Schema, "lists"> & {
  listWords: ListWordEntity[];
};
export type PracticeHistoryEntity = InstaQLEntity<Schema, "practiceHistory">;
