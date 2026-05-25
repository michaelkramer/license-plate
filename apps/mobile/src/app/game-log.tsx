import React from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { ConfirmModal } from "../component/layout/ConfirmModal";
import { Footer } from "../component/layout/Footer";
import { Header } from "../component/layout/Header";
import { StoredGame } from "../interfaces/Game";
import { useScoreContext } from "../providers/score";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(startedAt: string, completedAt: string): string {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} hr ${rem} min` : `${hours} hr`;
}

function GameLogRow({
  game,
  onDelete,
}: {
  game: StoredGame;
  onDelete: (game: StoredGame) => void;
}) {
  const score = game.trackedPlates.length;
  const completedAt = game.completedAt ?? "";

  return (
    <View className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
      <View className="flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            {score} {score === 1 ? "state" : "states"}
          </Text>
          <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Started: {formatDateTime(game.startedAt)}
          </Text>
          {completedAt ? (
            <>
              <Text className="text-sm text-gray-600 dark:text-gray-400">
                Completed: {formatDateTime(completedAt)}
              </Text>
              <Text className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                Duration: {formatDuration(game.startedAt, completedAt)}
              </Text>
            </>
          ) : null}
        </View>
        <Pressable
          className="rounded-lg border border-red-300 px-3 py-2 active:opacity-80 dark:border-red-800"
          onPress={() => onDelete(game)}
          accessibilityRole="button"
          accessibilityLabel="Delete game"
        >
          <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function GameLogPage() {
  const { completedGames, deleteGame } = useScoreContext();
  const [pendingDelete, setPendingDelete] = React.useState<StoredGame | null>(
    null,
  );

  const handleConfirmDelete = () => {
    if (pendingDelete) {
      deleteGame(pendingDelete.id);
    }
    setPendingDelete(null);
  };

  return (
    <View className="flex-1">
      <Header />
      <View className="flex-1">
        <Text className="px-4 pb-2 pt-4 text-2xl font-bold text-gray-900 dark:text-gray-50">
          Game log
        </Text>
        <FlatList
          data={completedGames}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text className="px-4 py-8 text-center text-gray-600 dark:text-gray-400">
              No completed games yet. Track states on the home screen, then tap
              Complete game.
            </Text>
          }
          renderItem={({ item }) => (
            <GameLogRow game={item} onDelete={setPendingDelete} />
          )}
        />
      </View>
      <Footer />

      <ConfirmModal
        visible={pendingDelete !== null}
        title="Delete this game?"
        message="This removes the game from your log. This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </View>
  );
}
