import { useCallback, useEffect, useRef, useState } from "react";

const secondsUntil = (deadline) =>
  Math.max(0, Math.ceil((deadline - Date.now()) / 1000));

const useKioskTimers = ({
  enabled,
  idleTimeoutSeconds,
  workerSessionDeadline,
  onExpire,
}) => {
  const [idleSeconds, setIdleSeconds] = useState(0);
  const idleDeadlineRef = useRef(null);
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  onExpireRef.current = onExpire;

  const resetIdle = useCallback(() => {
    if (!enabled) return;

    idleDeadlineRef.current = Date.now() + idleTimeoutSeconds * 1000;
    setIdleSeconds(idleTimeoutSeconds);
  }, [enabled, idleTimeoutSeconds]);

  useEffect(() => {
    if (!enabled || workerSessionDeadline === null) {
      idleDeadlineRef.current = null;
      expiredRef.current = false;
      setIdleSeconds(0);
      return undefined;
    }

    expiredRef.current = false;
    idleDeadlineRef.current = Date.now() + idleTimeoutSeconds * 1000;

    const updateTimers = () => {
      if (expiredRef.current) return;

      if (Date.now() >= workerSessionDeadline) {
        expiredRef.current = true;
        onExpireRef.current("worker_session_ttl");
        return;
      }

      const remainingIdleSeconds = secondsUntil(idleDeadlineRef.current);
      setIdleSeconds(remainingIdleSeconds);

      if (remainingIdleSeconds <= 0) {
        expiredRef.current = true;
        onExpireRef.current("idle_timeout");
      }
    };

    updateTimers();
    const intervalId = globalThis.setInterval(updateTimers, 250);

    return () => globalThis.clearInterval(intervalId);
  }, [enabled, idleTimeoutSeconds, workerSessionDeadline]);

  return { idleSeconds, resetIdle };
};

export default useKioskTimers;
