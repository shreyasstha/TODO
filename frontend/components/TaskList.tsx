"use client";

import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Task } from "@/types/task";
import TaskItem from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onUpdate: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReorder: (taskIds: string[]) => Promise<void>;
  disabled?: boolean;
}

export default function TaskList({
  tasks,
  loading,
  error,
  onToggle,
  onUpdate,
  onDelete,
  onReorder,
  disabled = false,
}: TaskListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || disabled) return;

    const oldIndex = tasks.findIndex((t) => t.id === active.id);
    const newIndex = tasks.findIndex((t) => t.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(tasks, oldIndex, newIndex);
    await onReorder(reordered.map((t) => t.id));
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-500">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="text-sm text-slate-600">Loading tasks…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center">
        <p className="font-medium text-red-700">Could not load tasks</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <span className="text-4xl">📝</span>
        <p className="text-lg font-medium text-slate-700">No tasks yet</p>
        <p className="text-sm text-slate-500">Add your first task above to get started.</p>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {completedCount} of {tasks.length} completed · drag the grip to reorder
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => void handleDragEnd(e)}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggle={onToggle}
                onUpdate={onUpdate}
                onDelete={onDelete}
                disabled={disabled}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

