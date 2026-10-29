import { isCancel } from "axios";
import { useCallback, useEffect, useState } from "react";

// fetcher는 useCallback으로 감싸 안정적인 참조를 넘겨야 한다 (참조가 바뀌면 다시 조회한다)
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetcher(controller.signal)
      .then(setData)
      .catch((err) => {
        // 조건이 바뀌어 취소된 요청은 에러로 취급하지 않는다
        if (!isCancel(err)) setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [fetcher, reloadKey]);

  const refetch = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, error, isLoading, refetch };
}
