const mongoose = require("mongoose");

if (process.argv.length < 3) {
  console.log("Give password as argument");
  process.exit(1);
}

const password = process.argv[2];

const url = `mongodb+srv://malacalzamarcelo:${password}@cluster0.qyhyjyn.mongodb.net/phonebookApp?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", false);

mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

const createPerson = () => {
  const name = process.argv[3];
  const number = process.argv[4];
  const person = new Person({
    name,
    number,
  });
  person.save().then((res) => {
    console.log(`Added ${name}, number ${number} to phonebook`, res);
    mongoose.connection.close();
  });
};

switch (process.argv.length) {
  case 3:
    Person.find({}).then((result) => {
      console.log("Phonebook:");
      result.forEach((person) => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    });
    break;
  case 4:
    console.log("Missing arguments");
    process.exit(1);
    break;
  case 5:
    createPerson();
    break;
  default:
    console.log(`Args length: ${process.argv.length}`);
    break;
}
