import GSheetDB from '../src/gsheetdb'

jest.mock('google-auth-library')
import { auth } from 'google-auth-library'

jest.mock('googleapis')
import { google } from 'googleapis'


let db

beforeEach(() => {
  db = new GSheetDB({
    spreadsheetId: 'spreadsheetId',
    sheetName: 'sheetName',
    credentialsJSON: 'credentialsJSON'
  })
})

describe('constructor', () => {
  it('returns a class', () => {
    expect(db).toBeInstanceOf(GSheetDB)
  })
  
  it('sets sheetId', () => {
    expect(db.spreadsheetId).toBe('spreadsheetId')
  })

  it('sets sheetName', () => {
    expect(db.sheetName).toBe('sheetName')
  })

  it('sets credentials', () => {
    expect(db.credentialsJSON).toBe('credentialsJSON')
  })
})

describe('connect', () => {
  let mockAuthorize
  
  beforeEach(() => {
    mockAuthorize = jest.fn().mockReturnValue(Promise.resolve())
    auth.fromJSON.mockClear().mockReturnValue({ authorize: mockAuthorize })
  })

  it('defines a connect method', () => {
    expect(db.connect).toBeInstanceOf(Function)
  })

  it('calls auth.fromJSON if client does not exist', async () => {
    db.credentialsJSON = { credentials: 'abc' }
    db.client = undefined
    await db.connect()
    expect(auth.fromJSON).toHaveBeenCalledWith({ credentials: 'abc' })

  })

  it('makes no calls if client already exists', async () => {
    db.client = { client: 'stuff' }
    await db.connect()
    expect(auth.fromJSON).not.toHaveBeenCalled()
  })

  it('adds scopes to client', async () => {
    await db.connect()
    expect(db.client.scopes).toEqual(['https://www.googleapis.com/auth/spreadsheets'])
  })

  it('calls authorize()', async () => {
    await db.connect()
    expect(mockAuthorize).toHaveBeenCalled()
  })

  it('throws if authorize() throws', async () => {
    mockAuthorize = jest.fn().mockImplementation(() => { throw new Error('error') })
    auth.fromJSON.mockReturnValue({ authorize: mockAuthorize })
    await expect(db.connect()).rejects.toThrowError('Error in GSheetDB.connect:\nError: error')
  })
})

describe('getData', () => {
  let mockConnect
  let mockGet
  
  beforeEach(() => {
    mockGet = jest.fn().mockImplementation(() => Promise.resolve({
      data: { values: [
        [ 'row1col1', 'row1col2' ],
        [ 'row2col1', 'row2col2' ],
        [ 'row3col1', 'row3col2' ]
      ]}
    }))
    google.sheets.mockClear().mockReturnValue({ spreadsheets: {
      values: { get: mockGet }
    }})

    mockConnect = jest.fn().mockImplementation(() => Promise.resolve())
    db.connect = mockConnect
  })

  it('defines a getData method', () => {
    expect(db.getData).toBeInstanceOf(Function)
  })

  it('calls connect', async () => {
    await db.getData()
    expect(mockConnect).toHaveBeenCalled()
  })

  it('calls sheetsApi.spreadsheets.values.get', async () => {
    db.client = { client: 'stuff' }
    await db.getData()
    expect(mockGet).toHaveBeenCalledWith({
      auth: { client: 'stuff' },
      spreadsheetId: 'spreadsheetId',
      range: 'sheetName',
      valueRenderOption: 'UNFORMATTED_VALUE',
    })
  })

  it('calls sheetsApi.spreadsheets.values.get with provided range', async () => {
    db.client = { client: 'stuff' }
    await db.getData('range')
    expect(mockGet).toHaveBeenCalledWith(expect.objectContaining({
      range: 'range'
    }))
  })

  it('sets headerRow', async () => {
    db.client = { client: 'stuff' }
    await db.getData()
    expect(db.headerRow).toEqual(['row1col1', 'row1col2'])
  })

  it('returns spreadsheet data properly formatted', async () => {
    db.client = { client: 'stuff' }
    expect(await db.getData()).toEqual([
      {
        values: ['row2col1', 'row2col2'],
        rowNb: 2
      },
      {
        values: ['row3col1', 'row3col2'],
        rowNb: 3
      }
    ])
  })

  it('throws if authorize() throws', async () => {
    mockConnect = jest.fn().mockImplementation(() => { throw new Error('error') })
    db.connect = mockConnect
    await expect(db.getData()).rejects.toThrowError('Error in GSheetDB.getData:\nError: error')
  })
})

describe('insertRows', () => {
  let mockConnect
  let mockAppend
  
  beforeEach(() => {
    mockAppend = jest.fn().mockImplementation(() => Promise.resolve())
    google.sheets.mockClear().mockReturnValue({ spreadsheets: {
      values: { append: mockAppend }
    }})

    mockConnect = jest.fn().mockImplementation(() => Promise.resolve())
    db.connect = mockConnect
  })

  it('defines a insertRows method', () => {
    expect(db.insertRows).toBeInstanceOf(Function)
  })

  it('throws if rows is not provided', async () => {
    await expect(db.insertRows()).rejects.toThrowError('No rows provided!')
  })

  it('throws if rows is not an array', async () => {
    await expect(db.insertRows('row')).rejects.toThrowError('No rows provided!')
  })

  it('throws if rows is an empty array', async () => {
    await expect(db.insertRows([])).rejects.toThrowError('No rows provided!')
  })

  it('calls connect', async () => {
    await db.insertRows([['data']])
    expect(mockConnect).toHaveBeenCalled()
  })

  it('calls sheetsApi.spreadsheets.values.append', async () => {
    db.client = { client: 'stuff' }
    await db.insertRows([['a', 'b', 'c']])
    expect(mockAppend).toHaveBeenCalledWith({
      auth: { client: 'stuff' },
      spreadsheetId: 'spreadsheetId',
      range: 'sheetName',
      insertDataOption: 'INSERT_ROWS',
      valueInputOption: 'RAW',
      resource: {
        range: 'sheetName',
        majorDimension: 'ROWS',
        values: [['a', 'b', 'c']]
      }
    })
  })

  it('throws if error', async () => {
    mockConnect = jest.fn().mockImplementation(() => { throw new Error('error') })
    db.connect = mockConnect
    await expect(db.insertRows([['data']])).rejects.toThrowError('Error in GSheetDB.insertRows:\nError: error')
  })
})