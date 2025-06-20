import { useCallback, useRef, useState, useEffect } from "react";

export function useUndo<T>(initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);
  const isInitialized = useRef(false);

  // 값이 바뀔 때마다 이전 값을 스택에 저장
  const setWithUndo = useCallback((next: T) => {
    if (isInitialized.current) {
      undoStack.current.push(value);
      redoStack.current = []; // 새로운 변경사항이 생기면 redo 스택 초기화
    }
    setValue(next);
    isInitialized.current = true;
  }, [value]);

  // 초기화 함수 (스택에 추가하지 않음)
  const setWithoutUndo = useCallback((next: T) => {
    setValue(next);
    isInitialized.current = true;
  }, []);

  // 실행취소
  const undo = useCallback(() => {
    if (undoStack.current.length > 0) {
      const prev = undoStack.current.pop();
      if (prev !== undefined) {
        redoStack.current.push(value);
        setValue(prev);
      }
    }
  }, [value]);

  // 되돌리기
  const redo = useCallback(() => {
    if (redoStack.current.length > 0) {
      const next = redoStack.current.pop();
      if (next !== undefined) {
        undoStack.current.push(value);
        setValue(next);
      }
    }
  }, [value]);

  // 스택이 비어있는지 확인
  const canUndo = useCallback(() => {
    return undoStack.current.length > 0;
  }, []);

  // Redo 스택이 비어있는지 확인
  const canRedo = useCallback(() => {
    return redoStack.current.length > 0;
  }, []);

  // 단축키 이벤트 등록
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === "z") {
        e.preventDefault();
        if (canUndo()) undo();
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Z") {
        e.preventDefault();
        if (canRedo()) redo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, canUndo, canRedo]);

  return [value, setWithUndo, setWithoutUndo, undo, redo, canUndo, canRedo] as const;
} 