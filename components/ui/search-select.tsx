"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAsyncOptions, type BaseOption } from "@/hooks/use-async-options";

export interface Option extends BaseOption {}

// ============================================
// Type Definitions
// ============================================

interface BaseSearchSelectProps<T extends Option = Option> {
  apiEndpoint: string;
  placeholder?: string;
  disabled?: boolean;
  hideImages?: boolean;
  /**
   * Custom renderer for dropdown options
   */
  renderOption?: (option: T) => React.ReactNode;
  /**
   * Custom mapper to transform API response to options
   */
  responseMapper?: (data: unknown) => T[];
  /**
   * Cache duration in ms (default: 60000 = 1 minute)
   */
  staleTime?: number;
  /**
   * Callback when the open state changes
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * Allow user to create new values by typing
   */
  creatable?: boolean;
}

interface SingleSelectProps<
  T extends Option = Option,
> extends BaseSearchSelectProps<T> {
  multiple?: false;
  value: string | null | undefined;
  onChange: (value: string | null) => void;
  initialOption?: T | null;
  /**
   * Custom renderer for the selected value display (single mode only)
   */
  renderValue?: (option: T) => React.ReactNode;
}

interface MultiSelectProps<
  T extends Option = Option,
> extends BaseSearchSelectProps<T> {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
  initialOptions?: T[];
  /**
   * Maximum number of items that can be selected (multi mode only)
   */
  maxItems?: number;
  /**
   * Custom renderer for selected item chips (multi mode only)
   */
  renderSelectedItem?: (option: T) => React.ReactNode;
}

export type SearchSelectProps<T extends Option = Option> =
  | SingleSelectProps<T>
  | MultiSelectProps<T>;

// ============================================
// Component
// ============================================

