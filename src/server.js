import 'dotenv/config';
import express from "express";
import cors from "cors";
import { pool } from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// LOGIN (DOCENTE / ESTUDIANTE)
// =====================
app.post("/login", async (req, res) => {
  try {
    const { cedula, clave } = req.body;

    // DOCENTE
    const docente = await pool.query(
      "SELECT id, cedula, nombre, 'docente' AS rol FROM usuarios_profesores WHERE cedula=$1 AND clave=$2",
      [cedula, clave]
    );
    if (docente.rows.length > 0) {
      return res.json({ usuario: docente.rows[0] });
    }

    // ESTUDIANTE
    const estudiante = await pool.query(
      "SELECT id, cedula, nombre, 'estudiante' AS rol FROM estudiantes WHERE cedula=$1 AND clave=$2",
      [cedula, clave]
    );
    if (estudiante.rows.length > 0) {
      return res.json({ usuario: estudiante.rows[0] });
    }

    res.status(401).json({ msg: "Credenciales incorrectas" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// =====================
// DOCENTE
// =====================
app.get("/estudiantes", async (req, res) => {
  const result = await pool.query("SELECT id, nombre FROM estudiantes ORDER BY id");
  res.json(result.rows);
});

app.get("/materia", async (req, res) => {
  const result = await pool.query("SELECT * FROM materia ORDER BY codigo");
  res.json(result.rows);
});

app.post("/notas", async (req, res) => {
  const { estudiante_id, materia_id, usuario_id, nota } = req.body;

  const result = await pool.query(
    `INSERT INTO notas (estudiante_id, materia_id, usuario_id, nota)
     VALUES ($1,$2,$3,$4)
     RETURNING *`,
    [estudiante_id, materia_id, usuario_id, nota]
  );

  res.json(result.rows[0]);
});

// =====================
// ESTUDIANTE (SOLO VER)
// =====================
app.get("/mis-notas/:id", async (req, res) => {
  const result = await pool.query(
    `SELECT m.nombre AS materia, n.nota
     FROM notas n
     JOIN materia m ON n.materia_id = m.codigo
     WHERE n.estudiante_id = $1`,
    [req.params.id]
  );
  res.json(result.rows);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor iniciado en puerto", PORT));
