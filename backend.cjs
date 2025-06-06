const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './process.env') });

const app = express();
const PORT = process.env.PORT1 || 5000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: true,
  }
});

pool.connect()
  .then(() => {
    console.log('Conectado a PostgreSQL!');
    app.listen(PORT, () => {
      console.clear();
      console.log(`Servidor Express ejecutándose en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a PostgreSQL:', err.message);
    process.exit(1);
  });

app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!email || !password || !username) {
    console.error('Registro Error: Username, correo y contraseña son requeridos.');
    return res.status(400).json({ message: 'Username, correo y contraseña son requeridos.' });
  }


  try {

    const existingUser = await pool.query('SELECT * FROM users WHERE users_em = $1 OR users_us = $2', [email, username]);

    if (existingUser.rows.length > 0) {

      const userFound = existingUser.rows[0];

      if (userFound.users_em === email) {
        console.error(`Registro Error: Usuario con email '${email}' ya existe.`);
        return res.status(409).json({ message: 'Ya existe un usuario con este correo electrónico.' });

      } else if (userFound.users_us === username) {
        console.error(`Registro Error: Usuario con username '${username}' ya existe.`);
        return res.status(409).json({ message: 'Ya existe un usuario con este nombre de usuario.' });
      }
    }

    await pool.query('INSERT INTO users (users_us, users_em, users_pw) VALUES ($1, $2, $3)', [username, email, password]);

    console.log('Usuario registrado exitosamente:', email);
    res.status(201).json({ message: 'Usuario registrado exitosamente!' });

  } catch (error) {
    console.error('Error del servidor durante el registro:', error);
    res.status(500).json({ message: 'Error interno del servidor durante el registro.' });
  }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.error('Login Error: Correo y contraseña son requeridos.');
        return res.status(400).json({ message: 'Correo y contraseña son requeridos.' });
    }

    try {
        const result = await pool.query('SELECT * FROM users WHERE users_us = $1 OR users_em = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.error(`Login Error: Credenciales inválidas para el correo '${email}'. Usuario no encontrado.`);
            return res.status(401).json({ message: 'Correo o contraseña inválidos.' });
        }

        if (user.users_pw !== password) {
            console.error(`Login Error: Credenciales inválidas para el correo '${email}'. Contraseña incorrecta.`);
            return res.status(401).json({ message: 'Correo o contraseña inválidos.' });
        }

        console.log('Usuario logueado exitosamente:', user.users_us);
        res.status(200).json({ message: 'Login exitoso!', userid: user.users_id, username: user.users_us });

    } catch (error) {
        console.error('Error del servidor durante el login:', error);
        res.status(500).json({ message: 'Error interno del servidor durante el login.' });
    }
});

app.post('/api/notes', async (req, res) => {
    const { content, user_id } = req.body;
    console.log('Datos recibidos para agregar nota:', { content, user_id });

    if (!content || content.trim() === '') {
        console.error('Error al agregar nota: El contenido de la nota no puede estar vacío.');
        return res.status(400).json({ message: 'El contenido de la nota no puede estar vacío.' });
    }

    if (!user_id) {
        console.error('Error al agregar nota: El ID de usuario es requerido.');
        return res.status(400).json({ message: 'El ID de usuario es requerido.' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO notas (notas_ct, user_id) VALUES ($1, $2) RETURNING notas_ct AS content, user_id, notas_id',
            [content, user_id]
        );

        const newNote = result.rows[0];

        res.status(201).json(newNote);

    } catch (error) {
        console.error('Error al agregar nota:', error);
        res.status(500).json({ message: 'Error interno del servidor al agregar nota.' });
    }
});

app.get('/api/notes', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
      console.error('Error al obtener notas: El ID de usuario es requerido como parámetro de consulta (userId).');
      return res.status(400).json({ message: 'El ID de usuario es requerido.' });
    }
    
    try {
      const result = await pool.query('SELECT * FROM notas WHERE user_id = $1', [userId]);

      const notes = result.rows.map(row => ({
        content: row.notas_ct,
        user_id: row.user_id
      }));
      
      console.log('Solicitud para obtener notas para el UserID:', userId);
      res.status(200).json(notes);

    } catch (error) {
        console.error('Error al obtener notas:', error);
        res.status(500).json({ message: 'Error interno del servidor al obtener notas.' });
    }
});