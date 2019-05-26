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
import loki from 'lokijs'
import credentials from './credentials.json'

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
const sheetsApi = google.sheets({ version: 'v4' })
let db = new loki('test.json')

export default class GSheetDB {

  constructor(spreadsheetId, range, nbHeaderRows=1) {
    this.spreadsheetId = spreadsheetId
    this.range = this.parseRange(range)
    this.nbHeaderRows = nbHeaderRows
    this.client = undefined
    this.data = db.addCollection('data')
  }


  /**
   * Parse range into constituents
   */
  parseRange(range) {
    let parse = range.match(/(.+)!([A-Z]+)(\d*):([A-Z]+)(\d*)/)

    return {
      range: parse[0],
      sheetName: parse[1],
      startCol: parse[2],
      startRow: parse[3] ? parseInt(parse[3]) : 1,
      endCol: parse[4],
      endRow: parse[5] ? parseInt(parse[5]) : 1000
    }
  }

  /**
   * Setup database
   *  - create client;
   *  - load data in Loki
   */
  async connect() {
    await this.createClient()
    await this.loadData()

    console.log('🔌 Connection to database successful.')
    return this
  }

  /**
   * Create client
   */
  async createClient() {
    if (!this.client) {
      this.client = auth.fromJSON(credentials);
      this.client.scopes = SCOPES
      await this.client.authorize()
      console.log('✨ Created new client.')
    }
  }

  /**
   * Load data into Loki database
   */
  async loadData(force=false) {
    if (!!this.data.data.length && !force) return

    let response = await sheetsApi.spreadsheets.values.get({
      auth: this.client,
      spreadsheetId: this.spreadsheetId,
      range: this.range.range,
      valueRenderOption: 'UNFORMATTED_VALUE',
    })

    // TODO: no assumption!
    // assumes first row is headers
    let keys = response.data.values[0]
    let values = response.data.values.slice(this.nbHeaderRows)

    let dataObj = values.map((arr, i) => {
      let obj = {}
      keys.forEach((key, i) => { obj[key] = arr[i] })
      obj.update = false
      obj.row = this.range.startRow + this.nbHeaderRows + i
      return obj
    })

    // Clear all and replace with new data
    this.data.clear()
    this.data.insert(dataObj)

    console.log('📀 Loaded data.')
  }


  getData() {
    return this.data.data
  }

  /**
   * Find
   * @param {Object} findObj - object of format { key: needle }
   */
  find(findObj) {
    return this.data.find(findObj)
  }


  /**
   * Find one row
   * @param {Object} findObj - object of format { key: needle }
   */
  findOne(findObj) {
    return this.data.findOne(findObj)
  }

  /**
   * Update a row
   * @param {Object} findObj - object of format { key: needle }
   * @param {Object} modifsObj - object { key1: newValue, key2: newValue }
   */
  updateRow(findObj, modifsObj) {
    let wordToUpdate =  this.data.findOne(findObj)
    wordToUpdate = {
      ...wordToUpdate,
      ...modifsObj,
      update: true
    }
    this.data.update(wordToUpdate)
  }

  /**
   * Saves updated rows to Google Sheet
   */
  async save() {
    let wordsToUpdate = this.data.find({ update: true })

    // prepare request
    let requests = wordsToUpdate.map(word => {
      let values = [
        word.greek,
        word.french,
        word.english,
        word.chapter,
        word.known,
        word.revisionBox,
        word.lastRevised
      ]

      return {
        range: `${this.range.sheetName}!${this.range.startCol}${word.row}:${this.range.endCol}${word.row}`,
        majorDimension: 'ROWS',
        values: [ values ]
      }
    })

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

    // reload data
    await this.loadData(true)
  }


}

export default GSheetDB
