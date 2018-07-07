var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var multer = require('multer');
var cors = require('cors');
var app = express();
mongoose.connect("mongodb://127.0.0.1:27017/ram");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(__dirname + '/public'));


var schema = mongoose.model('collection', {
    firstName: String,
    lastName: String,
    _id: String,
    mobile: Number,
    password: String,
    aadhaar: Number,
    location: String,
    adderss: String
})

var adminSchema = mongoose.model('admin', {
    _id: String,
    hospitalName: String,
    hospitalPassword: String,
    hospitalNumber: String,
    hospitalCity: String,
    hospitalAddress: String,
    path: String
})

var specialization = mongoose.model('spl', {
    _id: String,
    specialization: Array
})


var location = mongoose.model('location', {
    _id: String
})

var addDoctor = mongoose.model('doctors', {
    docId: String,
    docName: String,
    docEmail: String,
    docNumber: Number,
    special: String,
    hosId: String
})



var appointment = mongoose.model('appointment', {
    _id: String,
    hosId: String,
    appointments: Array
})


app.post('/login', (req, res) => {
    console.log(JSON.stringify(req.body))

    schema.find({ _id: req.body.mail }, (err, data) => {
        if (err) {
            throw err;
        }
        if (data.length == 0) {
            res.send("k")
        }
        else if (data[0].password == req.body.password) {
            console.log(data)
            res.json({
                "status": "ok", "name": data[0].firstName, "email": data[0]._id
            }
            )
        }
        else {
            res.json({ "status": "notOK" });
        }
    })
})


app.post('/signUp', function (req, res) {
    console.log(JSON.stringify(req.body))
    schema.create(req.body, function (err, data) {
        if (err) {
            console.log(err)
            res.send({ "status": "notOk" })
        }
        else {
            res.json({ "status": "ok" })
        }
    })
})


app.post('/getUser', function (req, res) {
    console.log(req.body);
    schema.find(req.body, function (err, data) {
        if (err) {
            throw err;
        }
        else {
            res.json(data)
        }
    })
})

app.get('/getCity', function (req, res) {
    console.log('getCity fired!')
    location.find(function (err, data) {
        if (err) {
            throw err
        }
        else {
            res.json(data)
        }
    })
})

app.post('/findHospitals', function (req, res) {
    adminSchema.find(req.body, function (err, data) {
        if (err) {
            throw err
        }
        else {
            res.json(data);
        }
    })
})


// var addDoctor = mongoose.model('doctors', {
//     docId: String,
//     docName: String,
//     docEmail: String,
//     docNumber: Number,
//     special: String,
//     hosId: String
// })



app.post('/getDoctor', function (req, res) {
    console.log(req.body)
    addDoctor.find({ special: req.body.spId, hosId: req.body.hosId }, function (err, data) {
        if (err) {
            throw err
        }
        else {
            console.log(data)
            res.json(data)
        }
    })
})


/**
 * admin section
 */

app.post('/adminSignUp', multer({ dest: './public/uploads/' }).single('photo'), function (req, res) {

    var image = req.file.filename;

    var dataObj = {
        _id: req.body._id,
        hospitalName: req.body.hospitalName,
        hospitalPassword: req.body.hospitalPassword,
        hospitalNumber: req.body.hospitalNumber,
        hospitalCity: req.body.hospitalCity,
        hospitalAddress: req.body.hospitalAddress,
        path: image
    }

    console.log(dataObj)

    adminSchema.create(dataObj, function (err, data) {
        if (err) {
            console.log(err)
            res.json({
                "status": "err"
            })
        }
        else {
            console.log(data)
            location.create({ _id: req.body.hospitalCity }, function (err, data) { })
            res.json({ "status": "ok" })
        }
    })
})


