export interface ActionState {
  ok: boolean;
  message: string;
  ts: number;
}
export const INITIAL_ACTION_STATE: ActionState = { ok: false, message: "", ts: 0 };
