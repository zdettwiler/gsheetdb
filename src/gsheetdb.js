import { google } from 'googleapis'
import { auth } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const sheetsApi = google.sheets({ version: 'v4' })

export default class GSheetDB {
  constructor(parameters) {
    this.sheetId = parameters.sheetId
    this.sheetName = parameters.sheetName
    this.client = undefined
  }

  async connect(credentials) {
    if (this.client) return

    this.client = auth.fromJSON(credentials)
    this.client.scopes = SCOPES

    try {
      await this.client.authorize()
      
    } catch (e) { throw new Error(`Error in GSheetDB.connect:\n${e}`) }
  }
}