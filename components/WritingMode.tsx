"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Check, X, RotateCcw, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { WordEntity as Word } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface WritingModeProps {
  words: Word[];
  userId: string;
  onExit: () => void;
}

type Phase = "input" | "result";

export function WritingMode({ words, userId, onExit }: WritingModeProps) {
  const [deck] = useState<Word[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("input");
  const [correct, setCorrect] = useState(false);
  const [showPinyin, setShowPinyin] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const current = deck[index];
  const progress = deck.length > 0 ? (index / deck.length) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCorrect = input.trim() === current.text;
    setCorrect(isCorrect);
    setPhase("result");

    try {
      const histId = id();
      await db.transact([
        db.tx.practiceHistory[histId].update({
          wordId: current.id,
          mode: "writing",
          correct: isCorrect,
          createdAt: Date.now(),
        }),
        db.tx.practiceHistory[histId].link({ owner: userId }),
      ]);
    } catch {
      // non-critical
    }

    setResults((prev) => [...prev, isCorrect]);
  };

  const handleNext = () => {
    if (index + 1 >= deck.length) {
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setInput("");
      setPhase("input");
      setShowPinyin(false);
    }
  };

  const restart = () => {
    setIndex(0);
    setInput("");
    setPhase("input");
    setShowPinyin(false);
    setResults([]);
    setDone(false);
  };

  if (done) {
    const correctCount = results.filter(Boolean).length;
    const total = results.length;
    const pct = Math.round((correctCount / total) * 100);

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="text-6xl">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
        <div>
          <h2 className="text-3xl font-bold">{pct}%</h2>
          <p className="text-muted-foreground mt-1">
            {correctCount} / {total} correct
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
        </div>
        <Button variant="ghost" onClick={onExit}>
          Back to Practice
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 max-w-lg mx-auto w-full">
      <div className="w-full space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{index + 1} / {deck.length}</span>
          <span>{results.filter(Boolean).length} correct</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="w-full rounded-2xl border bg-card shadow-md p-6 space-y-4">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Korean Meaning
          </p>
          <p className="text-3xl font-bold">{current?.koreanMeaning}</p>
          <div className="flex items-center justify-center gap-2 h-7">
            {showPinyin ? (
              <>
                <span className="text-base text-muted-foreground">{current?.pinyin}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setShowPinyin(false)}
                >
                  <EyeOff className="h-3 w-3 mr-1" /> Hide hint
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => setShowPinyin(true)}
              >
                <Eye className="h-3 w-3 mr-1" /> Show pinyin hint
              </Button>
            )}
          </div>
        </div>

        {phase === "input" ? (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              {/* ghost overlay */}
              {input.length === 0 && (
                <div
                  className="absolute inset-0 flex items-center justify-center font-chinese text-7xl font-bold pointer-events-none select-none"
                  style={{ color: "currentColor", opacity: 0.05 }}
                >
                  {current?.text}
                </div>
              )}
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type the Chinese character..."
                className="font-chinese text-2xl text-center resize-none h-24 relative z-10 bg-transparent"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={!input.trim()}>
              Check Answer
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <div
              className={cn(
                "rounded-xl p-4 flex flex-col items-center gap-2",
                correct ? "bg-green-500/10 border border-green-500/30" : "bg-destructive/10 border border-destructive/30"
              )}
            >
              {correct ? (
                <>
                  <Check className="h-8 w-8 text-green-600" />
                  <p className="font-semibold text-green-700 dark:text-green-400">Correct!</p>
                </>
              ) : (
                <>
                  <X className="h-8 w-8 text-destructive" />
                  <p className="font-semibold text-destructive">Not quite</p>
                </>
              )}
              <div className="text-center mt-2">
                <p className="font-chinese text-6xl font-bold">{current?.text}</p>
                <p className="text-muted-foreground">{current?.pinyin}</p>
                {!correct && (
                  <p className="text-sm mt-2">
                    Your answer: <span className="font-chinese font-bold">{input}</span>
                  </p>
                )}
              </div>
            </div>
            <Button className="w-full" onClick={handleNext}>
              Next
            </Button>
          </div>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={onExit}>
        Exit
      </Button>
    </div>
  );
}