app.post('/adminLogin', function (req, res) {
    console.log(JSON.stringify(req.body))
    adminSchema.find({ _id: req.body._id }, function (err, data) {
        if (err) {
            console.log(err);
            res.json({ status: 'err' })
        }
        else {
            console.log(data)
            res.json({ status: 'ok', 'id': data[0]._id })
        }
    })
})

app.post('/delDoc', function (req, res) {
    console.log(JSON.stringify(req.body))
    addDoctor.remove(req.body, function (err, data) {
        if (err) {
            console.log(err);
            res.send({ "status": "notOk" })
        }
        else {
            console.log(data)
            res.send({ "status": "ok" })
        }
    })
})

app.get('/getDocDetails', function (req, res) {
    console.log(req.query)
    addDoctor.find({ hosId: req.query.hosId }, function (err, data) {
        if (err) {
            throw err
        }
        else {
            console.log(data)
            res.json(data)
        }
    })
})

// app.get('/public/uploads/:name', function (req, res) {
//     var img = req.params.name;
//     res.sendFile(__dirname + '/public/uploads/' + img)
// })


app.get('/getAdmin', (req, res) => {
    var id = req.query._id;
    console.log("Please wait...");
    adminSchema.find({ _id: id }, (err, data) => {
        if (err) {
            console.log(err)
        }
        else {
            res.json(data)
        }
    })
})


app.post('/addService', function (req, res) {
    console.log(JSON.stringify(req.body))
    specialization.create({ _id: req.body.id, specialization: req.body.spl }, function (err, data) {
        if (err) {
            console.log(err)
            specialization.update({ _id: req.body.id }, { $push: { specialization: req.body.spl } }, function (err, data) {
                if (err) {
                    res.json({ "status": "notOk" })
                }
                else {
                    res.json({ "status": "ok" })
                }
            })
        }
        else {
            console.log(err)
            res.json({ "status": "ok" })
        }
    })
})


app.get('/getAppointments', function (req, res) {
    console.log(req.query)
    var docId = req.query._id;
    appointment.find({ _id: docId }, function (err, data) {
        console.log(data.length)
        if (err) {
            console.log(err);
            res.json([])
        }
        else {
            if (data.length == 0) {
                res.json([])
            }
            else {
                console.log(data);
                res.json(data[0].appointments)
            }
        }
    })
})


app.post('/bookDoc', function (req, res) {
    console.log(JSON.stringify(req.body.appointment))
    appointment.create({ _id: req.body._id, hosId: req.body.hosId, appointments: req.body.appointment }, function (err, data) {
        if (err) {
            console.log(err)
            appointment.update({ _id: req.body._id }, { $push: { appointments: req.body.appointment } }, function (err, data) {
                //{"_id":"526","hosId":"pradhama@example.com","appointments":{"time":"09:00 am - 10:00 am"}}
                if (err) {
                    res.json({ "status": "notOk" })
                }
                else {
                    res.json({ "status": "ok" })
                }
            })
        }
        else {
            console.log(err)
            res.json({ "status": "ok" })
        }
    })
})

app.post('/getServices', function (req, res) {
    console.log("GetServices fired!");
    specialization.find(req.body, function (err, data) {
        if (err) {
            console.log(err)
        }
        else {
            console.log(data)
            res.json(data[0])
        }
    })
})

app.post('/addDoctor', function (req, res) {
    console.log('ok')
    console.log(req.body);
    addDoctor.create(req.body, function (err, data) {
        if (err) {

            res.json({ status: "notOk", name: req.body.docName });
        }
        else {
            res.json({ status: "ok", name: req.body.docName });
        }
    })
})

app.get('/appointments', function (req, res) {
    console.log(req.query)
    appointment.find({ hosId: req.query.hosId, _id: req.query.docId }, function (err, data) {
        if (err) {
            console.log(err)
            res.send({ status: "notOK" })
        }
        else {
            console.log(data);
            res.send(data)
        }
    })
})


app.listen(3000, function () {
    console.log('Waiting for connections on http://localhost:3000')
})