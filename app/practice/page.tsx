"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FlashcardMode } from "@/components/FlashcardMode";
import { WritingMode } from "@/components/WritingMode";
import { Layers, PenLine, ChevronDown } from "lucide-react";
import { WordEntity, ListEntity } from "@/lib/types";

type Mode = "flashcard" | "writing";
type PracticeState = "select" | "practice";

export default function PracticePage() {
  const { user } = db.useAuth();
  const [mode, setMode] = useState<Mode | null>(null);
  const [practiceState, setPracticeState] = useState<PracticeState>("select");
  const [selectedListId, setSelectedListId] = useState<string>("all");

  const { data, isLoading } = db.useQuery(
    user
      ? {
          words: { $: { where: { "owner.id": user.id } } },
          lists: {
            $: { where: { "owner.id": user.id } },
            listWords: { word: {} },
          },
        }
      : null
  );

  const allWords = (data?.words ?? []) as WordEntity[];
  const lists = (data?.lists ?? []) as ListEntity[];

  const practiceWords =
    selectedListId === "all"
      ? allWords
      : lists
          .find((l) => l.id === selectedListId)
          ?.listWords.map((lw) => lw.word)
          .filter((w): w is WordEntity => !!w) ?? [];

  const startPractice = (m: Mode) => {
    setMode(m);
    setPracticeState("practice");
  };

  const exitPractice = () => {
    setMode(null);
    setPracticeState("select");
  };

  if (practiceState === "practice" && mode && user) {
    if (practiceWords.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
          <p className="text-lg font-semibold">No words to practice</p>
          <p className="text-muted-foreground text-sm">Add words to your library first.</p>
          <Button onClick={exitPractice}>Back</Button>
        </div>
      );
    }
    if (mode === "flashcard") {
      return (
        <FlashcardMode words={practiceWords} userId={user.id} onExit={exitPractice} />
      );
    }
    return <WritingMode words={practiceWords} userId={user.id} onExit={exitPractice} />;
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Practice</h1>
        <p className="text-muted-foreground text-sm">Choose a mode to start</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <>
          {/* List selector */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block">Study from</label>
            <div className="relative">
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="w-full h-10 px-3 pr-10 rounded-md border bg-background text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Words ({allWords.length})</option>
                {lists.map((list) => {
                  const count = list.listWords.filter((lw) => lw.word).length;
                  return (
                    <option key={list.id} value={list.id}>
                      {list.name} ({count} words)
                    </option>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {practiceWords.length} words selected
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => startPractice("flashcard")}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <Layers className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Flashcard Mode</CardTitle>
                <CardDescription>
                  See Korean meaning, reveal the Chinese character and pinyin. Rate yourself.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled={practiceWords.length === 0}>
                  Start Flashcards
                </Button>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => startPractice("writing")}
            >
              <CardHeader>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
                  <PenLine className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Writing Practice</CardTitle>
                <CardDescription>
                  Type the Chinese character from the Korean meaning. Pinyin hints available.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline" disabled={practiceWords.length === 0}>
                  Start Writing
                </Button>
              </CardContent>
            </Card>
          </div>

          {allWords.length === 0 && (
            <div className="mt-8 p-6 rounded-xl border border-dashed text-center space-y-2">
              <p className="font-semibold">No words yet</p>
              <p className="text-sm text-muted-foreground">
                Add words in the Words tab to start practicing.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
