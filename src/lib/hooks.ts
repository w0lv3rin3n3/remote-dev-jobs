import { useState, useEffect, useContext } from "react";
import { JobItem, JobItemExpanded } from "./types";
import { BASE_API_URL } from "./constants";
import { useQueries, useQuery } from "@tanstack/react-query";
import { handleError } from "./utils";
import { BookmarksContext } from "../contexts/BookmarksContextProvider";
import { ActiveIdContext } from "../contexts/ActiveIdContextProvider";
import { SearchTextContext } from "../contexts/SearchTextContextProvider";
import { JobItemsContext } from "../contexts/JobItemsContextProvider";

export function useActiveId() {
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveId(+window.location.hash.slice(1));
    };

    handleHashChange();

    window.addEventListener("hashchange", handleHashChange);
    // return window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return activeId;
}

// export function useJobItem(id: number | null) {
//   const [jobItem, setJobItem] = useState<JobItemExpanded | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!id) return;
//       setIsLoading(true);
//       const res = await fetch(`${BASE_API_URL}/${id}`);
//       const data = await res.json();
//       setIsLoading(false);
//       setJobItem(data.jobItem);
//     };

//     fetchData();
//   }, [id]);

//   return { jobItem, isLoading };
// }

type JobItemApiResponse = {
  public: boolean;
  jobItem: JobItemExpanded;
};

const fetchJobItem = async (id: number | null): Promise<JobItemApiResponse> => {
  const res = await fetch(`${BASE_API_URL}/${id}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.description);
  }
  const data = await res.json();
  return data;
};

export function useJobItem(id: number | null) {
  const { data, isInitialLoading } = useQuery(
    ["job-item", id],
    () => fetchJobItem(id),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(id),
      onError: handleError,
    }
  );
  return { jobItem: data?.jobItem, isLoading: isInitialLoading } as const;
}

export function useJobItems(ids: number[]) {
  const results = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["job-item", id],
      queryFn: () => fetchJobItem(id),
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(id),
      onError: handleError,
    })),
  });
  const jobItems = results
    .map((result) => result.data?.jobItem)
    .filter((jobItem) => jobItem !== undefined);
  const isLoading = results.some((result) => result.isLoading);
  return { jobItems, isLoading };
}

type JobItemsApiResponse = {
  public: boolean;
  sorted: boolean;
  jobItems: JobItem[];
};

const fetchJobItems = async (
  searchText: string
): Promise<JobItemsApiResponse> => {
  const res = await fetch(`${BASE_API_URL}?search=${searchText}`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.description);
  }
  const data = await res.json();
  return data;
};

export function useSearchQuery(searchText: string) {
  const { data, isInitialLoading } = useQuery(
    ["react-jobs", searchText],
    () => fetchJobItems(searchText),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: Boolean(searchText),
      onError: handleError,
    }
  );

  return { jobItems: data?.jobItems, isLoading: isInitialLoading };
}

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timerId);
  }, [value, delay]);

  return debouncedValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() =>
    JSON.parse(localStorage.getItem(key) || JSON.stringify(initialValue))
  );

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;
}

export function useOnClickOutside(
  refs: React.RefObject<HTMLElement>[],
  handler: () => void
) {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (refs.every((ref) => !ref.current?.contains(e.target as Node)))
        handler();
    };
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [refs, handler]);
}

export function useBookmarksContext() {
  const context = useContext(BookmarksContext);
  if (!context)
    throw new Error(
      "useBookmarksContext must be used within a BookmarksContextProvider"
    );
  return context;
}

export function useActiveIdContext() {
  const context = useContext(ActiveIdContext);
  if (!context)
    throw new Error(
      "useActiveIdContext must be used within a ActiveIdContextProvider"
    );
  return context;
}

export function useSearchTextContext() {
  const context = useContext(SearchTextContext);
  if (!context)
    throw new Error(
      "useSearchTextContext must be used within a SearchTextContextProvider"
    );
  return context;
}

export function useJobItemsContext() {
  const context = useContext(JobItemsContext);
  if (!context)
    throw new Error(
      "useJobItemsContext must be used within a JobItemsContextProvider"
    );
  return context;
}
