const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');
const connectToDB = require('./Database/db');  // ✅ import before use

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieparser());

connectToDB();  