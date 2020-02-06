


export default class Model {

  constructor(db, range, schema, nbHeaderRows=1) {
    this.db = db
    this.range = this.parseRange(range)
    this.schema = schema
    this.data = lokiDB.addCollection(range)
    this.nbHeaderRows = nbHeaderRows
    this.uid = Math.random().toString(36).substr(2, 9)
  }

  async connect(reload=false) {
    await this.db.connect()
    await this.loadData(reload)
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
   * Load data from spreadsheet into Loki
   */
  async loadData(reload=false) {
    // if (!!this.data.data.length && !reload) return

    try {
      let response = await this.db.fetchData(this.range.range)
      let values = response.data.values.slice(this.nbHeaderRows)

      let dataObj = values.map((rowArray, i) => {
          let obj = {}
          this.schema.forEach((col, i) => { obj[col.columnName] = rowArray[i] })
          obj.update = false
          obj.rowNb = this.range.startRow + this.nbHeaderRows + i

          return obj
        })

      // Clear all and replace with new data
      this.data.clear()
      this.data.insert(dataObj)
      console.log('📀 Loaded data.')

    } catch (e) { console.log(`Error in Model.loadData(): ${e}`) }
  }

  /**
   * Save updated rows to Google Sheet
   */
  async save() {
    let wordsToUpdate = this.data.find({ update: true })

    // prepare request
    let requests = wordsToUpdate.map(word => {
      let values = this.schema.map(col => word[col.columnName])

      return {
        range: `${this.range.sheetName}!${this.range.startCol}${word.rowNb}:${this.range.endCol}${word.rowNb}`,
        majorDimension: 'ROWS',
        values: [ values ]
      }
    })

    await this.db.save(requests)

    // reload data
    await this.loadData(true)
  }

  getData() {
    return this.data.data
  }

  /**
   * Find rows
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

  insertRow(insertObj) {
    this.data.insert({
      ...insertObj,
      update: true
    })
  }

}

/*

- create connection, i.e. client
db = GSheetDB.connect(sheetId)

- load data
schema = [{}, {}]
GreekWords = db.model(schema, range)
~OR~ GreekWords = new Model(db, range, schema)

GreekWords.find(query)
GreekWords.update()
GreekWords.save()


*/
