// Mantiene la lógica del reproductor aislada del resto de los scripts de la página.
(function () {
  // Guarda las canciones y los datos que necesita cada opción de la lista.
  const playlist = [
    // Cada objeto contiene el título, el artista y la ruta del archivo de audio.
    { titulo: "Billie Jean", artista: "michael jackson", archivo: "musica/Billie Jean.mp3" },
    { titulo: "Game of throns", artista: "hanz simmer", archivo: "musica/Game.mp3" },
    { titulo: "interstellar", artista: "Hanz simmer", archivo: "musica/Interstellar.mp3" },
    { titulo: "Joseph", artista: "Falling in reavers", archivo: "musica/Joseph.mp3" },
    { titulo: "liberian girl", artista: "Michael Jackson", archivo: "musica/Liberian Girl.mp3" },
    { titulo: "Message Man", artista: "Twenty one pylots", archivo: "musica/message man.mp3" },
    { titulo: "Slipknot-Vermillion (parte 2)", artista: "slipknot", archivo: "musica/Slipknot - Vermilion (pt.2).mp3" },
    { titulo: "Take me to the beach", artista: "Imagen dragons", archivo: "musica/Take Me To The Beach.mp3" },
    { titulo: "The line", artista: "Twenty one pylots", archivo: "musica/The Line.mp3" },
    { titulo: "time", artista: "Hanz simmer", archivo: "musica/Time.mp3" }
  ];

  // Empieza por la primera canción y luego intenta recuperar el índice guardado.
  let indiceActual = 0;
  // Lee del navegador el índice de la última canción reproducida.
  const indiceGuardado = Number.parseInt(localStorage.getItem("indiceActual"), 10);
  // Solo acepta índices enteros que correspondan a una canción existente.
  if (Number.isInteger(indiceGuardado) && indiceGuardado >= 0 && indiceGuardado < playlist.length) {
    // Restaura la canción guardada para continuar la sesión anterior.
    indiceActual = indiceGuardado;
  }

  // Lee el segundo guardado y evita restaurar valores inválidos o negativos.
  let segundoGuardado = Math.max(0, Number.parseFloat(localStorage.getItem("segundoGuardado")) || 0);
  // Crea el elemento de audio que reproduce los archivos de la lista.
  const reproductor = new Audio();
  // Solicita primero los metadatos para conocer la duración sin descargar todo el audio.
  reproductor.preload = "metadata";

  // Crea el contenedor visual de los controles y la barra de reproducción.
  const contenedor = document.createElement("section");
  // Añade una clase para aplicar los estilos específicos del reproductor.
  contenedor.className = "reproductor-musica";
  // Explica a tecnologías de asistencia qué tipo de elemento es este bloque.
  contenedor.setAttribute("aria-label", "Reproductor de música");

  // Agrupa los botones para mantenerlos juntos encima de la barra de progreso.
  const controles = document.createElement("div");
  // Asigna la clase que organiza y presenta los botones.
  controles.className = "reproductor-controles";

  // Crea el botón para volver a la canción anterior.
  const anterior = document.createElement("button");
  // Muestra el símbolo de canción anterior.
  anterior.textContent = "⏮";
  // Añade un nombre accesible al botón, además del símbolo visual.
  anterior.setAttribute("aria-label", "Canción anterior");
  // Inserta el botón en la fila de controles.
  controles.appendChild(anterior);

  // Crea el botón que alterna entre reproducir y pausar.
  const botonReproducir = document.createElement("button");
  // Muestra inicialmente el símbolo de reproducción.
  botonReproducir.textContent = "▶";
  // Describe la acción inicial para lectores de pantalla.
  botonReproducir.setAttribute("aria-label", "Reproducir");
  // Marca este como el botón principal de la fila.
  botonReproducir.className = "reproductor-boton-principal";
  // Inserta el botón principal entre anterior y siguiente.
  controles.appendChild(botonReproducir);

  // Crea el botón para avanzar a la siguiente canción.
  const siguiente = document.createElement("button");
  // Muestra el símbolo de canción siguiente.
  siguiente.textContent = "⏭";
  // Añade un nombre accesible para describir su función.
  siguiente.setAttribute("aria-label", "Canción siguiente");
  // Inserta el botón en la fila de controles.
  controles.appendChild(siguiente);
  // Coloca la fila de botones antes de la nueva barra de reproducción.
  contenedor.appendChild(controles);

  // Crea la fila informativa que mostrará el tema y una animación de audio.
  const informacion = document.createElement("div");
  // Aplica el diseño de la fila de información del tema.
  informacion.className = "reproductor-informacion";
  // Crea el texto que se actualizará con el título y artista actuales.
  const textoCancion = document.createElement("p");
  // Asigna una clase para controlar el texto del tema desde CSS.
  textoCancion.className = "reproductor-cancion";
  // Evita que lectores de pantalla repitan el título en cada actualización.
  textoCancion.setAttribute("aria-live", "polite");
  // Añade el texto del tema a su fila.
  informacion.appendChild(textoCancion);

  // Crea una animación decorativa que representa visualmente el audio.
  const visualizador = document.createElement("div");
  // Asigna la clase que activa las barras animadas durante la reproducción.
  visualizador.className = "reproductor-visualizador";
  // Oculta las barras animadas a lectores de pantalla porque son decorativas.
  visualizador.setAttribute("aria-hidden", "true");
  // Genera cinco barras para formar el visualizador animado.
  for (let barra = 0; barra < 5; barra += 1) {
    // Crea cada barra individual de la animación.
    const elementoBarra = document.createElement("span");
    // Añade la barra al visualizador.
    visualizador.appendChild(elementoBarra);
  }
  // Sitúa el visualizador junto al título de la canción.
  informacion.appendChild(visualizador);
  // Inserta la información del tema debajo de los botones.
  contenedor.appendChild(informacion);

  // Crea el control deslizante que permite saltar a cualquier punto del audio.
  const barraProgreso = document.createElement("input");
  // Declara que el control es un deslizador numérico.
  barraProgreso.type = "range";
  // Empieza en cero y ajusta su máximo cuando se conoce la duración.
  barraProgreso.min = "0";
  barraProgreso.max = "0";
  // Permite cambiar la posición con precisión de décimas de segundo.
  barraProgreso.step = "0.1";
  // Inicializa la posición del control al inicio de la canción.
  barraProgreso.value = "0";
  // Asigna el estilo del control para personalizar su pista y su indicador.
  barraProgreso.className = "reproductor-barra-progreso";
  // Proporciona una descripción accesible para poder buscar en la canción.
  barraProgreso.setAttribute("aria-label", "Posición de reproducción");
  // Añade el control deslizante debajo de la información del tema.
  contenedor.appendChild(barraProgreso);

  // Crea las etiquetas que muestran el tiempo actual y la duración total.
  const tiempos = document.createElement("div");
  // Aplica el diseño de la fila de tiempos.
  tiempos.className = "reproductor-tiempos";
  // Crea la etiqueta del tiempo transcurrido.
  const tiempoActual = document.createElement("span");
  // Inicializa el tiempo transcurrido en cero.
  tiempoActual.textContent = "0:00";
  // Crea la etiqueta de la duración de la canción.
  const duracionTotal = document.createElement("span");
  // Indica que todavía no se han cargado los metadatos de duración.
  duracionTotal.textContent = "0:00";
  // Añade el tiempo transcurrido al lado izquierdo de la fila.
  tiempos.appendChild(tiempoActual);
  // Añade la duración total al lado derecho de la fila.
  tiempos.appendChild(duracionTotal);
  // Inserta las etiquetas temporales debajo de la barra deslizante.
  contenedor.appendChild(tiempos);

  // Convierte una cantidad de segundos en un texto con formato minutos:segundos.
  function formatearTiempo(segundos) {
    // Descarta valores que no sean números finitos.
    const tiempoValido = Number.isFinite(segundos) ? segundos : 0;
    // Calcula los minutos completos del tiempo recibido.
    const minutos = Math.floor(tiempoValido / 60);
    // Calcula los segundos restantes y añade un cero cuando hace falta.
    const segundosRestantes = Math.floor(tiempoValido % 60).toString().padStart(2, "0");
    // Devuelve el tiempo listo para mostrar en pantalla.
    return `${minutos}:${segundosRestantes}`;
  }

  // Actualiza la barra, las etiquetas temporales y el avance visual.
  function actualizarProgreso() {
    // Usa la duración cargada o cero mientras el navegador prepara la canción.
    const duracion = Number.isFinite(reproductor.duration) ? reproductor.duration : 0;
    // Evita que el indicador exceda el final de la canción.
    const posicion = Math.min(reproductor.currentTime, duracion);
    // Sincroniza el valor máximo de la barra con la duración real.
    barraProgreso.max = duracion.toString();
    // Sincroniza el indicador con la posición actual del audio.
    barraProgreso.value = posicion.toString();
    // Calcula qué porcentaje de la canción se ha reproducido.
    const porcentaje = duracion > 0 ? (posicion / duracion) * 100 : 0;
    // Actualiza la variable CSS que rellena la pista de la barra.
    barraProgreso.style.setProperty("--progreso", `${porcentaje}%`);
    // Muestra el tiempo transcurrido con el formato minutos:segundos.
    tiempoActual.textContent = formatearTiempo(posicion);
    // Muestra la duración total con el mismo formato.
    duracionTotal.textContent = formatearTiempo(duracion);
  }

  // Actualiza el título del reproductor con la canción seleccionada.
  function actualizarTitulo() {
    // Lee los datos de la canción que corresponde al índice actual.
    const cancion = playlist[indiceActual];
    // Presenta juntos el título y el nombre del artista.
    textoCancion.textContent = `${cancion.titulo} · ${cancion.artista}`;
  }

  // Guarda el índice actual y reinicia el tiempo al cambiar de canción.
  function cargarCancion() {
    // Descarta el tiempo guardado de la canción anterior.
    segundoGuardado = 0;
    // Persiste la posición inicial para no restaurar un tiempo de otra canción.
    localStorage.setItem("segundoGuardado", "0");
    // Guarda el índice para recuperar esta canción al volver a la página.
    localStorage.setItem("indiceActual", indiceActual.toString());
    // Cambia la fuente de audio a la canción seleccionada.
    reproductor.src = playlist[indiceActual].archivo;
    // Refleja inmediatamente el nuevo tema en la interfaz.
    actualizarTitulo();
    // Intenta iniciar la nueva canción y mantiene el botón coherente si falla.
    reproductor.play().catch(function () {
      // Muestra el estado de pausa si el navegador no permite iniciar el audio.
      botonReproducir.textContent = "▶";
      // Actualiza el nombre accesible del botón al estado de pausa.
      botonReproducir.setAttribute("aria-label", "Reproducir");
    });
  }

  // Restaura el avance anterior cuando ya se conocen los metadatos del archivo.
  reproductor.addEventListener("loadedmetadata", function () {
    // Limita el tiempo guardado para que nunca supere la duración de esta canción.
    reproductor.currentTime = Math.min(segundoGuardado, reproductor.duration || 0);
    // Actualiza los tiempos y la barra con la duración recién cargada.
    actualizarProgreso();
  });

  // Sincroniza la interfaz y guarda la posición mientras se reproduce el audio.
  reproductor.addEventListener("timeupdate", function () {
    // Conserva el segundo actual para continuar desde aquí en otra visita.
    localStorage.setItem("segundoGuardado", reproductor.currentTime.toString());
    // Refresca el deslizador y las etiquetas de tiempo.
    actualizarProgreso();
  });

  // Cambia el botón y activa la animación cuando comienza la reproducción.
  reproductor.addEventListener("play", function () {
    // Muestra el símbolo para pausar la canción que está sonando.
    botonReproducir.textContent = "⏸";
    // Actualiza la descripción accesible del botón.
    botonReproducir.setAttribute("aria-label", "Pausar");
    // Activa la animación de las barras del visualizador.
    visualizador.classList.add("reproduciendo");
  });

  // Cambia el botón y detiene la animación cuando se pausa el audio.
  reproductor.addEventListener("pause", function () {
    // Muestra el símbolo para reanudar la canción pausada.
    botonReproducir.textContent = "▶";
    // Actualiza la descripción accesible del botón.
    botonReproducir.setAttribute("aria-label", "Reproducir");
    // Detiene el movimiento del visualizador mientras no suena la música.
    visualizador.classList.remove("reproduciendo");
  });

  // Avanza automáticamente cuando termina una canción.
  reproductor.addEventListener("ended", function () {
    // Calcula el siguiente índice y vuelve al inicio al llegar al final de la lista.
    indiceActual = (indiceActual + 1) % playlist.length;
    // Carga y reproduce el tema que sigue.
    cargarCancion();
  });

  // Mueve el audio al punto elegido mientras se arrastra el control deslizante.
  barraProgreso.addEventListener("input", function () {
    // Aplica al reproductor el segundo indicado por la barra.
    reproductor.currentTime = Number(barraProgreso.value);
    // Actualiza enseguida el tiempo mostrado durante el arrastre.
    actualizarProgreso();
  });

  // Cambia a la canción anterior y la reproduce al pulsar el botón.
  anterior.addEventListener("click", function () {
    // Resta uno y usa el resto para volver al final si se estaba en la primera canción.
    indiceActual = (indiceActual - 1 + playlist.length) % playlist.length;
    // Carga la canción seleccionada y guarda el índice nuevo.
    cargarCancion();
  });

  // Alterna entre reproducir y pausar cuando se pulsa el botón principal.
  botonReproducir.addEventListener("click", function () {
    // Si el audio está pausado, intenta reproducirlo y deja que los eventos actualicen la interfaz.
    if (reproductor.paused) {
      // Inicia la reproducción; el evento play actualiza el botón al completarse.
      reproductor.play().catch(function () {
        // Mantiene el control en estado de reproducción si el navegador bloquea el audio.
        botonReproducir.textContent = "▶";
      });
    } else {
      // Detiene temporalmente el audio; el evento pause actualizará los controles.
      reproductor.pause();
    }
  });

  // Cambia a la canción siguiente y la reproduce al pulsar el botón.
  siguiente.addEventListener("click", function () {
    // Avanza uno y usa el resto para volver al inicio al final de la lista.
    indiceActual = (indiceActual + 1) % playlist.length;
    // Carga la canción seleccionada y guarda el índice nuevo.
    cargarCancion();
  });

  // Configura la canción restaurada antes de mostrar el reproductor.
  reproductor.src = playlist[indiceActual].archivo;
  // Muestra título y artista de la canción inicial o restaurada.
  actualizarTitulo();
  // Añade el reproductor completo al final del contenido de la página.
  document.body.appendChild(contenedor);
})();
