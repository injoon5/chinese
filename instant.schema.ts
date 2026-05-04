import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string(),
    }),
    words: i.entity({
      text: i.string(),
      pinyin: i.string(),
      koreanMeaning: i.string(),
      notes: i.string().optional(),
      createdAt: i.date(),
    }),
    lists: i.entity({
      name: i.string(),
      createdAt: i.date(),
    }),
    listWords: i.entity({
      createdAt: i.date(),
    }),
    practiceHistory: i.entity({
      wordId: i.string(),
      mode: i.string<"flashcard" | "writing">(),
      correct: i.boolean(),
      createdAt: i.date(),
    }),
  },
  links: {
    wordOwner: {
      forward: { on: "words", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "words" },
    },
    listOwner: {
      forward: { on: "lists", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "lists" },
    },
    listWordItems: {
      forward: { on: "listWords", has: "one", label: "list" },
      reverse: { on: "lists", has: "many", label: "listWords" },
    },
    listWordWords: {
      forward: { on: "listWords", has: "one", label: "word" },
      reverse: { on: "words", has: "many", label: "listWords" },
    },
    practiceOwner: {
      forward: { on: "practiceHistory", has: "one", label: "owner" },
      reverse: { on: "$users", has: "many", label: "practiceHistory" },
    },
  },
});

export type Schema = typeof _schema;
export default _schema;
