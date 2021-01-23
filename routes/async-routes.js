const { GoogleSpreadsheet } = require('google-spreadsheet')
const hasOwnProperty = (obj, propertyName) => Object.prototype.hasOwnProperty.call(obj, propertyName)

const SHEET_ID = process.env.SHEET_ID // the long id in the sheets URL
const VALID_COLUMNS = process.env.VALID_COLUMNS ? process.env.VALID_COLUMNS.split(',') : []
const VALID_VALUES = process.env.VALID_VALUES ? process.env.VALID_VALUES.split(',') : [] // value with typeof number is also allowed

const doc = new GoogleSpreadsheet(SHEET_ID)

module.exports = async function initRoutes(router) {
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY, // suround with double quotes in .env
  })
  await doc.loadInfo() // loads document properties and worksheets
  console.log(`Loaded Sheet: ${doc.title}`)

  async function getRows(sheetIndex = 0) {
    const sheet = doc.sheetsByIndex[sheetIndex]
    const rows = await sheet.getRows() // can pass in { limit, offset }
    return rows
  }

  async function getRowsResponse(_req, res, sheetIndex = 0) {
    const sheet = doc.sheetsByIndex[sheetIndex]
    const rows = await sheet.getRows() // can pass in { limit, offset }

    if (rows.length < 1) {
      const responseObj = {headers: [], rows: []}
      res.json(responseObj)
    }

    const headers = rows[0]._sheet.headerValues
    const newRows = rows.map(row => row._rawData.map(r => `${r}`))
    const responseObj = {headers, rows: newRows}
    res.json(responseObj)
  }

  router.get('/sheets', async (_req, res) => {
    await doc.resetLocalCache(false)
    await doc.loadInfo()
    const sheets = doc.sheetsByIndex
    res.json({count: sheets.length, titles: [...sheets.map(sheet => sheet.title)]})
  });

  router.get('/rows', (req, res) => {
    getRowsResponse(req, res)
  });

  router.get('/rows/:sheetIndex', (req, res) => {
    getRowsResponse(req, res, req.params.sheetIndex)
  });

  router.post('/add-rows', async (req, res) => {
    if (!req.body) {
      res.status(400).send(`Missing ${req.method} body`)
      return
    }

    const sheetIndex = hasOwnProperty(req.body, 'sheetIndex') ? req.body.sheetIndex : 0

    if (Object.keys(req.body).length === 0) {
      res.status(400).send(`${req.method} body is present, but empty - Is 'content-type' header set?`)
      return
    }

    if (!hasOwnProperty(req.body, 'headers')) {
      res.status(400).send(`Missing required property 'headers' in ${req.method} body`)
      return
    }
    const headers = req.body.headers

    if (!hasOwnProperty(req.body, 'rows')) {
      res.status(400).send(`Missing required property 'rows' in ${req.method} body`)
      return
    }
    const rows = req.body.rows

    try {
      const rowsArr = rows.map(row => {
        return headers.reduce((acc, cur, i) => {
          acc[cur] = row[i]
          return acc
        }, {})
      })

      const sheet = doc.sheetsByIndex[sheetIndex]

      await sheet.addRows(rowsArr) // save new rows

      getRowsResponse(req, res, sheetIndex)
    } catch(e) {
      console.error(e)
      res.status(500).send('Internal server error')
    }
  })

  router.put('/update-cell', async (req, res) => {
    /*
      * {
      *  sheetIndex: 0,
      *  columnName: 'MyValidColumnName',
      *  value: 'MyValidString'|{Number},
      *  rowIndex: 0
      * }
      */
    if (!req.body) {
      res.status(400).send(`Missing ${req.method} body`)
      return
    }

    const sheetIndex = hasOwnProperty(req.body, 'sheetIndex') ? req.body.sheetIndex : 0

    if (Object.keys(req.body).length === 0) {
      res.status(400).send(`${req.method} body is present, but empty - Is 'content-type' header set?`)
      return
    }

    if (!hasOwnProperty(req.body, 'columnName')) {
      res.status(400).send(`Missing required property 'columnName' in ${req.method} body`)
      return
    }
    const columnName = req.body.columnName

    if (!hasOwnProperty(req.body, 'value')) {
      res.status(400).send(`Missing required property 'value' in ${req.method} body`)
      return
    }
    const value = req.body.value

    if (!hasOwnProperty(req.body, 'rowIndex')) {
      res.status(400).send(`Missing required property 'rowIndex' in ${req.method} body`)
      return
    }
    const rowIndex = Number(req.body.rowIndex)

    const rows = await getRows(sheetIndex) // can pass in { limit, offset }

    if (rows.length < rowIndex) {
      res.status(409).send(`Property 'rowIndex' (provided in ${req.method} body) of ${rowIndex} is out of range (rows.length == ${rows.length})`)
      return
    }

    if (rowIndex >= rows.length) {
      res.status(404).send(`Row index ${rowIndex} does not yet exist`)
      return
    }
    if (!hasOwnProperty(rows[rowIndex], columnName)) {
      res.status(404).send(`Column name '${columnName}' not found for sheet ${sheetIndex}`)
      return
    }
    try {
      if (VALID_COLUMNS.length > 0 && !VALID_COLUMNS.includes(columnName.toLowerCase())) {
        res.status(400).send(`Must provide one of '${VALID_COLUMNS.join('\', \'')}' column`)
        return
      }
      if (VALID_VALUES.length > 0 && typeof value !== 'number' && !VALID_VALUES.includes(value.toLowerCase())) {
        res.status(400).send(`Must provide an allowed value`)
        return
      }
      rows[rowIndex][columnName] = value
      const lastUpdateColumnName = 'time'
      if (!hasOwnProperty(rows[rowIndex], lastUpdateColumnName)) {
        console.warn(`Column name '${lastUpdateColumnName}' not found, please create one for sheet ${sheetIndex}`)
      } else {
        rows[rowIndex][lastUpdateColumnName] = new Date().toUTCString()
      }
      await rows[rowIndex].save()
      getRowsResponse(req, res, sheetIndex)
    } catch(e) {
      console.error(e)
      res.status(500).send('Internal server error')
    }

  })
}
