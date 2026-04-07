"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";

export interface BaseOption {
  id: string;
  label: string;
  image?: string | null;
}

export interface UseAsyncOptionsConfig<T extends BaseOption = BaseOption> {
  apiEndpoint: string;
  enabled: boolean;
  debounceMs?: number;
  staleTime?: number;
  initialOptions?: T[];
  /**
   * Custom mapper to transform API response to options.
   * If not provided, assumes response is an array and maps { id, name/title, image }
   */
  responseMapper?: (data: unknown) => T[];
}

const defaultResponseMapper = <T extends BaseOption>(data: unknown): T[] => {
  const items = Array.isArray(data) ? data : [];
  return items.map((item: Record<string, unknown>) => ({
    id: String(item.id ?? ""),
    label: String(item.name ?? item.title ?? item.id ?? ""),
    image: item.image as string | null | undefined,
    ...item,
  })) as T[];
};

export function useAsyncOptions<T extends BaseOption = BaseOption>({
  apiEndpoint,
  enabled,
  debounceMs = 300,
  staleTime = 60 * 1000, // 1 minute default
  initialOptions = [],
  responseMapper,
}: UseAsyncOptionsConfig<T>) {
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, debounceMs);

  const [optionsMap, setOptionsMap] = React.useState<Map<string, T>>(() => {
    const map = new Map<string, T>();
    initialOptions.forEach((opt) => map.set(opt.id, opt));
    return map;
  });

  const {
    data: fetchedOptions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["async-options", apiEndpoint, debouncedSearch],
    queryFn: async () => {
      const separator = apiEndpoint.includes("?") ? "&" : "?";
      const res = await fetch(
        `${apiEndpoint}${separator}q=${encodeURIComponent(debouncedSearch)}`,
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      const mapper = responseMapper ?? defaultResponseMapper<T>;
      return mapper(data);
    },
    enabled,
    staleTime,
    gcTime: staleTime * 2,
    retry: 1,
  });

  React.useEffect(() => {
    if (fetchedOptions.length > 0) {
      setOptionsMap((prev) => {
        const newMap = new Map(prev);
        fetchedOptions.forEach((opt) => {
          if (!newMap.has(opt.id)) {
            newMap.set(opt.id, opt);
          }
        });
        return newMap;
      });
    }
  }, [fetchedOptions]);

  const allOptions = React.useMemo(
    () => Array.from(optionsMap.values()),
    [optionsMap],
  );

  React.useEffect(() => {
    if (initialOptions.length > 0) {
      setOptionsMap((prev) => {
        const newMap = new Map(prev);
        initialOptions.forEach((opt) => newMap.set(opt.id, opt));
        return newMap;
      });
    }
  }, [initialOptions]);

  const getOptionById = React.useCallback(
    (id: string): T | undefined => optionsMap.get(id),
    [optionsMap],
  );
  const getOptionsByIds = React.useCallback(
    (ids: string[]): T[] => {
      return ids
        .map((id) => optionsMap.get(id))
        .filter((opt): opt is T => opt !== undefined);
    },
    [optionsMap],
  );

  return {
    search,
    setSearch,
    options: fetchedOptions,
    allOptions,
    isLoading,
    isError,
    error,
    getOptionById,
    getOptionsByIds,
  };
}
