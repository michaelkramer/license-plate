import React from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/50 px-6"
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
      >
        <Pressable
          className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-800"
          onPress={(e) => e.stopPropagation()}
        >
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">
            {title}
          </Text>
          <Text className="mt-2 text-base text-gray-600 dark:text-gray-300">
            {message}
          </Text>
          <View className="mt-5 flex-row justify-end gap-3">
            <Pressable
              className="rounded-lg px-4 py-2 active:opacity-80"
              onPress={onCancel}
              accessibilityRole="button"
            >
              <Text className="text-base font-semibold text-gray-700 dark:text-gray-300">
                {cancelLabel}
              </Text>
            </Pressable>
            <Pressable
              className={`rounded-lg px-4 py-2 active:opacity-80 ${
                destructive ? "bg-red-600" : "bg-blue-600"
              }`}
              onPress={onConfirm}
              accessibilityRole="button"
            >
              <Text className="text-base font-semibold text-white">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
