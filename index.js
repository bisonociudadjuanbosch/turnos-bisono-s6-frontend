// Detecta clics en botones "Actualizar estado"
document.addEventListener("click", async (e) => {
  if (!e.target.classList.contains("cambiar-estado")) return;

  const fila = e.target.closest("tr");
  if (!fila) return;

  const numero = fila.querySelector(".col-numero")?.textContent.trim();
  const select = fila.querySelector(".nuevo-estado");
  const resultado = fila.querySelector(".resultado");

  if (!numero || !select || !resultado) {
    console.error("Estructura de tabla inesperada");
    return;
  }

  const nuevaEtapa = select.value;

  try {
    const res = await fetch("https://turnos-bisono-sembrador6-v2n2.onrender.com/cambiar-etapa", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ numero, nuevaEtapa }),
    });

    const data = await res.json();

    if (res.ok) {
      resultado.textContent = "✅ Etapa actualizada";
      // Opcional: actualizar visualmente la etapa actual
      const colEstado = fila.querySelector(".col-estado");
      if (colEstado) colEstado.textContent = nuevaEtapa;
    } else {
      resultado.textContent = "❌ " + (data.error || "Error al actualizar");
    }
  } catch (err) {
    resultado.textContent = "❌ Error al conectar con el servidor";
    console.error(err);
  }
});
