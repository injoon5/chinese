import { init } from "@instantdb/react";
import schema from "../instant.schema";

const APP_ID = process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!;

export const db = init({ appId: APP_ID, schema });

export type { Schema } from "../instant.schema";
