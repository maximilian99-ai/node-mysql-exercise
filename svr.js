// 모듈 불러오기
const express = require('express');
const fs = require('fs');
const ejs = require('ejs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const db = require('./config/dbconfig.json');

// db 연결
const client = mysql.createConnection({
  host : db.host,
  port : db.port,
  user : db.user,
  password : db.password,
  database : db.database
});

// 웹 서버 생성
const app = express();
app.use(bodyParser.urlencoded({
  extended: false
}));

// 서버 접속
app.listen(3000, () => {
  console.log('Server is running at : http://127.0.0.1:3000')
});

// 최초 화면 불러오기(조회)
app.get('/', (req, res) => {
  fs.readFile('views/list.ejs', 'utf8', (err, data) => {
    client.query('select * from site', (err, rst) => {
      if (err) {
        res.send(err);
      } else {
        res.send(ejs.render(data, {
          data: rst
        }));
      }
    });
  });
});

// 삭제
app.get('/delete/:id', (req, res) => {
  client.query('delete from site where id=?', [req.params.id], () => {
    res.redirect('/');
  });
});

// 데이터 추가
app.get('/insert', (req, res) => {
  fs.readFile('views/insert.html', 'utf8', (err, data) => {
    res.send(data);
  });
});

app.post('/insert', (req, res) => {
  const body = req.body;

  client.query('insert into site (coor_lat, coor_lon, site_cd, site_nm) values (?, ?, ?, ?);', 
  [body.coor_lat, body.coor_lon, body.site_cd, body.site_nm], () => {
    res.redirect('/');
  });
});

// 데이터 수정
app.get('/edit/:id', (req, res) => {
  fs.readFile('views/edit.ejs', 'utf8', (err, data) => {
    client.query('select * from site where id = ?', [req.params.id], (err, rst) => {
      res.send(ejs.render(data, {
        data: rst[0]
      }));
    });
  });
});

app.post('/edit/:id', (req, res) => {
  const body = req.body;
  const id = req.params.id;

  const updateQuery = 'update site set coor_lat=?, coor_lon=?, site_cd=?, site_nm=? where id=?';
  const values = [body.coor_lat, body.coor_lon, body.site_cd, body.site_nm, id];

  client.query(updateQuery, values, (err, rst) => {
    if (err) {
      console.error('Error updating data:', err);
      res.send('Error updating data. Please try again later.');
    } else {
      res.redirect('/');
    }
  });
});