import 'dotenv/config'
import db from './db'
import Model from './Model'


let wordSchema = [
  {
    column: 'A',
    columnName: 'date',
    type: String
  },
  {
    column: 'B',
    columnName: 'account',
    type: String
  },
  {
    column: 'C',
    columnName: 'amount',
    type: String
  },
  {
    column: 'D',
    columnName: 'type',
    type: Number
  },
  {
    column: 'E',
    columnName: 'descr',
    type: String
  },
  {
    column: 'F',
    columnName: 'categ',
    type: String
  }
]

export default new Model(db, process.env.GSHEET_RANGE, wordSchema)
