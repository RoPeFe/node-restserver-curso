const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const User = require('./../models/user');

const app = express();

app.get('/usuario', function (req, res) {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  let limite = req.query.limite || 5;
  limite = Number(limite);

  User.find({ estado: true }, 'nombre, email, img, role, estado, google')
    .skip(desde)
    .limit(limite)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      User.count({ estado: true }, (err, conteo) => {
        res.json({
          ok: true,
          usuarios,
          cuantos: conteo,
        });
      });
    });
});

app.post('/usuario', function (req, res) {
  const body = req.body;

  const user = new User({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    role: body.role,
  });

  user.save((err, usuarioDB) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    res.json({
      ok: true,
      usuario: usuarioDB,
    });
  });
});

app.put('/usuario/:id', function (req, res) {
  const id = req.params.id;
  const body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);

  User.findByIdAndUpdate(
    id,
    body,
    { new: true, runValidators: true },
    (err, usuarioDB) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          err,
        });
      }

      res.json({
        ok: true,
        usuario: usuarioDB,
      });
    }
  );
});

app.delete('/usuario/:id', function (req, res) {
  const id = req.params.id;
  const cambioEstado = {
    estado: false,
  };

  //   User.findByIdAndRemove(id, (err, delUser) => {
  User.findByIdAndUpdate(id, cambioEstado, (err, delUser) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        err,
      });
    }

    if (delUser === null) {
      return res.status(400).json({
        ok: false,
        error: {
          message: 'Usuario no encontrado',
        },
      });
    }

    res.json({
      ok: true,
      usuario: delUser,
    });
  });
  res.json('delete usuario');
});

module.exports = app;
