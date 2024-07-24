const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();

// const requestLogger = (req, res, next) => {
//   console.log("Method:", req.method);
//   console.log("Path:", req.path);
//   console.log("Body:", req.body);
//   console.log("-----");
//   next();
// };
// app.use(requestLogger);

app.use(express.json());
app.use(cors());
morgan.token("body", (req) => JSON.stringify(req.body));
const tinyMorganWithBody =
  ":method :url :status :res[content-length] - :response-time ms :body";

app.use(morgan(tinyMorganWithBody));

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

const generateId = () => {
  return Math.floor(Math.random() * 1000000000);
};

app.post("/api/persons", (req, res) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Missing parameters, please fill all the fields",
    });
  }
  const existingName = persons.find(
    (p) => p.name.toLowerCase() === body.name.toLowerCase()
  );
  if (existingName) {
    return res.status(400).json({
      error: `${body.name} is already added to phonebook. Name must be unique`,
    });
  }
  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };
  persons = persons.concat(person);
  res.json(person);
});

app.get("/api/persons", (req, res) => {
  res.json(persons);
});

app.get("/info", (req, res) => {
  const infoText = `<p>Phonebook has info for ${persons.length} people</p>`;
  const requestedAt = `<p>${new Date(Date.now()).toString()}</p>`;

  res.send(`${infoText} ${requestedAt}`);
});

app.get("/api/persons/:id", (req, res) => {
  const id = req.params.id;

  const person = persons.find((p) => p.id === Number(id));
  if (!person) {
    return res.status(400).json({
      error: `No person with id ${id} founded`,
    });
  }
  res.json(person);
});

app.delete("/api/persons/:id", (req, res) => {
  const id = req.params.id;
  const person = persons.find((p) => p.id === Number(id));
  if (!person) {
    return res.status(400).json({
      error: `No person with id ${id} founded`,
    });
  }
  persons = persons.filter((p) => p.id !== Number(id));
  res.status(204).send();
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running in PORT ${PORT}`);
});
