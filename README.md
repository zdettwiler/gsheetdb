# gsheetdb
Use Google Sheets as a database.

---

## Preparing the spreadsheet

1. **Activate Google Sheets API.** Go to the [Google API Console Library](https://console.cloud.google.com/apis/library/sheets.googleapis.com) and enable *Google Sheets API*.

1. **Create a Project.** Go to the [Dashboard](https://console.cloud.google.com/apis/dashboard) and click on *Credentials* in the sidebar. If this is the first time you set this up, you will need to create a new project. Otherwise you can either use an existing project or create a new one from the project drop down menu in the navigation bar.

1. **Create a Service Account.** Once you've got a project, from the *Credentials* section, click on *Create Credentials* from the top and select *Service account* from the drop down menu. Provide a name and an ID (which will become an e-mail address). Then you'll be asked for a role. You need Read & Write permissions so *Project* > *Owner* would work well. Fill in the optional fields if you wish.

1. **Create the JSON key.** You'll be redirected to the *Credentials* page. Scroll down to the bottom of the page and edit your service account by clicking on the pen icon. In the *Keys* section, *Add Key* and make sure you choose *JSON*. You'll be downloading a JSON file; save it preciously.
While you're here in the KAlso make a note of your service account e-mail address.

1. **Set up your spreadsheet.** Create or open the Google Sheet you wish to use as your database. Click on *Share* and under *People*, paste the e-mail address from your service account (you can find it again on the *Google Console*, in the *Credentials* section of your project, under *Service Accounts* at the end of the page). Share.

That's it! In the JS code below, you'll see that you will need to provide the JSON key you just downloaded. **DO NOT commit the JSON key!** Add the file to `.gitignore` now and import it into the code! Or use environment variables.


---

Let's assume this spreadsheet:

. | A | B | C
--- | --- | --- | ---
1 | **date** | **amount** | **description**
2 | today | 123 | abc

The first row will always be considered as headers.


## Connecting to the sheet
```javascript
import gsheetdb from 'gsheetdb'

let db = new gsheetdb({
  spreadsheetId: 'sheetId', // replace with spreadsheet id (from URL)
  sheetName: 'sheetName',   // replace with sheet name
  credentialsJSON: {}       // replace with JSON formatted credentials
})
```


## Getting the data
So let's begin to read some data:
```javascript
let data = await db.getData()
```

Data returned will look like:
```javascript
[
  {
    values: [ 'today', 123, 'abc' ],
    rowNb: 2
  }
]
```

*Would you prefer to get the data in `key: value` format?*
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


## Insert rows
To add rows to the spreadsheet:
```javascript
await db.insertRows([
  ['tomorrow', 456, 'def'],
  ['monday', 23, 'ghi']
])
```

And the spreadsheet will look like this:

. | A | B | C
--- | --- | --- | ---
1 | **date** | **amount** | **description**
2 | today | 123 | abc
3 | tomorrow | 456 | def
4 | monday | 23 | ghi


## Update a row
To update a row, provide the spreadsheet row number (not the array id):
```javascript
await db.updateRow(
  3, ['yesterday', 456, 'def']
)
```

. | A | B | C
--- | --- | --- | ---
1 | **date** | **amount** | **description**
2 | today | 123 | abc
3 | yesterday | 456 | def
4 | monday | 23 | ghi


*Would it be useful to be able to update several rows at a time?*