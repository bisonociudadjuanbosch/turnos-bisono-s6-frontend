document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("cambiar-estado")) {
    const fila = e.target.closest("tr");
    const numero = fila.cells[0].textContent;
    const nuevaEtapa = fila.querySelector(".nuevo-estado").value;
    const resultado = fila.querySelector(".resultado");

    try {
      const res = await fetch("https://turnos-bisono-sembrador6-v2n2.onrender.com/cambiar-etapa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero, nuevaEtapa })
      });

      const data = await res.json();
      if (res.ok) {
        resultado.textContent = "✅ Etapa actualizada";
      } else {
        resultado.textContent = "❌ " + (data.error || "Error");
      }
    } catch (err) {
      resultado.textContent = "❌ Error al conectar con el servidor";
    }
  }
});
