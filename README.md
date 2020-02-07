# gsheetdb
Use Google Sheets as a database.

---

Let's assume this spreadsheet:
. | A | B | C
--- | --- | --- | ---
1 | date | amount | description
2 | today | 123 | abc

## Connecting to the sheet
```javascript
import GSheetDB from 'gsheetdb'

let db = new GSheetDB({
  sheetId: 'sheetId',
  sheetName: 'sheetName',
  headerRow: true,
})
```

## Getting the data
So let's begin to read some data:
```javascript
let data = await db.getData()
```

Data returned will look like
```javascript
[
  {
    values: [ 'today', 123, 'abc' ],
    rowNb: 2
  }
]
```

May be useful to get it in `key: value` format?
```javascript
[
  {
    date: 'today',
    amount: 123,
    description: 'abc',
    rowNb: 2
  }
]
```

## Insert a row
Now if we add a row
```javascript
await db.insertRow(
  ['tomorrow', 456, 'def']
)
```

And table will look like this

. | A | B | C
--- | --- | --- | ---
1 | date | amount | description
2 | today | 123 | abc
3 | tomorrow | 456 | def

## Update a row
To update a row
```javascript
await db.updateRow(3,
  ['yesterday', 456, 'def']
)
```

. | A | B | C
--- | --- | --- | ---
1 | date | amount | description
2 | today | 123 | abc
3 | yesterday | 456 | def
