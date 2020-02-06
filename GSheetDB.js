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

  constructor(params) {
    // TO DO check params
    console.log(params)
    this.spreadsheetId = params.sheetId
    this.headers = params.headers
    this.client = undefined
  }

  /**
   * Setup database
   *  - create client;
   *  - load data in Loki
   */
  async connect() {
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
  async getData(range) {
    this.connect()

    let dataRange = range
      ? range
      : process.env.GSHEET_RANGE

    let data = sheetsApi.spreadsheets.values.get({
      auth: this.client,
      spreadsheetId: this.spreadsheetId,
      range: dataRange,
      valueRenderOption: 'UNFORMATTED_VALUE',
    })

    return data
  }

  /**
   * Saves updated rows to Google Sheet
   */
  async save(requests) {
    // update spreadsheet
    try {
      // await sheetsApi.spreadsheets.values.batchUpdate({
      //   auth: this.client,
      //   spreadsheetId: this.spreadsheetId,
      //   resource: {
      //     valueInputOption: 'RAW',
      //     data: requests
      //   }
      // })

      await sheetsApi.spreadsheets.values.append({
        auth: this.client,
        spreadsheetId: this.spreadsheetId,
        range: 'gsheetdb!A1:F',
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'RAW',
        resource: {
          range: 'gsheetdb!A1:F',
          majorDimension: 'ROWS',
          values: [ ['date', undefined, undefined, 987, 'test'] ]
        }
      })
      console.log('💾 Data saved.')

    } catch (e) { console.log(e) }
  }
}
