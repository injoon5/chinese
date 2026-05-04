"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Trash2, Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { WordEntity, ListEntity } from "@/lib/types";

interface WordCardProps {
  word: WordEntity;
  lists: ListEntity[];
}

export function WordCard({ word, lists }: WordCardProps) {
  const [listSheetOpen, setListSheetOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await db.transact([db.tx.words[word.id].delete()]);
      toast.success(`Deleted "${word.text}"`);
    } catch {
      toast.error("Failed to delete word");
    }
  };

  const handleAddToList = async (listId: string) => {
    const list = lists.find((l) => l.id === listId);
    const alreadyInList = list?.listWords.some((lw) => lw.word?.id === word.id);

    if (alreadyInList) {
      toast.info("Word already in this list");
      return;
    }

    try {
      const lwId = id();
      await db.transact([
        db.tx.listWords[lwId].update({ createdAt: Date.now() }),
        db.tx.listWords[lwId].link({ list: listId }),
        db.tx.listWords[lwId].link({ word: word.id }),
      ]);
      toast.success(`Added to "${list?.name}"`);
      setListSheetOpen(false);
    } catch {
      toast.error("Failed to add to list");
    }
  };

  return (
    <>
      <Card className="group hover:shadow-md transition-shadow">
        <CardContent className="p-4 flex items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-chinese text-3xl font-bold leading-none">{word.text}</span>
              <span className="text-sm text-muted-foreground">{word.pinyin}</span>
            </div>
            <p className="text-base font-medium">{word.koreanMeaning}</p>
            {word.notes && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{word.notes}</p>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setListSheetOpen(true)}
              title="Add to list"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              title="Delete word"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Sheet open={listSheetOpen} onOpenChange={setListSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader className="mb-4">
            <SheetTitle>Add to List</SheetTitle>
          </SheetHeader>
          {lists.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              No lists yet. Create a list first.
            </p>
          ) : (
            <div className="space-y-2 pb-4">
              {lists.map((list) => {
                const inList = list.listWords.some((lw) => lw.word?.id === word.id);
                return (
                  <button
                    key={list.id}
                    onClick={() => handleAddToList(list.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium">{list.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {list.listWords.length} words
                      </p>
                    </div>
                    {inList && (
                      <Badge variant="secondary" className="gap-1">
                        <Check className="h-3 w-3" /> Added
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
