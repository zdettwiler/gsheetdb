import 'dotenv/config'
import GSheetDB from './GSheetDB'


async function testdb() {

  // await db.insertRow([12, 34, 567])

  // await db.updateRow(10, ['', '', 'updated', 'data'])

  let data = await db.getData()
  console.log(data)

}

let db = new GSheetDB({
  sheetId: process.env.GSHEET_ID,
  headers: 1,
  sheetName: process.env.GSHEET_RANGE
})

testdb()

