# Google Sheets as a Database
```sh
curl -X PUT http://localhost:3000/update-cell --header 'content-type: application/json' --data '{"sheetIndex": 0,"columnName": "bookmark","value": "https://zvakanaka.github.io", "rowIndex": 2, "readBack": true}'
```