import { JWT, UserRefreshClient } from 'google-auth-library'

export default class gsheetdb {
  spreadsheetId: string
  sheetName: string
  credentialsJSON: object

  client?: JWT | UserRefreshClient
  headerRow: Row

  constructor(parameters: GSheetDBParameters)

  connect(): Promise<void>
  getData(dataRange?: string): Promise<SheetData>
  insertRows(rows: Row[]): Promise<void>
  updateRow(rowNumber: number, rowArray: Row): Promise<void>
}

export interface GSheetDBParameters {
  spreadsheetId: string
  sheetName: string
  credentialsJSON: object
}

export type SheetData = {
  values: Row
  rowNb: number
}[]

export type Row = (boolean | string | number | null)[]
