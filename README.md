# Google Sheets as a Database
## Install
`git clone https://github.com/zvakanaka/sheets-db.git`  
`cd sheets-db`  
`npm install`  
Set up a Service Account by following instructions [here](https://theoephraim.github.io/node-google-spreadsheet/#/getting-started/authentication?id=service-account)  
  
Create a `.env` file in the `sheets-db` directory with the following contents:
```
GOOGLE_SERVICE_ACCOUNT_EMAIL=<YOUR_SERVICE_ACCOUNT_EMAIL_IS_NOT_YOUR_EMAIL>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nAndSoForth"
```  
  
`npm start`  
## Update Cell
```sh
curl -X PUT http://localhost:3000/update-cell \
--header 'content-type: application/json' \
--data '{
  "sheetIndex": 0,
  "columnName": "bookmark",
  "value": "https://zvakanaka.github.io",
  "rowIndex": 2,
  "readBack": true
}'
```

## Add Rows
```sh
curl -X POST http://localhost:3000/add-rows \
--header 'content-type: application/json' \
--data '{
  "sheetIndex": 0,
  "headers": [ "title", "bookmark", "tags", "time" ],
  "rows": [[ "My GitHub Blog", "https://zvakanaka.github.io", "blog,code", "Fri, 25 Sep 2020 04:49:22 GMT" ]],
  "readBack": true
}'
```

## Read Rows
```sh
curl http://localhost:3000/rows
```
Output:
```json
{
  "headers": [
    "title",
    "bookmark",
    "tags",
    "time"
  ],
  "rows": [
    [
      "My GitHub Blog",
      "https://zvakanaka.github.io",
      "blog,code",
      "Fri, 25 Sep 2020 04:49:22 GMT"
    ],
    [
      "Hacker News",
      "https://news.ycombinator.com/best",
      "news,cs",
      "Fri, 25 Sep 2020 04:50:30 GMT"
    ]
  ]
}
```

## Read Rows at Sheet Index
```sh
curl http://localhost:3000/rows/0
```

## Get Sheet Count and Titles
```sh
curl http://localhost:3000/sheets
```
Output:
```json
{
  "count": 1,
  "titles": [
    "Sheet1"
  ]
}
```

## Credit
[theoephraim/node-google-spreadsheet](https://github.com/theoephraim/node-google-spreadsheet)

## License
This is free and unencumbered public domain software. For more info, see https://unlicense.org.