export function SearchSelect<T extends Option = Option>(
  props: SearchSelectProps<T>,
) {
  const {
    apiEndpoint,
    placeholder = props.multiple ? "Select items..." : "Select item...",
    disabled = false,
    hideImages = false,
    renderOption,
    responseMapper,
    staleTime,
    creatable = false,
  } = props;

  const [open, setOpen] = React.useState(false);

  // Determine initial options based on mode
  const initialOptions = React.useMemo(() => {
    if (props.multiple) {
      return props.initialOptions ?? [];
    }
    return props.initialOption ? [props.initialOption] : [];
  }, [
    props.multiple,
    props.multiple ? props.initialOptions : props.initialOption,
  ]);

  const {
    search,
    setSearch,
    options,
    isLoading,
    isError,
    getOptionById,
    getOptionsByIds,
  } = useAsyncOptions<T>({
    apiEndpoint,
    enabled: open,
    initialOptions,
    responseMapper,
    staleTime,
  });

  // Derived options including creatable option if needed
  const displayOptions = React.useMemo(() => {
    let opts = [...options];
    if (creatable && search.trim()) {
      const exactMatch = opts.find(
        (o) => (o.label || "").toLowerCase() === search.trim().toLowerCase(),
      );
      if (!exactMatch) {
        // Appending creatable option
        // We typecast it as T, assuming T mainly needs { id, label }
        const createOpt = {
          id: search.trim(),
          label: `Create "${search.trim()}"`,
          isCreatable: true,
        } as unknown as T;
        opts.push(createOpt);
      }
    }
    return opts;
  }, [options, creatable, search]);

  // ============================================
  // Single Select Logic
  // ============================================

  const selectedOption = React.useMemo(() => {
    if (props.multiple) return undefined;
    if (props.value) {
      if (creatable && !getOptionById(props.value)) {
        return { id: props.value, label: props.value } as unknown as T;
      }
      return getOptionById(props.value);
    }
    return undefined;
  }, [
    props.multiple,
    props.multiple ? null : props.value,
    getOptionById,
    creatable,
  ]);

  const handleClearSingle = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!props.multiple) {
        props.onChange(null);
      }
    },
    [props.multiple, props.multiple ? null : props.onChange],
  );

  const handleSelectSingle = React.useCallback(
    (optionId: string) => {
      if (!props.multiple) {
        props.onChange(optionId === props.value ? null : optionId);
        setOpen(false);
      }
    },
    [
      props.multiple,
      props.multiple ? null : props.value,
      props.multiple ? null : props.onChange,
    ],
  );

  // ============================================
  // Multi Select Logic
  // ============================================

  const selectedOptions = React.useMemo(() => {
    if (!props.multiple) return [];
    if (creatable) {
      return props.value.map(
        (v) => getOptionsByIds([v])[0] || ({ id: v, label: v } as unknown as T),
      );
    }
    return getOptionsByIds(props.value);
  }, [
    props.multiple,
    props.multiple ? props.value : null,
    getOptionsByIds,
    creatable,
  ]);

  const handleUnselectMulti = React.useCallback(
    (id: string) => {
      if (props.multiple) {
        props.onChange(props.value.filter((v) => v !== id));
      }
    },
    [
      props.multiple,
      props.multiple ? props.value : null,
      props.multiple ? props.onChange : null,
    ],
  );

  const handleSelectMulti = React.useCallback(
    (optionId: string) => {
      if (props.multiple) {
        const isSelected = props.value.includes(optionId);
        if (isSelected) {
          props.onChange(props.value.filter((v) => v !== optionId));
        } else {
          if (props.maxItems && props.value.length >= props.maxItems) {
            return;
          }
          props.onChange([...props.value, optionId]);
        }
      }
    },
    [
      props.multiple,
      props.multiple ? props.value : null,
      props.multiple ? props.onChange : null,
      props.multiple ? props.maxItems : null,
    ],
  );

  const isMaxReached =
    props.multiple && props.maxItems
      ? props.value.length >= props.maxItems
      : false;

  // ============================================
  // Render Helpers
  // ============================================

  const renderDefaultOption = (option: T) => (
    <>
      {!hideImages && option.image && (
        <Avatar className="h-6 w-6 mr-2">
          <AvatarImage src={option.image} alt={option.label} />
          <AvatarFallback>{option.label.charAt(0)}</AvatarFallback>
        </Avatar>
      )}
      {option.label}
    </>
  );

  const renderDefaultValue = (option: T) => (
    <div className="flex items-center gap-2">
      {!hideImages && option.image && (
        <Avatar className="h-5 w-5">
          <AvatarImage src={option.image} alt={option.label} />
          <AvatarFallback className="text-[10px]">
            {option.label.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      <span className="truncate">{option.label}</span>
    </div>
  );

  const renderDefaultSelectedItem = (option: T) => (
    <>
      {!hideImages &&
        (option.image ? (
          <Avatar className="h-6 w-6 rounded-sm">
            <AvatarImage src={option.image} alt={option.label} />
            <AvatarFallback className="text-[10px] rounded-sm">
              {option.label.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div className="h-6 w-6 rounded-sm bg-muted flex items-center justify-center text-[10px] uppercase font-medium">
            {option.label.charAt(0)}
          </div>
        ))}
      <span className="text-sm font-medium">{option.label}</span>
    </>
  );

  // ============================================
  // Render Trigger Button
  // ============================================

  const renderTriggerContent = () => {
    if (props.multiple) {
      const count = props.value.length;
      return (
        <span className={count === 0 ? "text-muted-foreground" : ""}>
          {count > 0
            ? `${count} selected${props.maxItems ? ` / ${props.maxItems}` : ""}`
            : placeholder}
        </span>
      );
    }

    if (selectedOption) {
      if (!props.multiple && props.renderValue) {
        return props.renderValue(selectedOption);
      }
      return renderDefaultValue(selectedOption);
    }

    return <span className="text-muted-foreground">{placeholder}</span>;
  };

  // ============================================
  // Main Render
  // ============================================

  return (
    <div className="flex flex-col gap-2">
      <Popover
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          props.onOpenChange?.(val);
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={placeholder}
            disabled={disabled}
            className="w-full justify-between"
          >
            {renderTriggerContent()}
            <div className="flex items-center gap-1">
              {!props.multiple && props.value && !disabled && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100 cursor-pointer"
                  onClick={handleClearSingle}
                  aria-label="Clear selection"
                />
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              {isLoading && (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Loading...
                </div>
              )}
              {isError && !creatable && (
                <div className="py-6 text-center text-sm text-destructive flex items-center justify-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Failed to load options
                </div>
              )}
              {!isLoading &&
                (!isError || creatable) &&
                displayOptions.length === 0 && (
                  <CommandEmpty>
                    {creatable && search.trim().length > 0 ? (
                      <div
                        className="cursor-pointer text-blue-600 hover:underline p-2 text-center"
                        onClick={() => {
                          if (props.multiple) {
                            handleSelectMulti(search.trim());
                          } else {
                            handleSelectSingle(search.trim());
                          }
                        }}
                      >
                        Click here to create &quot;{search.trim()}&quot;
                      </div>
                    ) : (
                      "No results found."
                    )}
                  </CommandEmpty>
                )}
              {(!isError || creatable) && (
                <CommandGroup>
                  {displayOptions.map((option) => {
                    // check if this is our custom create option
                    const isCreateOption = (option as any).isCreatable === true;
                    const optionValueToMatch = isCreateOption
                      ? search.trim()
                      : option.id;

                    const isSelected = props.multiple
                      ? props.value.includes(optionValueToMatch)
                      : props.value === optionValueToMatch;
                    const isDisabledByMax =
                      props.multiple && isMaxReached && !isSelected;

                    return (
                      <CommandItem
                        key={option.id}
                        value={option.id}
                        className={cn(
                          "cursor-pointer",
                          isDisabledByMax && "opacity-50 cursor-not-allowed",
                        )}
                        onSelect={() => {
                          if (props.multiple) {
                            handleSelectMulti(optionValueToMatch);
                          } else {
                            handleSelectSingle(optionValueToMatch);
                          }
                        }}
                        disabled={isDisabledByMax}
                      >
                        {!isCreateOption && (
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSelected ? "opacity-100" : "opacity-0",
                            )}
                          />
                        )}
                        {isCreateOption && (
                          <div className="mr-2 h-4 w-4" /> // placeholder for alignment
                        )}
                        {renderOption && !isCreateOption
                          ? renderOption(option)
                          : renderDefaultOption(option)}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Items Display (Multi mode only) */}
      {props.multiple && selectedOptions.length > 0 && (
        <div
          className="flex flex-wrap gap-2"
          role="list"
          aria-label="Selected items"
        >
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              role="listitem"
              className={cn(
                "flex items-center gap-2 p-1 pr-2 border rounded-md bg-card text-card-foreground shadow-sm transition-colors group",
                !props.renderSelectedItem && "hover:bg-accent/50",
              )}
            >
              {props.renderSelectedItem
                ? props.renderSelectedItem(option)
                : renderDefaultSelectedItem(option)}
              <button
                type="button"
                className="ml-auto ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 opacity-70 group-hover:opacity-100 transition-opacity disabled:pointer-events-none"
                aria-label={`Remove ${option.label}`}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleUnselectMulti(option.id);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleUnselectMulti(option.id)}
              >
                <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// Convenience Exports (Backward Compatibility)
// ============================================

/**
 * @deprecated Use SearchSelect with multiple={false} instead
 */
export const AsyncSelect = SearchSelect;

/**
 * @deprecated Use SearchSelect with multiple={true} instead
 */
export function AsyncMultiSelect<T extends Option = Option>(
  props: Omit<MultiSelectProps<T>, "multiple">,
) {
  return <SearchSelect<T> {...props} multiple />;
}
