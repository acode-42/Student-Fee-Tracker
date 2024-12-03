document.addEventListener("DOMContentLoaded", loadRecords);

document.getElementById("paymentForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const studentName = document.getElementById("studentName").value;
    const date = document.getElementById("date").value;
    const amount = document.getElementById("amount").value;

    addRecord({ studentName, date, amount, status: 'Unpaid' });
    clearForm();
});

function addRecord(record) {
    const records = getRecords();
    records.push(record);
    saveRecords(records);
    renderRecords();
}

function renderRecords() {
    const records = getRecords();
    const tbody = document.querySelector("#paymentRecords tbody");
    tbody.innerHTML = "";

    records.forEach((record, index) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${record.studentName}</td>
            <td>${record.date}</td>
            <td>${record.amount}</td>
            <td>
                <button class="btn-small ${record.status === 'Paid' ? 'green' : 'red'}" onclick="toggleStatus(${index})">${record.status}</button>
            </td>
            <td class="action-buttons">
                <button class="btn edit-btn" onclick="editRecord(${index})">Edit</button>
                <button class="btn delete-btn" onclick="deleteRecord(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(newRow);
    });
}

function toggleStatus(index) {
    const records = getRecords();
    const currentStatus = records[index].status;
    records[index].status = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';

    if (records[index].status === 'Unpaid') {
        const nextMonth = new Date(records[index].date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        addRecord({
            studentName: records[index].studentName,
            date: nextMonth.toISOString().split('T')[0],
            amount: records[index].amount,
            status: 'Unpaid'
        });
    }

    saveRecords(records);
    renderRecords();
}

function getRecords() {
    const records = localStorage.getItem("paymentRecords");
    return records ? JSON.parse(records) : [];
}

function saveRecords(records) {
    localStorage.setItem("paymentRecords", JSON.stringify(records));
}

function deleteRecord(index) {
    const records = getRecords();
    records.splice(index, 1);
    saveRecords(records);
    renderRecords();
}

function editRecord(index) {
    const records = getRecords();
    const record = records[index];

    document.getElementById("studentName").value = record.studentName;
    document.getElementById("date").value = record.date;
    document.getElementById("amount").value = record.amount;

    deleteRecord(index);
}


function clearForm() {
    document.getElementById("paymentForm").reset();
}


function loadRecords() {
    renderRecords();
}


function filterRecords() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const records = getRecords();
    const filteredRecords = records.filter(record => record.studentName.toLowerCase().includes(query));
    
    renderFilteredRecords(filteredRecords);
}


function renderFilteredRecords(filteredRecords) {
    const tbody = document.querySelector("#paymentRecords tbody");
    tbody.innerHTML = "";

    filteredRecords.forEach((record, index) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td>${record.studentName}</td>
            <td>${record.date}</td>
            <td>${record.amount}</td>
            <td>
                <button class="btn-small ${record.status === 'Paid' ? 'green' : 'red'}" onclick="toggleStatus(${index})">${record.status}</button>
            </td>
            <td class="action-buttons">
                <button class="btn edit-btn" onclick="editRecord(${index})">Edit</button>
                <button class="btn delete-btn" onclick="deleteRecord(${index})">Delete</button>
            </td>
        `;
        tbody.appendChild(newRow);
    });
}

function sortRecords() {
    const sortOption = document.getElementById("sortOptions").value;
    let records = getRecords();

    switch (sortOption) {
        case "name":
            records.sort((a, b) => a.studentName.localeCompare(b.studentName));
            break;
        case "date":
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            break;
        case "amount":
            records.sort((a, b) => a.amount - b.amount);
            break;
        default:
            break;
    }

    saveRecords(records);
    renderRecords();
}


document.getElementById("exportBtn").addEventListener("click", function() {
    const records = getRecords();
    const csvContent = "data:text/csv;charset=utf-8," 
        + "Student Name,Date,Amount Paid,Status\n" 
        + records.map(record => `${record.studentName},${record.date},${record.amount},${record.status}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "payment_records.csv");
    document.body.appendChild(link); // Required for FF

    link.click(); 
});
