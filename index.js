const express = require("express");
const app = express();
const bp = require("body-parser");
const port = 3000;
const ejs = require("ejs");
const { MongoClient, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://21pa1a1273:rakibali2233a@cluster0.hivyjuc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
app.use(bp.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.get("/", (req, res) => {
  res.render("index.ejs");
});

app.get("/home", async (req, res) => {
  const client = new MongoClient(uri);
  const storage = client.db("Mydb").collection("MyCollection");
  let Retriveresult = "";
  const branch = req.query.branch;
  if (!branch || branch == "all") {
    Retriveresult = await storage.find().toArray();
  } else {
    Retriveresult = await storage.find({ branch: branch }).toArray();
  }
  
  // for sorting likes 
  Retriveresult.sort(function(a, b) {
    return b.count - a.count;
  });
  
  res.render("home.ejs", { data: Retriveresult });
});

app.post("/complaint", async (req, res) => {
  const data = req.body;
  data.count = parseInt(data.count);
  data.count = 0;
  try {
    const client = new MongoClient(uri);
    const response = await client.connect();
    if (response.topology.isConnected()) {
      const storage = client.db("Mydb").collection("MyCollection");
      const Insertresult = await storage.insertOne(data);
    }
    res.redirect("home");
  } catch (err) {
    console.log(err.message);
  }
});
app.get("/viewMore/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const client = new MongoClient(uri);
    const storage = client.db("Mydb").collection("MyCollection");
    const Retriveresult = await storage.findOne({ _id: new ObjectId(id) });
    res.render("viewMore.ejs", { data: Retriveresult });
  } catch (err) {
    console.log(err.message);
  }
});
app.post("/like/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const client = new MongoClient(uri);
    const storage = client.db("Mydb").collection("MyCollection");
    const updateres = await storage.updateOne(
      { _id: new ObjectId(id) },
      { $inc: { count: 1 } },
    );
    res.redirect("/home");
  } catch (err) {
    console.log(err.message);
  }
});
app.post("/delete/:id", (req, res) => {
  const id = req.params.id;
  try {
    const client = new MongoClient(uri);
    const storage = client.db("Mydb").collection("MyCollection");
    const Deleteres = storage.deleteOne({ _id: new ObjectId(id) });
    res.redirect("/home");
  } catch (err) {
    console.log(err.message);
  }
});
app.listen(port, () => {
  console.log("server is running");
});
