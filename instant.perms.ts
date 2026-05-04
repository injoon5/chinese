import type { InstantRules } from "@instantdb/react";

const rules = {
  words: {
    allow: {
      view: "auth.id != null && data.ref('owner.id') == auth.id",
      create: "auth.id != null",
      update: "auth.id != null && data.ref('owner.id') == auth.id",
      delete: "auth.id != null && data.ref('owner.id') == auth.id",
    },
  },
  lists: {
    allow: {
      view: "auth.id != null && data.ref('owner.id') == auth.id",
      create: "auth.id != null",
      update: "auth.id != null && data.ref('owner.id') == auth.id",
      delete: "auth.id != null && data.ref('owner.id') == auth.id",
    },
  },
  listWords: {
    allow: {
      view: "auth.id != null && data.ref('list.owner.id') == auth.id",
      create: "auth.id != null",
      update: "auth.id != null && data.ref('list.owner.id') == auth.id",
      delete: "auth.id != null && data.ref('list.owner.id') == auth.id",
    },
  },
  practiceHistory: {
    allow: {
      view: "auth.id != null && data.ref('owner.id') == auth.id",
      create: "auth.id != null",
      update: "auth.id != null && data.ref('owner.id') == auth.id",
      delete: "auth.id != null && data.ref('owner.id') == auth.id",
    },
  },
} satisfies InstantRules;

export default rules;
