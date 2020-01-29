/**
 * Connection to Google Spreadsheet used as database.
 *
 * Usage:
 *  - connect to sheet;
 *  - make edits;
 *  - don't forget to save changes to update spreadsheet db
 */
import 'dotenv/config'
import { google } from 'googleapis'
import { auth } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const sheetsApi = google.sheets({ version: 'v4' })


export default class GSheetDB {

  constructor(spreadsheetId) {
    this.spreadsheetId = spreadsheetId
    this.client = undefined
  }

  /**
   * Setup database
   *  - create client;
   *  - load data in Loki
   */
  async connect() {
    await this.createClient()

    console.log('🔌 Connection to database successful.')
    return this
  }

  /**
   * Create client
   */
  async createClient() {
    if (!this.client) {
      // if credentials.json does not exist, use environment var
      const credentials = process.env.GOOGLE_AUTH_CREDS
        ? JSON.parse(process.env.GOOGLE_AUTH_CREDS)
        : require('./credentials.json')

      this.client = auth.fromJSON(credentials);
      this.client.scopes = SCOPES
      await this.client.authorize()
      console.log('✨ Created new client.')
    }
  }

  /**
   * Fetch data from provided range
   */
  async fetchData(range) {
    return sheetsApi.spreadsheets.values.get({
      auth: this.client,
      spreadsheetId: this.spreadsheetId,
      range: range,
      valueRenderOption: 'UNFORMATTED_VALUE',
    })
  }

  /**
   * Saves updated rows to Google Sheet
   */
  async save(requests) {
    // update spreadsheet
    await sheetsApi.spreadsheets.values.batchUpdate({
      auth: this.client,
      spreadsheetId: this.spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: requests
      }
    })
    console.log('💾 Data saved.')
  }
}
