"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, X, RotateCcw } from "lucide-react";
import { WordEntity as Word } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface FlashcardModeProps {
  words: Word[];
  userId: string;
  onExit: () => void;
}

export function FlashcardMode({ words, userId, onExit }: FlashcardModeProps) {
  const [deck, setDeck] = useState<Word[]>(() => shuffle(words));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ wordId: string; correct: boolean }[]>([]);
  const [done, setDone] = useState(false);
  const [wrongWords, setWrongWords] = useState<Word[]>([]);

  const current = deck[index];
  const progress = deck.length > 0 ? ((index + 1) / deck.length) * 100 : 0;

  const recordResult = async (correct: boolean) => {
    const newResult = { wordId: current.id, correct };
    setResults((prev) => [...prev, newResult]);

    try {
      const histId = id();
      await db.transact([
        db.tx.practiceHistory[histId].update({
          wordId: current.id,
          mode: "flashcard",
          correct,
          createdAt: Date.now(),
        }),
        db.tx.practiceHistory[histId].link({ owner: userId }),
      ]);
    } catch {
      // history tracking is non-critical
    }

    if (index + 1 >= deck.length) {
      const allResults = [...results, newResult];
      const wrongIds = new Set(allResults.filter((r) => !r.correct).map((r) => r.wordId));
      const wrong = deck.filter((w) => wrongIds.has(w.id));
      setWrongWords(wrong);
      setDone(true);
    } else {
      setFlipped(false);
      setTimeout(() => setIndex((i) => i + 1), 100);
    }
  };

  const restart = () => {
    setDeck(shuffle(words));
    setIndex(0);
    setFlipped(false);
    setResults([]);
    setDone(false);
    setWrongWords([]);
  };

  const reviewWrong = () => {
    if (wrongWords.length === 0) return;
    setDeck(shuffle(wrongWords));
    setIndex(0);
    setFlipped(false);
    setResults([]);
    setDone(false);
    setWrongWords([]);
  };

  if (done) {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const pct = Math.round((correct / total) * 100);
    const wrongCount = total - correct;

    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
        <div className="text-6xl">{pct >= 80 ? "🎉" : pct >= 50 ? "👍" : "💪"}</div>
        <div>
          <h2 className="text-3xl font-bold">{pct}%</h2>
          <p className="text-muted-foreground mt-1">
            {correct} / {total} correct
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          {wrongCount > 0 && (
            <Button onClick={reviewWrong} variant="outline" className="gap-2 flex-1">
              <RotateCcw className="h-4 w-4" />
              Review {wrongCount} wrong
            </Button>
          )}
          <Button onClick={restart} className="gap-2 flex-1">
            <RotateCcw className="h-4 w-4" />
            Restart
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
          <span>{results.filter((r) => r.correct).length} correct</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard */}
      <div
        className="flashcard-container w-full cursor-pointer"
        style={{ height: "320px" }}
        onClick={() => !flipped && setFlipped(true)}
      >
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
          {/* Front: Korean meaning */}
          <div className="flashcard-front w-full h-full rounded-2xl border bg-card shadow-md flex flex-col items-center justify-center gap-3 p-6">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Korean Meaning</p>
            <p className="text-3xl font-bold text-center">{current?.koreanMeaning}</p>
            <p className="text-sm text-muted-foreground mt-4">Tap to reveal</p>
          </div>

          {/* Back: Chinese + pinyin */}
          <div className="flashcard-back w-full h-full rounded-2xl border bg-primary text-primary-foreground shadow-md flex flex-col items-center justify-center gap-3 p-6">
            <p className="font-chinese text-7xl font-bold">{current?.text}</p>
            <p className="text-xl opacity-80">{current?.pinyin}</p>
            {current?.notes && (
              <p className="text-sm opacity-60 text-center mt-2">{current.notes}</p>
            )}
          </div>
        </div>
      </div>

      {flipped ? (
        <div className="flex gap-4 w-full">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => recordResult(false)}
          >
            <X className="h-5 w-5" />
            Try again
          </Button>
          <Button
            size="lg"
            className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => recordResult(true)}
          >
            <Check className="h-5 w-5" />
            Got it
          </Button>
        </div>
      ) : (
        <Button size="lg" className="w-full" onClick={() => setFlipped(true)}>
          Show Answer
        </Button>
      )}

      <Button variant="ghost" size="sm" onClick={onExit}>
        Exit
      </Button>
    </div>
  );
}
