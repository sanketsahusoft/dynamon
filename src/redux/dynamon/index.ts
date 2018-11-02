import {ItemList, TableDescription} from 'aws-sdk/clients/dynamodb'

/**
 * action types
 */
export enum ActionTypes {
  SET_TABLE      = 'set table',
  READ_ENDPOINTS = 'read endpoints',

  READ_TABLES    = 'read tables',

  CREATE_TABLE   = 'create table',
  READ_TABLE     = 'read table',
  UPDATE_TABLE   = 'update table',
  DELETE_TABLE   = 'delete table',

  CREATE_RECORDS = 'create records',
  READ_RECORDS   = 'read records',
  UPDATE_RECORDS = 'update records',
  DELETE_RECORDS = 'delete records',

  CREATE_RECORD  = 'create record',
  UPDATE_RECORD  = 'update record',
  DELETE_RECORD  = 'delete record',
}

/**
 * actions
 */
export const actions = {
  setTable     : (tableName: string) => action(false, ActionTypes.SET_TABLE, tableName),
  readEndpoints: () => action(true, ActionTypes.READ_ENDPOINTS),
  readTables   : (endpoint: Endpoint) => action(true, ActionTypes.READ_TABLES, endpoint),
  readTable    : (tableName: string) => action(true, ActionTypes.READ_TABLE, tableName),
  createRecords: (tableName: string, records: any[]) => action(true, ActionTypes.CREATE_RECORDS, {tableName, records}),
  readRecords  : (tableName: string) => action(true, ActionTypes.READ_RECORDS, tableName),
  createRecord : (tableName: string, record: any) => action(true, ActionTypes.CREATE_RECORD, {tableName, record}),
  updateRecord : (tableName: string, record: any) => action(true, ActionTypes.UPDATE_RECORD, {tableName, record}),
  deleteRecord : (record: any) => action(true, ActionTypes.DELETE_RECORD, record),
}
//responseActions shouldn't be dispatched by frontend
export const responseActions = {
  readEndpoints: (endpoints: Endpoint[]) => responseAction(ActionTypes.READ_ENDPOINTS, endpoints),
  readTables   : (tables: TableDescription[]) => responseAction(ActionTypes.READ_TABLES, tables),
  readTable    : (table: TableDescription) => responseAction(ActionTypes.READ_TABLE, table),
  createRecords: (result) => action(true, ActionTypes.CREATE_RECORDS, result),
  readRecords  : (records: any[]) => responseAction(ActionTypes.READ_RECORDS, records),
  updateRecord : (record: any) => responseAction(ActionTypes.UPDATE_RECORD, record),
  deleteRecord : () => responseAction(ActionTypes.DELETE_RECORD),
}

/*
 internal helper functions
 */
export function action<A extends ActionTypes>(universal: boolean, type: A): TypedAction<A>
export function action<A extends ActionTypes, P>(universal: boolean, type: A, payload: P): TypedActionWithPayload<A, P>
export function action<A extends ActionTypes, P>(universal: boolean, type: A, payload?: P) {
  if (payload !== undefined) {
    return {type, payload, universal}
  }
  return {type, universal}
}

export function responseAction<A extends ActionTypes>(type: A): TypedResponseAction<A>
export function responseAction<A extends ActionTypes, P>(type: A, payload: P): TypedResponseActionWithPayload<A, P>
export function responseAction<A extends ActionTypes, P>(type: A, payload?: P) {
  if (payload !== undefined) {
    return {type, payload}
  }
  return {type}
}

/*
 types
 */
export type Actions = typeof actions
export type ActionsReturnType = ReturnType<Actions[keyof Actions]>
export type ResponseActions = typeof responseActions
export type ResponseActionsReturnType = ReturnType<ResponseActions[keyof ResponseActions]>
export interface TypedAction<A> {
  type: A
  universal: boolean
}
export interface TypedActionWithPayload<A, P> extends TypedAction<A> {
  payload: P
}

export interface TypedResponseAction<A> {
  type: A
  response: true
}
export interface TypedResponseActionWithPayload<A, P> extends TypedResponseAction<A> {
  payload: P
}

export interface Endpoint {
  name: string
  region: string
  endpoint: string
}

/**
 * copy from dynamon
 */
const defaultState: DynamonState = {
  endpoints       : [],
  tables          : [],
  records         : null,
  table           : null,
  loadingEndpoints: false,
}
export const reducer = (state = defaultState, action) => {
  console.log('dynamon action', action)
  if (action.type.startsWith('@')) {
    return state
  }
  if ('response' in action) {
    const nextState = responseReducer(state, action)
    if (state !== nextState) {
      return nextState
    }
  }
  return actionReducer(state, action)

}
export const actionReducer = (state = defaultState, action: ActionsReturnType) => {
  switch (action.type) {
    case ActionTypes.SET_TABLE:
      return {...state, table: state.tables.find(t => t.TableName === action.payload)}
    case ActionTypes.READ_ENDPOINTS:
      return {...state, loadingEndpoints: true}
    case ActionTypes.READ_RECORDS:
      return {...state, records: defaultState.records}
    case ActionTypes.READ_TABLES:
      return {...state, tables: defaultState.tables}
  }
  return state
}
export const responseReducer = (state = defaultState, action: ResponseActionsReturnType) => {
  switch (action.type) {
    case ActionTypes.READ_ENDPOINTS:
      return {...state, endpoints: action.payload, loadingEndpoints: false}
    case ActionTypes.READ_TABLES:
      return {...state, tables: action.payload}
    case ActionTypes.READ_RECORDS:
      return {...state, records: action.payload}
  }

  return state
}

export interface DynamonState {
  endpoints: Endpoint[]
  tables: TableDescription[]
  table: TableDescription
  records: ItemList
  loadingEndpoints: boolean
}

