import 'dotenv/config'
import GSheetDB from './GSheetDB'


let db = new GSheetDB({
  sheetId: process.env.GSHEET_ID,
  headers: 1,
})

db.getData().then(data => console.log(data.data.values))