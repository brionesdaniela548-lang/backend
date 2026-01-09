
const API_URL = import.meta.env.VITE_API_URL;
let usuarioLogueado = null;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// VISTAS
const vistaLogin = document.getElementById("vistaLogin");
const vistaDashboard = document.getElementById("vistaDashboard");
const vistaPerfil = document.getElementById("vistaPerfil");
const vistaEstudiantes = document.getElementById("vistaEstudiantes");
const vistaMaterias = document.getElementById("vistaMaterias");
const vistaNotas = document.getElementById("vistaNotas");

// BOTONES
const btnPerfil = document.getElementById("btnPerfil");
const btnEstudiantes = document.getElementById("btnEstudiantes");
const btnMaterias = document.getElementById("btnMaterias");
const btnNotas = document.getElementById("btnNotas");
const btnLogout = document.getElementById("btnLogout");

// LOGIN
document.getElementById("formLogin").addEventListener("submit", async e => {
  e.preventDefault();

  const cedula = loginCedula.value.trim();
  const clave = loginClave.value.trim();

  try {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cedula, clave })
    });

    const data = await res.json();
    if (!res.ok) {
      loginError.textContent = data.msg || "Error en el login";
      return;
    }

    usuarioLogueado = data.usuario;
    vistaLogin.classList.add("d-none");
    vistaDashboard.classList.remove("d-none");

    perfilNombre.textContent = usuarioLogueado.nombre;
    perfilCedula.textContent = usuarioLogueado.cedula;
    perfilRol.textContent = usuarioLogueado.rol;

    if (usuarioLogueado.rol === "estudiante") {
      btnEstudiantes.classList.add("d-none");
      btnMaterias.classList.add("d-none");
      btnNotas.click();
      cargarMisNotas();
      document.getElementById("formNotasDocente").classList.add("d-none");
    } else {
      cargarEstudiantes();
      cargarMaterias();
    }
  } catch {
    loginError.textContent = "No se pudo conectar con el servidor.";
  }
});

// NAVEGACIÓN
btnPerfil.onclick = () => mostrar("perfil");
btnEstudiantes.onclick = () => mostrar("estudiantes");
btnMaterias.onclick = () => mostrar("materias");
btnNotas.onclick = () => mostrar("notas");

function mostrar(v) {
  [vistaPerfil, vistaEstudiantes, vistaMaterias, vistaNotas]
    .forEach(x => x.classList.add("d-none"));
  document.getElementById(`vista${v.charAt(0).toUpperCase() + v.slice(1)}`).classList.remove("d-none");
}

// CARGAS
async function cargarEstudiantes() {
  const res = await fetch(`${API_URL}/estudiantes`);
  const data = await res.json();
  tablaEstudiantes.innerHTML = data.length
    ? data.map(e => `<tr><td>${e.id}</td><td>${e.nombre}</td></tr>`).join("")
    : "<tr><td colspan='2'>No hay estudiantes</td></tr>";
}

async function cargarMaterias() {
  const res = await fetch(`${API_URL}/materia`);
  const data = await res.json();
  tablaMaterias.innerHTML = data.length
    ? data.map(m => `<tr><td>${m.codigo}</td><td>${m.nombre}</td></tr>`).join("")
    : "<tr><td colspan='2'>No hay materias</td></tr>";
}

async function cargarMisNotas() {
  const res = await fetch(`${API_URL}/mis-notas/${usuarioLogueado.id}`);
  const data = await res.json();
  tablaNotasEstudiante.innerHTML = data.length
    ? data.map(n => `<tr><td>${n.materia}</td><td>${n.nota}</td></tr>`).join("")
    : "<tr><td colspan='2'>No hay notas</td></tr>";
}

// GUARDAR NOTA
btnGuardarNota.onclick = async () => {
  if (usuarioLogueado.rol !== "docente") return;

  const res = await fetch(`${API_URL}/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      estudiante_id: notaEstudiante.value,
      materia_id: notaMateria.value,
      usuario_id: usuarioLogueado.id,
      nota: notaValor.value
    })
  });

  if (res.ok) {
    alert("Nota guardada correctamente");
    cargarMisNotas(); // ✅ Actualiza la tabla
  } else {
    alert("Error al guardar la nota");
  }
};

// CERRAR SESIÓN
btnLogout.onclick = () => {
  usuarioLogueado = null;
  vistaDashboard.classList.add("d-none");
  vistaLogin.classList.remove("d-none");
  document.getElementById("formLogin").reset();
  loginError.textContent = "";
};
