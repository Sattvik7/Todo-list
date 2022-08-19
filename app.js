//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const _ = require('lodash');


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://admin-sattvik:@mahi7781@cluster0.ij5v2.mongodb.net/todolistDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema = new mongoose.Schema({
   name: String
 });

 const Item = mongoose.model("Item", itemsSchema);

 const item1 = new Item({
   name: "Exercise"
 })


 const item2 = new Item({
   name: "Take Bath"
 })


 const item3 = new Item({
   name: "Cook Food"
 })

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {



  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Success");
        }
      });
      res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  });



});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
   const item = new Item({
     name: itemName
   });

if(listName === "Today"){
  item.save();
  res.redirect("/");
} else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  });
}

});

app.post("/delete", function(req, res){
const checkedItemId =  req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }else{
      console.log("Success");
    }
    res.redirect("/");
  });
} else{
  List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(!err){
      res.redirect("/" + listName)
    }
  });
}

});

app.get("/:work", function(req, res){
  const customListname = _.capitalize(req.params.work);


List.findOne({name: customListname}, function(err, foundLists){
  if(!err){
  if(!foundLists){
    //Create a new list
    const list = new List({
      name: customListname,
      items: defaultItems
    });
    list.save(function() {
    res.redirect("/" + customListname);
});
  }else{
    //Show existing list
    res.render("list", {listTitle: foundLists.name, newListItems: foundLists.items})
  }
}
});



});

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started");
});
