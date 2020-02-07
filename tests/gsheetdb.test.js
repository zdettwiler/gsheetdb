import GSheetDB from '../src/gsheetdb'

jest.mock('google-auth-library')
import { auth } from 'google-auth-library'


let db

beforeEach(() => {
  db = new GSheetDB({
    sheetId: 'sheetId',
    sheetName: 'sheetName'
  })
})

describe('constructor', () => {
  it('returns a class', () => {
    expect(db).toBeInstanceOf(GSheetDB)
  })
  
  it('sets sheetId', () => {
    expect(db.sheetId).toBe('sheetId')
  })

  it('sets sheetName', () => {
    expect(db.sheetName).toBe('sheetName')
  })
})

describe('connect', () => {
  let mockAuthorize
  
  beforeEach(() => {
    mockAuthorize = jest.fn().mockReturnValue(Promise.resolve())
    auth.fromJSON.mockReturnValue({ authorize: mockAuthorize })
  })

  it('defines a connect method', () => {
    expect(db.connect).toBeInstanceOf(Function)
  })

  it('makes no calls if client already exists', async () => {
    db.client = {}
    await db.connect()
    expect(auth.fromJSON).not.toHaveBeenCalled()
  })

  it('makes no calls if client already exists', async () => {
    db.connect({ credentials: 'abc' })
    expect(auth.fromJSON).toHaveBeenCalledWith({ credentials: 'abc' })
  })

  it('adds scopes to client', async () => {
    await db.connect()
    expect(db.client.scopes).toEqual(['https://www.googleapis.com/auth/spreadsheets'])
  })

  it('calls authorize()', async () => {
    await db.connect()
    expect(mockAuthorize).toHaveBeenCalled()
  })

  it('console.logs if authorize() throws', async () => {
    mockAuthorize = jest.fn().mockImplementation(() => { throw new Error('error') })
    auth.fromJSON.mockReturnValue({ authorize: mockAuthorize })
    await expect(db.connect()).rejects.toThrowError('Error in GSheetDB.connect:\nError: error')
  })
})

