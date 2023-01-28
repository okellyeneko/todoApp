const express = require('express')
const mongoose = require('mongoose')
const app = express();
const bodyParser = require('body-parser');
const { render } = require('ejs');
const { getDay } = require('./date');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))
const date = require(__dirname + "/date.js")
const _ = require("lodash")
require('dotenv').config();

mongoose.set('strictQuery', false)

mongoose.connect('mongodb+srv://'+process.env.SECRET+'@cluster0.mpukgr6.mongodb.net/todolistDB', {useNewUrlParser: true})

const itemsSchema = new mongoose.Schema({
    name: {type: String}
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Example note"
})

const defaultItems = [item1]

const listSchema = {
    name: {type: String},
    items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

// const currentDay = date.getDay();

app.get("/", function(req, res) {

    Item.find({}, function (err, foundItems){

        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if (err) {
                    console.log(err)
                } else {
                    console.log("Added default items to the database")
                }
            })

            res.redirect('/')
        } else {
            res.render("list", {listTitle: "Today", newItemList: foundItems})
        }
    })
})

app.get('/:customListName', function(req, res) {
    const customListName = _.capitalize(req.params.customListName)

    List.findOne({name: customListName}, function(err, foundList) {
        if (!err) {
            if (!foundList) {
                console.log("Name doesn't exist, will create list now")
                const list = new List ({
                    name: customListName,
                    items: defaultItems
                })
                list.save()
                res.redirect('/' + customListName)
            } else {
                console.log("Name exists: ", foundList.name)
                res.render("list", {listTitle: foundList.name, newItemList: foundList.items})
            }
        }
    })
})

app.post("/", function(req, res) {

    const itemName = req.body.newItem
    const listName = req.body.list

    const item = new Item({
        name: itemName
    })

    if (listName === "Today") {
        item.save();
        res.redirect('/')
    } else {
        List.findOne({name: listName}, function(err, foundList) {
            foundList.items.push(item)
            foundList.save()
            res.redirect('/'+ listName)
        })
    }
})

app.post("/delete", function(req, res) {
    const checkedBoxId = req.body.checkbox
    const listName = req.body.listName

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedBoxId, function(err){
            if (!err) {
                console.log('Successfully deleted checked item')
            } 
        })
        res.redirect("/")
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedBoxId}}}, function(err, foundList) {
            if (!err) {
                res.redirect('/' + listName)
            }
        })
    }
})

app.listen(3000, ()=> {
    console.log("server is up and running on port 3000!")
})