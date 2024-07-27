require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./models/person");

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
app.use(express.static("dist"));
morgan.token("body", (req) => JSON.stringify(req.body));
const tinyMorganWithBody =
  ":method :url :status :res[content-length] - :response-time ms :body";

app.use(morgan(tinyMorganWithBody));

// const generateId = () => {
//   return Math.floor(Math.random() * 1000000000);
// };

app.post("/api/persons", (req, res, next) => {
  const body = req.body;
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: "Missing parameters, please fill all the fields",
    });
  }
  // const existingName = persons.find(
  //   (p) => p.name.toLowerCase() === body.name.toLowerCase()
  // );
  // if (existingName) {
  //   return res.status(400).json({
  //     error: `${body.name} is already added to phonebook. Name must be unique`,
  //   });
  // }
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person
    .save()
    .then((savedPerson) => {
      res.json(savedPerson);
    })
    .catch((error) => next(error));
});

app.get("/api/persons", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      res.status(200).json(persons);
    })
    .catch((error) => next(error));
});

app.get("/info", (req, res, next) => {
  Person.find({})
    .then((persons) => {
      const infoText = `<p>Phonebook has info for ${persons.length} people</p>`;
      const requestedAt = `<p>${new Date(Date.now()).toString()}</p>`;

      res.status(200).send(`${infoText} ${requestedAt}`);
    })
    .catch((error) => next(error));
});

app.get("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        res.status(200).json(person);
      } else {
        res.status(400).end;
      }
    })
    .catch((error) => next(error));
});

app.put("/api/persons/:id", (req, res, next) => {
  const body = req.body;
  const id = req.params.id;
  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(id, person, {
    new: true,
    runValidators: true,
    context: "query",
  })
    .then((updatedPerson) => {
      res.status(200).json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (req, res, next) => {
  const id = req.params.id;
  Person.findByIdAndDelete(id)
    .then((deletedPerson) => {
      res.status(204).json(deletedPerson);
    })
    .catch((error) => next(error));
  // const person = persons.find((p) => p.id === Number(id));
  // if (!person) {
  //   return res.status(400).json({
  //     error: `No person with id ${id} founded`,
  //   });
  // }
  // persons = persons.filter((p) => p.id !== Number(id));
  // res.status(204).send();
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: "unknown endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "Malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running in PORT ${PORT}`);
});
