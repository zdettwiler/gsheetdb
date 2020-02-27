// let gsheetdb = require('./')
import gsheetdb from '.'


let db = new gsheetdb({
  spreadsheetId: process.env.SPREADSHEETID,
  sheetName: process.env.SHEETNAME,
  credentialsJSON: JSON.parse(process.env.CREDS)
})

db.getData().then(data => console.log(data))