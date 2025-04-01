var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
const { json } = require('stream/consumers');

const publicDir = path.join(__dirname, '../public'); 
const jsonFile = path.join(publicDir, 'notes.json');

let jsonData;
loadJSON();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home', notes: jsonData });
});

/* GET view page. */
router.get('/view', function(req, res, next) {
  res.render('view', { title: 'Your Notes', notes: jsonData });
});

/* GET add page. */
router.get('/add', function(req, res, next) {
  res.render('add', { title: 'Add a Note', notes: jsonData });
});

/* POST add page. */
router.post('/add', function(req, res, next) {
  var note = {
    id: jsonData.length + 1,
    title: req.body.title, 
    body: req.body.body,
    color: req.body.color,
    starred: req.body.starred,
    createdAt: (new Date()).toLocaleString(),
    updatedAt: (new Date()).toLocaleString()
  };

  jsonData.push(note);

  saveJSON();

  // res.render('add', { title: 'Add Another Note', notes: jsonData });
  res.redirect('/add');
});

/* GET delete page. */
router.get('/delete/:id', function(req, res, next) {
  var id = req.params.id;
  jsonData = jsonData.filter(note => note.id != id);
  console.log('Note deleted:', id);

  resetIds(); // Reset IDs after deletion
  saveJSON();
  res.redirect('/view');
});

/* GET star */
router.get('/star/:id', function(req, res, next) {
  var id = req.params.id;

  jsonData = jsonData.map((note) => {
    if (note.id == id) {
      if (note.hasOwnProperty('starred')) {
        delete note.starred; 
      } else {
        note.starred = 'on';
      }
    }
    return note;
  });

  console.log('Note starred/unstarred:', id);

  saveJSON();
  res.redirect('/view');
});


/* GET edit page. */
router.get('/edit/:id', function(req, res, next) {
  var id= req.params.id;
  myNote = jsonData.filter(note => note.id == id);
  console.log(myNote);

  res.render('edit', { title: 'Edit a Note', note: myNote });
});


/* POST edit (update note). */
router.post('/edit/:id', function(req, res, next) {
  var id= req.params.id;
  var oldCreatedAtDate = jsonData.filter(note => note.id == id)[0].createdAt;
  var note = {
    id: id,
    title: req.body.title, 
    body: req.body.body,
    color: req.body.color,
    starred: req.body.starred,
    createdAt: oldCreatedAtDate,
    updatedAt: (new Date()).toLocaleString()
  };

  jsonData = jsonData.map((n) => {
    if (n.id == id) {
      return note;
    } else {
      return n;
    }
  });

  saveJSON();

  res.redirect('/view');
});

router.get('/search', (req, res, next) => {
  var searchTerm = req.query.search?.toLowerCase().trim() || '';

  const filteredNotes = jsonData.filter(note => 
    note.title.toLowerCase().includes(searchTerm) ||
    note.body.toLowerCase().includes(searchTerm)
  );
  
  res.render('view', { title: "Search Results", notes: filteredNotes });
});
module.exports = router;

function loadJSON() {
  try {
    let string = fs.readFileSync(jsonFile, 'utf8');
    if (string.length === 0) {
      string = [];
      jsonData = [];
      saveJSON();
      console.log('File was empty, set to []');
    }
    jsonData = JSON.parse(string);
    console.log('JSON file loaded successfully');
  } catch (err) {
    console.error('Error reading JSON file:', err);
      }
};

function saveJSON() {
  try {
    fs.writeFileSync(
      jsonFile, // Path to file
      JSON.stringify(jsonData, null, 2),
      'utf8' // Encoding
    );
    console.log('JSON file saved successfully');
  } catch (err) {
    console.error('Error writing JSON file:', err);
  }
}

function resetIds() {
  jsonData = jsonData.map((note, index) => {
    note.id = index + 1; // Reassign IDs sequentially starting from 1
    return note;
  });
  console.log('IDs reset successfully');
}
