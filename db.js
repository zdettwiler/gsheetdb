import 'dotenv/config'
import GSheetDB from './GSheetDB'

export default new GSheetDB(process.env.GSHEET_ID, process.env.GSHEET_RANGE)
