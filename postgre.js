const express = require('express');
const { Pool } = require('pg');



const app = express();
const port = 5000;

app.use(express.urlencoded({ extended: true }));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'dhaarani***',
    port: 5432,
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

pool.connect((err) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    pool.query("CREATE TABLE IF NOT EXISTS personal_information (roll_no  VARCHAR(255),name VARCHAR(255),last_name VARCHAR(255),email VARCHAR(255),Age int,Address VARCHAR(255))", (err, result) => {
        if (err) {
            return console.error("Error creating table 'personal_information':", err);
        }
        console.log("Table 'personal_information' created successfully");
    });
});

app.post('/insert', async(req, res) => {
    const { roll,name,lname, mailid,age,address } = req.body;
    try {
        await pool.query("INSERT INTO personal_information (roll_no,name, last_name,email,Age,Address) VALUES ($1, $2,$3,$4,$5,$6);", [roll,name,lname,mailid,age,address]);
        res.send("Inserted");
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Error inserting data');
    }
});
app.post('/update', async(req, res) => {
    const { roll,name,lname, mailid,age,address } = req.body;
    try {
        await pool.query("UPDATE personal_information SET name=$1, last_name=$2, email=$3, Age=$4, Address=$5 WHERE roll_no=$6", [name, lname, mailid, age, address, roll]);
        res.send("Updated");
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Error updating data');
    }
});
app.post('/delete', async(req, res) => {
    const { roll } = req.body;
    try {
        await pool.query("DELETE FROM personal_information where roll_no=$1",[roll]);
        res.send("Deleted");
    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Error deleting data');
    }  
});
app.post('/find', async (req, res) => {
    const { roll, name, lname, mailid, age, address } = req.body;
    try {
        const result = await pool.query("SELECT * FROM personal_information");
        const items = result.rows;

        let tableContent = `
            <h1>All Documents</h1>
            <table border='1' class="t">
                <tr>
                    <th>Roll no</th>
                    <th>Name</th>
                    <th>Last Name</th>
                    <th>Email</th>
                    <th>Age</th>
                    <th>Address</th>
                </tr>
        `;

        tableContent += items.map(item => `
            <tr>
            <td>${item.roll_no}</td>
            <td>${item.name}</td>
            <td>${item.last_name}</td>
            <td>${item.email}</td>
            <td>${item.age}</td>
            <td>${item.address}</td>

            </tr>
        `).join("");
        tableContent += "</table><a href='/'>Back to form</a>";

        res.send(tableContent);

    } catch (err) {
        console.error('Error executing query', err.stack);
        res.status(500).send('Error displaying data');
    }
});

app.listen(port, () => {
    console.log(`Server is listening at http://localhost:${port}`);
});
