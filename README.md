# Google Sheets as a Database
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
curl -X POST http://localhost:3000/add-row \
--header 'content-type: application/json' \
--data '{
  "sheetIndex": 0,
  "headers": [ "title", "bookmark", "time" ],
  "rows": [[ "My GitHub Blog", "https://zvakanaka.github.io", "Fri, 25 Sep 2020 04:49:22 GMT" ]],
  "readBack": true
}'
```

## Read Rows
```sh
curl http://localhost:3000/rows
```
Example Output:
```json
{
  "headers": [
    "title",
    "bookmark",
    "time"
  ],
  "rows": [
    [
      "My GitHub Blog",
      "https://zvakanaka.github.io",
      "Fri, 25 Sep 2020 04:49:22 GMT"
    ],
    [
      "Hacker News",
      "https://news.ycombinator.com/best",
      "Fri, 25 Sep 2020 05:30:02 GMT"
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
Example Output:
```json
{
  "count": 1,
  "titles": [
    "Sheet1"
  ]
}
```

