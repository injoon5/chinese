"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Trash2, X, List as ListIcon } from "lucide-react";
import { toast } from "sonner";
import { ListEntity, ListWordEntity } from "@/lib/types";

export default function ListsPage() {
  const { user } = db.useAuth();
  const [newListName, setNewListName] = useState("");
  const [activeList, setActiveList] = useState<ListEntity | null>(null);

  const { data, isLoading } = db.useQuery(
    user
      ? {
          lists: {
            $: { where: { "owner.id": user.id } },
            listWords: { word: {} },
          },
        }
      : null
  );

  const lists = (data?.lists ?? []) as ListEntity[];

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim() || !user) return;
    try {
      const listId = id();
      await db.transact([
        db.tx.lists[listId].update({
          name: newListName.trim(),
          createdAt: Date.now(),
        }),
        db.tx.lists[listId].link({ owner: user.id }),
      ]);
      toast.success(`Created "${newListName.trim()}"`);
      setNewListName("");
    } catch {
      toast.error("Failed to create list");
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    try {
      await db.transact([db.tx.lists[listId].delete()]);
      toast.success(`Deleted "${listName}"`);
      if (activeList?.id === listId) setActiveList(null);
    } catch {
      toast.error("Failed to delete list");
    }
  };

  const handleRemoveFromList = async (listWordId: string, wordText: string) => {
    try {
      await db.transact([db.tx.listWords[listWordId].delete()]);
      toast.success(`Removed "${wordText}"`);
      setActiveList((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          listWords: prev.listWords.filter((lw) => lw.id !== listWordId),
        };
      });
    } catch {
      toast.error("Failed to remove word");
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Lists</h1>
        <p className="text-muted-foreground text-sm">Organize words into study lists</p>
      </div>

      <form onSubmit={handleCreateList} className="flex gap-2 mb-6">
        <Input
          placeholder="New list name..."
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" className="gap-2" disabled={!newListName.trim()}>
          <Plus className="h-4 w-4" />
          Create
        </Button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <ListIcon className="h-12 w-12 opacity-20" />
          <div>
            <p className="font-semibold text-lg">No lists yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Create a list to organize your vocabulary
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {lists.map((list) => (
            <Card
              key={list.id}
              className="cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => setActiveList(list)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-base">{list.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {list.listWords.length} {list.listWords.length === 1 ? "word" : "words"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteList(list.id, list.name);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!activeList} onOpenChange={(open) => !open && setActiveList(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{activeList?.name}</SheetTitle>
          </SheetHeader>
          {activeList?.listWords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <p className="text-muted-foreground">No words in this list yet.</p>
              <p className="text-sm text-muted-foreground">
                Add words from the Words page.
              </p>
            </div>
          ) : (
            <div className="space-y-2 pb-8">
              {activeList?.listWords.map((lw) => (
                <div
                  key={lw.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-chinese text-xl font-bold">{lw.word?.text}</p>
                    <p className="text-sm text-muted-foreground">{lw.word?.pinyin}</p>
                    <p className="text-sm">{lw.word?.koreanMeaning}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => handleRemoveFromList(lw.id, lw.word?.text ?? "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
