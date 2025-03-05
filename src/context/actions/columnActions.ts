// Fix the column creation in this file to include createdAt and updatedAt properties
// Adding the necessary properties to fix TypeScript errors

import { v4 as uuidv4 } from "uuid";
import { Column, Task } from "@/types";

export const ADD_COLUMN = "ADD_COLUMN";
export const REMOVE_COLUMN = "REMOVE_COLUMN";
export const UPDATE_COLUMN = "UPDATE_COLUMN";

interface AddColumnAction {
  type: typeof ADD_COLUMN;
  payload: Column;
}

interface RemoveColumnAction {
  type: typeof REMOVE_COLUMN;
  payload: string; // Column ID
}

interface UpdateColumnAction {
  type: typeof UPDATE_COLUMN;
  payload: {
    id: string;
    updates: Partial<Column>;
  };
}

export type ColumnActionTypes =
  | AddColumnAction
  | RemoveColumnAction
  | UpdateColumnAction;

// Fix the column creation to include createdAt and updatedAt
export const createColumn = (title: string): Column => {
  const now = new Date();
  return {
    id: uuidv4(),
    title,
    tasks: [],
    createdAt: now,
    updatedAt: now
  };
};

export const addColumn = (title: string): ColumnActionTypes => {
  const newColumn = createColumn(title);
  return {
    type: ADD_COLUMN,
    payload: newColumn,
  };
};

export const removeColumn = (id: string): ColumnActionTypes => {
  return {
    type: REMOVE_COLUMN,
    payload: id,
  };
};

export const updateColumn = (
  id: string,
  updates: Partial<Column>
): ColumnActionTypes => {
  return {
    type: UPDATE_COLUMN,
    payload: { id, updates },
  };
};
