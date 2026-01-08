import 'dotenv/config';

import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();

const PORT=process.env.PORT || 3000;

const whitelist = [
  "http://localhost:5173",
  "https://frontend-drab-six-83.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {

    // ✅ Render, Postman, health checks (origin undefined o file://)
    if (!origin)
return callback(null,true); 

    if (whitelist.includes(origin)) {
      callback(null, true);
    }else {
     HTMLFormControlsCollection.log('Bloqueado por cors:', origin);
     callback(new Error('Bloqueado por CORS'));
    }
  }
}));
app.use(express.json());

// =====================
// LOGIN
// =====================
app.post("/login", async (req, res) => {
  try {
    const { cedula, clave } = req.body;

    const result = await pool.query(
      "SELECT id, cedula, nombre FROM usuarios_profesores WHERE cedula=$1 AND clave=$2",
      [cedula, clave]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ msg: "Cédula o contraseña incorrecta" });
    }

    res.json({ usuario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// USUARIOS PROFESORES
// =====================
app.get("/usuarios_profesores", async (req, res) => {
  const result = await pool.query(
    "SELECT id, cedula, nombre FROM usuarios_profesores ORDER BY id"
  );
  res.json(result.rows);
});

app.post("/usuarios_profesores", async (req, res) => {
  const { cedula, nombre, clave } = req.body;

  const result = await pool.query(
    "INSERT INTO usuarios_profesores (cedula, nombre, clave) VALUES ($1,$2,$3) RETURNING id, cedula, nombre",
    [cedula, nombre, clave]
  );

  res.json(result.rows[0]);
});

app.put("/usuarios_profesores/:id", async (req, res) => {
  const { id } = req.params;
  const { cedula, nombre, clave } = req.body;

  const result = await pool.query(
    "UPDATE usuarios_profesores SET cedula=$1, nombre=$2, clave=$3 WHERE id=$4 RETURNING id, cedula, nombre",
    [cedula, nombre, clave, id]
  );

  res.json(result.rows[0]);
});

app.delete("/usuarios_profesores/:id", async (req, res) => {
  await pool.query("DELETE FROM usuarios_profesores WHERE id=$1", [req.params.id]);
  res.json({ msg: "Usuario eliminado" });
});

// =====================
// MATERIAS
// =====================
app.get("/materia", async (req, res) => {
  const result = await pool.query("SELECT * FROM materia ORDER BY codigo");
  res.json(result.rows);
});

// =====================
// ESTUDIANTES 
// =====================
app.get("/estudiantes", async (req, res) => {
  const result = await pool.query(
    "SELECT id, nombre FROM estudiantes ORDER BY id"
  );
  res.json(result.rows);
});

app.get("/estudiantes/:id", async (req, res) => {
  const result = await pool.query(
    "SELECT id, nombre FROM estudiantes WHERE id=$1",
    [req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ msg: "Estudiante no encontrado" });
  }

  res.json(result.rows[0]);
});

app.post("/estudiantes", async (req, res) => {
  const { nombre } = req.body;

  const result = await pool.query(
    "INSERT INTO estudiantes (nombre) VALUES ($1) RETURNING *",
    [nombre]
  );

  res.json(result.rows[0]);
});

// =====================
// NOTAS
// =====================
app.post("/notas", async (req, res) => {
  try {
    const { estudiante_id, materia_id, usuario_id, nota } = req.body;

    if (
      estudiante_id === undefined ||
      materia_id === undefined ||
      usuario_id === undefined ||
      nota === undefined
    ) {
      return res.status(400).json({ msg: "Todos los campos son obligatorios" });
    }

    const user = await pool.query(
      "SELECT id FROM usuarios_profesores WHERE id = $1",
      [usuario_id]
    );
    if (user.rows.length === 0)
      return res.status(404).json({ msg: "Profesor no existe" });

    const estudiante = await pool.query(
      "SELECT id FROM estudiantes WHERE id = $1",
      [estudiante_id]
    );
    if (estudiante.rows.length === 0)
      return res.status(404).json({ msg: "Estudiante no existe" });

    const materia = await pool.query(
      "SELECT codigo FROM materia WHERE codigo = $1",
      [materia_id]
    );
    if (materia.rows.length === 0)
      return res.status(404).json({ msg: "Materia no existe" });

    const result = await pool.query(
      `INSERT INTO notas (estudiante_id, materia_id, usuario_id, nota)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [estudiante_id, materia_id, usuario_id, nota]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
  console.log("Servidor iniciado correctamente");
});
