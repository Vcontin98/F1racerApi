class F1Table {
  constructor(id, results_per_page = 7) {
    this.node = document.getElementById(id)
    this.createForm = this.createForm.bind(this)
    this.createTable = this.createTable.bind(this)
    this.populateRows = this.populateRows.bind(this)
    this.next = this.next.bind(this)
    this.prev = this.prev.bind(this)

    this.store = {}
    this.errors = []
    this.page_count = results_per_page
    this.start = 0
    this.year = 2018
    this.round = 1

    this.form = this.createForm()
    this.table = this.createTable()
    this.node.append(this.form)
    this.node.append(this.table)
    this.addEventListeners()
    this.generateRowsFromNewData()
  }

  async getData() {
    if (!this.store[this.year]) this.store[this.year] = {}
    if (!this.store[this.year][this.round]) {
      this.start = 0
      const response = await axios.get(`https://ergast.com/api/f1/${this.year}/${this.round}/driverStandings.json`)
      if (response.status === 200)
        this.store[this.year][this.round] = response.data['MRData']['StandingsTable']['StandingsLists'][0]['DriverStandings'];
      else this.errors.push(response.err)
    }
  }

  createForm() {
    const form = document.createElement('form')
    form.className = 'f1-form'
    form.setAttribute("id", "f1-form")

    const year = document.createElement('div')
    year.className = "form-group"
    year.innerHTML = `<label for="year">Year</label>
      <input id="input_year" type="number" name="year" value="2018" required minlength="4" maxlength="4" min="2000" max="2022"
        onchange="ft.yearUp()">`

    const roundField = document.createElement('div')
    year.className = "form-group"
    roundField.innerHTML = `<div class="form-group">
      <label for="round">Round</label>
      <input id="input_round" type="number" name="round" value="3" required minlength="1" min="1"
        onchange="ft.roundUp()">
    </div>`

    const pageField = document.createElement('div')
    pageField.className = "page-field"
    pageField.innerHTML = `
      <button class="prev">&#10094;</button>
      <button class="next">&#10095;</button>`

    form.appendChild(year)
    form.appendChild(pageField)
    form.appendChild(roundField)

    return form
  }
  createTable() {
    const table = document.createElement('table')
    table.className = "f1-table"
    table.innerHTML = `<tr>
      <th>Position</th>
      <th>Name</th>
      <th>Nationality</th>
      <th>Sponsor</th>
      <th>Points</th>
    </tr>`
    return table
  }
  next(e) {
    e.preventDefault()
    this.start = Math.min(this.start + this.page_count, this.results_count - 1)
    this.populateRows()
  }
  prev(e) {
    e.preventDefault()
    this.start = Math.max(this.start - this.page_count, 0)
    this.populateRows()
  }
  addEventListeners() {
    const next = document.querySelector(".next")
    next.addEventListener("click", this.next)
    const prev = document.querySelector(".prev")
    prev.addEventListener("click", this.prev)
  }
  yearUp() {
    this.year = document.getElementById("input_year").value
    this.generateRowsFromNewData()
  }
  roundUp() {
    this.round = document.getElementById("input_round").value
    this.generateRowsFromNewData()
  }
  async generateRowsFromNewData() {
    await this.getData()
      .then(() => { this.populateRows() })
      .catch((err) => {
        this.removeError_box()
        const error_box = document.createElement("div")
        error_box.className = "error_box"
        error_box.innerText = "Could not get more data. See console for details. You probably reached the end of the data."
        console.log(err);
        document.querySelector('.f1-table').insertAdjacentElement("afterend", error_box)
      })
  }
  populateRows() {
    document.querySelectorAll(".driverRowData")
      .forEach(row => row.remove())
    this.removeError_box()

    let drivers = this.store[this.year][this.round]
    this.results_count = drivers.length
    this.calcPagination()

    for (let i = this.start;
      i < Math.min(this.start + this.page_count, this.results_count);
      i++) {
      let data = drivers[i]
      let driver = data.Driver
      let driverName = `${driver.familyName} ${driver.givenName}`
      let sponsor = data.Constructors[0].name
      const tableRow = document.createElement('tr')
      tableRow.className = "driverRowData"
      tableRow.innerHTML = `
            <td>${data.position}</td>
            <td>${driverName}</td>
            <td>${driver.nationality}</td>
            <td>${sponsor}</td>
            <td>${data.points}</td>
          `
      this.table.appendChild(tableRow)
    }
  }
  removeError_box() {
    let e = document.querySelector('.error_box')
    if (e) e.remove()
  }
  calcPagination() {
    if (this.start + this.page_count >= this.results_count) {
      document.querySelector(".next").disabled = true
    }
    else
      document.querySelector(".next").disabled = false
    if (this.start === 0)
      document.querySelector(".prev").disabled = true
    else
      document.querySelector(".prev").disabled = false
  }
}

const ft = new F1Table("f1-table", 10)