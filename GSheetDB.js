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
    this.headerRow = []
    this.sheetName = params.sheetName
    this.client = undefined
    this.data = []
    // this.data = lokiDB.addCollection('data')
  }

  /**
   * Setup database
   *  - create client;
   *  - load data in Loki
   */
  async connect() {
    if (this.client) return
    
    try {
      // if credentials.json does not exist, use environment var
      const credentials = process.env.GOOGLE_AUTH_CREDS
        ? JSON.parse(process.env.GOOGLE_AUTH_CREDS)
        : require('./credentials.json')

      this.client = auth.fromJSON(credentials);
      this.client.scopes = SCOPES
      await this.client.authorize()
      console.log('✨ Created new client.')

    } catch (e) { console.log('error getting client') }
  }

  /**
   * Fetch data from provided range
   */
  async getData(dataRange = this.sheetName) {
    try {
      await this.connect()

      let response = await sheetsApi.spreadsheets.values.get({
        auth: this.client,
        spreadsheetId: this.spreadsheetId,
        range: dataRange,
        valueRenderOption: 'UNFORMATTED_VALUE',
      })

      this.headerRow = response.data.values[0]
      let values = response.data.values.slice(1)

      return values.map((row, rowNb) => {
        let obj = {
          values: row,
          // update: false,
          rowNb: rowNb + 2
        }

        // this.headerRow.forEach((columnName, columnNb) => {
        //   obj[columnName] = row[columnNb-1]
        // })

        return obj
      })

    } catch (e) { console.log(`Error in Model.loadData(): ${e}`) }
  }

  async insertRow(rowArray) {
    try {
      await this.connect()

      await sheetsApi.spreadsheets.values.append({
        auth: this.client,
        spreadsheetId: this.spreadsheetId,
        range: `${this.sheetName}`,
        insertDataOption: 'INSERT_ROWS',
        valueInputOption: 'RAW',
        resource: {
          range: this.sheetName,
          majorDimension: 'ROWS',
          values: [ rowArray ]
        }
      })
      console.log('💾 Data saved.')

    } catch (e) { console.log(e) }
  }

  async updateRow(rowNumber, rowArray) {
    try {
      await this.connect()

      await sheetsApi.spreadsheets.values.batchUpdate({
        auth: this.client,
        spreadsheetId: this.spreadsheetId,
        resource: {
          valueInputOption: 'RAW',
          data: {
            range: `${this.sheetName}!${rowNumber}:${rowNumber}`,
            majorDimension: 'ROWS',
            values: [ rowArray ]
          }
        }
      })

    } catch (e) { console.log(e) }
  }

}
