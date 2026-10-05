"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { AlertCircle, Trash2 } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title: string;
  itemType?: string;
  isDeleting?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemType = "link",
  isDeleting = false,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      title={
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <Trash2 className="w-5 h-5 shrink-0" />
          <span>Delete {itemType}?</span>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
          Are you sure you want to delete{" "}
          <strong className="text-gray-900 dark:text-gray-100 font-semibold break-all">
            &ldquo;{title}&rdquo;
          </strong>
          ? This will permanently remove it from your public profile and analytics.
        </p>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
          >
            Delete {itemType}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
