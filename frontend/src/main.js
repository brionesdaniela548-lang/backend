//const API_URL = "http://localhost:3000";
const API_URL=import.meta.env.VITE_API_URL;
console.log("API_URL FRONT=", API_URL);


// ================= ESTADO =================
let usuarioLogueado = null;

// ================= VISTAS =================
const vistaLogin = document.getElementById("vistaLogin");
const vistaDashboard = document.getElementById("vistaDashboard");

const vistaPerfil = document.getElementById("vistaPerfil");
const vistaEstudiantes = document.getElementById("vistaEstudiantes");
const vistaMaterias = document.getElementById("vistaMaterias");
const vistaNotas = document.getElementById("vistaNotas");

// ================= BOTONES =================
const btnPerfil = document.getElementById("btnPerfil");
const btnEstudiantes = document.getElementById("btnEstudiantes");
const btnMaterias = document.getElementById("btnMaterias");
const btnNotas = document.getElementById("btnNotas");
const btnSalir = document.getElementById("btnSalir");

// ================= LOGIN =================
document.getElementById("formLogin").addEventListener("submit", async (e) => {
  e.preventDefault();

  const cedula = document.getElementById("loginCedula").value;
  const clave = document.getElementById("loginClave").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ cedula, clave })
  });

  const data = await res.json();

  if (res.ok) {
    iniciarSesion(data.usuario);
  } else {
    document.getElementById("loginError").textContent = data.msg;
  }
});

function iniciarSesion(usuario) {
  usuarioLogueado = usuario;

  vistaLogin.classList.add("d-none");
  vistaDashboard.classList.remove("d-none");

  mostrarVista("perfil");

  cargarEstudiantes();
  cargarMaterias();
}

// ================= NAVEGACIÓN =================
btnPerfil.addEventListener("click", () => mostrarVista("perfil"));
btnEstudiantes.addEventListener("click", () => mostrarVista("estudiantes"));
btnMaterias.addEventListener("click", () => mostrarVista("materias"));
btnNotas.addEventListener("click", () => mostrarVista("notas"));

btnSalir.addEventListener("click", () => {
  location.reload();
});

function mostrarVista(vista) {
  // Ocultar todas
  vistaPerfil.classList.add("d-none");
  vistaEstudiantes.classList.add("d-none");
  vistaMaterias.classList.add("d-none");
  vistaNotas.classList.add("d-none");

  // Quitar active
  document.querySelectorAll(".nav-link").forEach(b => b.classList.remove("active"));

  // Mostrar la seleccionada
  switch (vista) {
    case "perfil":
      vistaPerfil.classList.remove("d-none");
      btnPerfil.classList.add("active");
      cargarPerfil();
      break;

    case "estudiantes":
      vistaEstudiantes.classList.remove("d-none");
      btnEstudiantes.classList.add("active");
      break;

    case "materias":
      vistaMaterias.classList.remove("d-none");
      btnMaterias.classList.add("active");
      break;

    case "notas":
      vistaNotas.classList.remove("d-none");
      btnNotas.classList.add("active");
      break;
  }
}

// ================= PERFIL =================
function cargarPerfil() {
  document.getElementById("perfilNombre").textContent = usuarioLogueado.nombre;
  document.getElementById("perfilCedula").textContent = usuarioLogueado.cedula;
}

// ================= ESTUDIANTES =================
async function cargarEstudiantes() {
  const res = await fetch(`${API_URL}/estudiantes`);
  const estudiantes = await res.json();

  const tabla = document.getElementById("tablaEstudiantes");
  tabla.innerHTML = "";

  estudiantes.forEach(e => {
    tabla.innerHTML += `
      <tr>
        <td>${e.id}</td>
        <td>${e.nombre}</td>
      </tr>
    `;
  });
}

// ================= MATERIAS =================
async function cargarMaterias() {
  const res = await fetch(`${API_URL}/materia`);
  const materias = await res.json();

  const tabla = document.getElementById("tablaMaterias");
  tabla.innerHTML = "";

  materias.forEach(m => {
    tabla.innerHTML += `
      <tr>
        <td>${m.codigo}</td>
        <td>${m.nombre}</td>
      </tr>
    `;
  });
}

// --- GUARDAR NOTA ---
document.getElementById("btnGuardarNota").addEventListener("click", async () => {
  const estudiante_id = document.getElementById("notaEstudiante").value;
  const materia_id = document.getElementById("notaMateria").value;
  const nota = document.getElementById("notaValor").value;

  if (!estudiante_id || !materia_id || !nota) {
    document.getElementById("resultadoNota").innerHTML =
      "<div class='text-danger'>Completa todos los campos</div>";
    return;
  }

  const res = await fetch(`${API_URL}/notas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      estudiante_id,
      materia_id,
      usuario_id: usuarioLogueado.id, // docente logueado
      nota
    })
  });

  const data = await res.json();

  if (res.ok) {
    document.getElementById("resultadoNota").innerHTML =
      `<div class="alert alert-success">
        ✅ Nota guardada correctamente<br>
        Estudiante ID: ${data.estudiante_id}<br>
        Materia ID: ${data.materia_id}<br>
        Nota: ${data.nota}
      </div>`;

    // limpiar inputs
    document.getElementById("notaEstudiante").value = "";
    document.getElementById("notaMateria").value = "";
    document.getElementById("notaValor").value = "";
  } else {
    document.getElementById("resultadoNota").innerHTML =
      `<div class="alert alert-danger">${data.msg || "Error al guardar nota"}</div>`;
  }
});
