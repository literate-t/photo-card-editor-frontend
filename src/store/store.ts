import { create, type StateCreator } from "zustand";
import { devtools } from "zustand/middleware";

export const createStore = <T extends object>(
  initializer: StateCreator<T, [["zustand/devtools", never]]>,
) => create<T, [["zustand/devtools", never]]>(devtools(initializer));
