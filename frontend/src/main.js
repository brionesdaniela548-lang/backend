
const API_URL = import.meta.env.VITE_API_URL;
let usuarioLogueado = null;

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Opcional para componentes interactivos

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

// LOGIN
document.getElementById("formLogin").addEventListener("submit", async e => {
  e.preventDefault();

  const cedula = loginCedula.value.trim();
  const clave = loginClave.value.trim();

  try {
    console.log("API_URL:", API_URL);
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
  } catch (error) {
    console.error("Error en login:", error);
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

  if (v === "perfil") vistaPerfil.classList.remove("d-none");
  if (v === "estudiantes") vistaEstudiantes.classList.remove("d-none");
  if (v === "materias") vistaMaterias.classList.remove("d-none");
  if (v === "notas") vistaNotas.classList.remove("d-none");
}

// CARGAS
async function cargarEstudiantes() {
  try {
    console.log("Llamando a /estudiantes");
    const res = await fetch(`${API_URL}/estudiantes`);
    const data = await res.json();
    tablaEstudiantes.innerHTML = data.length
      ? data.map(e => `<tr><td>${e.id}</td><td>${e.nombre}</td></tr>`).join("")
      : "<tr><td colspan='2'>No hay estudiantes</td></tr>";
  } catch (error) {
    console.error("Error cargando estudiantes:", error);
    tablaEstudiantes.innerHTML = "<tr><td colspan='2'>Error al cargar</td></tr>";
  }
}

async function cargarMaterias() {
  try {
    console.log("Llamando a /materia");
    const res = await fetch(`${API_URL}/materia`);
    const data = await res.json();
    tablaMaterias.innerHTML = data.length
      ? data.map(m => `<tr><td>${m.codigo}</td><td>${m.nombre}</td></tr>`).join("")
      : "<tr><td colspan='2'>No hay materias</td></tr>";
  } catch (error) {
    console.error("Error cargando materias:", error);
    tablaMaterias.innerHTML = "<tr><td colspan='2'>Error al cargar</td></tr>";
  }
}

async function cargarMisNotas() {
  try {
    console.log("Llamando a /mis-notas");
    const res = await fetch(`${API_URL}/mis-notas/${usuarioLogueado.id}`);
    const data = await res.json();
    tablaNotasEstudiante.innerHTML = data.length
      ? data.map(n => `<tr><td>${n.materia}</td><td>${n.nota}</td></tr>`).join("")
      : "<tr><td colspan='2'>No hay notas</td></tr>";
  } catch (error) {
    console.error("Error cargando notas:", error);
    tablaNotasEstudiante.innerHTML = "<tr><td colspan='2'>Error al cargar</td></tr>";
  }
}

// GUARDAR NOTA (DOCENTE)
btnGuardarNota.onclick = async () => {
  if (usuarioLogueado.rol !== "docente") return;

  try {
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
      cargarEstudiantes();
      cargarMaterias();
    } else {
      alert("Error al guardar la nota");
    }
  } catch (error) {
    console.error("Error guardando nota:", error);
    alert("No se pudo conectar con el servidor");
  }
};
