import { google } from 'googleapis'
import { auth } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']

export default class GSheetDB {
  constructor(parameters) {
    this.spreadsheetId = parameters.spreadsheetId
    this.sheetName = parameters.sheetName
    this.credentialsJSON = parameters.credentialsJSON
    this.client = undefined
    this.headerRow = []
    
  }

  async connect() {
    if (!!this.client) return

    this.client = auth.fromJSON(this.credentialsJSON)
    this.client.scopes = SCOPES

    try {
      await this.client.authorize()
      
    } catch (e) { throw new Error(`Error in GSheetDB.connect:\n${e}`) }
  }

  async getData(dataRange = this.sheetName) {
    try {
      await this.connect()

      let response = await google.sheets({ version: 'v4' }).spreadsheets.values.get({
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

    } catch (e) { throw new Error(`Error in GSheetDB.getData:\n${e}`) }

  }
}