import * as React from "react";
import {
  useFieldArray,
  type Control,
  type ArrayPath,
  type FieldValues,
} from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DynamicListProps<T extends FieldValues> {
  control: Control<T>;
  name: ArrayPath<T>;
  label: string;
  initialItem: any;
  renderItem: (props: {
    field: any;
    index: number;
    remove: () => void;
    append: () => void;
  }) => React.ReactNode;
  emptyMessage?: string;
  canDeleteAll?: boolean;
  className?: string;
  appendButtonLabel?: string;
  deleteAllButtonLabel?: string;
  icon?: React.ReactNode;
}

export function DynamicList<T extends FieldValues>({
  control,
  name,
  label,
  initialItem,
  renderItem,
  emptyMessage = "No items added.",
  canDeleteAll = true,
  className,
  appendButtonLabel = "Add Item",
  deleteAllButtonLabel = "Delete All",
  icon,
}: DynamicListProps<T>) {
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name,
  });

  const [lastAction, setLastAction] = React.useState<{
    type: "append" | "remove";
    index: number;
  } | null>(null);

  const containerRef = React.useRef<HTMLDivElement>(null);

  // We need to wait for the DOM to update before focusing
  React.useEffect(() => {
    if (lastAction && containerRef.current) {
      if (lastAction.type === "append") {
        // Focus the new item
        const index = lastAction.index;
        const row = containerRef.current.querySelector(
          `[data-dynamic-list-index="${index}"]`,
        );
        const input = row?.querySelector(
          "input, button, [tabindex]:not([tabindex='-1'])",
        ) as HTMLElement;
        if (input) {
          input.focus();
        }
      } else if (lastAction.type === "remove") {
        // Focus the previous item (or the next one if it was the first? usually previous)
        const targetIndex = Math.max(0, lastAction.index - 1);
        if (targetIndex < fields.length) {
          const row = containerRef.current.querySelector(
            `[data-dynamic-list-index="${targetIndex}"]`,
          );
          const input = row?.querySelector(
            "input, button, [tabindex]:not([tabindex='-1'])",
          ) as HTMLElement;
          input?.focus();
        }
      }
      setLastAction(null);
    }
  }, [fields.length, lastAction]);

  const handleAppend = () => {
    append(initialItem);
    setLastAction({ type: "append", index: fields.length }); // It will be at current length
  };

  const handleRemove = (index: number) => {
    remove(index);
    setLastAction({ type: "remove", index });
  };

  const handleRemoveAll = () => {
    replace([]);
    // Focus the add button? Or nothing.
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Card ref={containerRef} className="w-full">
        <CardHeader className="flex flex-col md:flex-row md:items-center items-start justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{label}</CardTitle>
          </div>
          <div className="flex gap-2 w-full justify-end mt-4 md:mt-0">
            {canDeleteAll && fields.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemoveAll}
              >
                <Trash2 className="mr-2 h-4 w-4" /> {deleteAllButtonLabel}
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleAppend}
            >
              <Plus className="mr-2 h-4 w-4" /> {appendButtonLabel}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} data-dynamic-list-index={index}>
              {renderItem({
                field,
                index,
                remove: () => handleRemove(index),
                append: () => {
                  append(initialItem);
                  setLastAction({ type: "append", index: fields.length });
                },
              })}
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8 border-dashed border-2 rounded-md">
              {emptyMessage}
            </p>
          )}
        </CardContent>
      </Card>
      {/* Show error for the array itself (e.g. min length) */}
      <FormMessage>
        {(control._formState.errors?.[name] as any)?.root?.message ||
          (control._formState.errors?.[name] as any)?.message}
      </FormMessage>
    </div>
  );
}
