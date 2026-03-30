import { useMemo, type ReactNode } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

type TableDndProviderProps = {
  children: ReactNode;
};

function isTouchDevice(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  if ('ontouchstart' in window) {
    return true;
  }
  return window.matchMedia('(pointer: coarse)').matches;
}

export function TableDndProvider({ children }: TableDndProviderProps): JSX.Element {
  const useTouchBackend = useMemo(() => isTouchDevice(), []);

  if (useTouchBackend) {
    return (
      <DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
        {children}
      </DndProvider>
    );
  }

  return <DndProvider backend={HTML5Backend}>{children}</DndProvider>;
}
