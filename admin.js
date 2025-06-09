document.addEventListener("DOMContentLoaded", obtenerTurnos);

const safe = str => String(str || "")
  .replace(/[&<>"']/g, s => 
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[s]
  );

async function obtenerTurnos() {
  const tabla = document.querySelector("#tabla-turnos tbody");
  tabla.innerHTML = "<tr><td colspan='7'>Cargando turnos...</td></tr>";

  try {
    const res = await fetch("https://turnos-bisono-sembrador6-v2n2.onrender.com/turnos?pagina=1&limite=100");
    const data = await res.json();

    if (!Array.isArray(data.resultados)) throw new Error("Formato inesperado");

    const turnos = data.resultados;
    if (turnos.length === 0) {
      tabla.innerHTML = "<tr><td colspan='7'>No hay turnos registrados.</td></tr>";
      return;
    }

    tabla.innerHTML = "";
    turnos.forEach(turno => {
      const { numero, etapa, telefono } = turno;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="col-numero">${safe(numero)}</td>
        <td class="col-estado">${safe(etapa)}</td>
        <td>
          <select class="nuevo-estado">
            <option value="Pendiente">Pendiente</option>
            <option value="Visitando Apartamento Modelo">Visitando Apartamento Modelo</option>
            <option value="Precalificando con el Banco">Precalificando con el Banco</option>
            <option value="En Proceso">En Proceso</option>
            <option value="OK">OK</option>
            <option value="Finalizado">Finalizado</option>
          </select>
        </td>
        <td><button class="cambiar-estado">✔️ Cambiar</button></td>
        <td>${safe(telefono)}</td>
        <td><button class="enviar-wsp">📤 Enviar</button></td>
        <td class="resultado"></td>
      `;
      tabla.appendChild(row);
    });

  } catch (err) {
    tabla.innerHTML = `<tr><td colspan='7'>Error al cargar: ${safe(err.message)}</td></tr>`;
  }
}

document.addEventListener("click", async e => {
  const fila = e.target.closest("tr");
  if (!fila) return;
  const numero = fila.querySelector(".col-numero").textContent;
  const resultado = fila.querySelector(".resultado");

  if (e.target.classList.contains("cambiar-estado")) {
    const nuevaEtapa = fila.querySelector(".nuevo-estado").value;
    try {
      const res = await fetch("https://turnos-bisono-sembrador6-v2n2.onrender.com/cambiar-etapa", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ numero, nuevaEtapa })
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Error al actualizar");
      fila.querySelector(".col-estado").textContent = nuevaEtapa;
      resultado.textContent = "✅ Actualizado";
    } catch (err) {
      resultado.textContent = "❌ " + safe(err.message);
    }
  }

  if (e.target.classList.contains("enviar-wsp")) {
    const telefono = fila.children[4].textContent;
    try {
      const res = await fetch("https://graph.facebook.com/v19.0/" + encodeURIComponent(process.env.PHONE_NUMBER_ID) + "/messages", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.WHATSAPP_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: telefono,
          type: "text",
          text: { body: "¡Hola! es tu turno, por favor acércate a nuestro Oficial de Ventas Bisonó." }
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      resultado.textContent = "📤 WhatsApp enviado";
    } catch (err) {
      resultado.textContent = "❌ " + safe(err.message);
    }
  }
});
