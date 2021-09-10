
//consultamos si es que existe data del usuario en localstorage
if (!localStorage.user) {
  location.replace('login.html')
}
/* -------------------------------------------------------------------------- */
/*             realizamos la lógica una vez que carga el documento            */
/* -------------------------------------------------------------------------- */
window.addEventListener('load', function () {
  //inicializamos AOS para animaciones de scroll
  AOS.init();


  /* ---------- mostramos el nombre del usuario en la barra superior ---------- */
  const userName = document.querySelector('.user-info p');
  const deposito = JSON.parse(localStorage.user)
  userName.innerText = deposito.name;

  /* ---------------- creamos la funcionalidad de cerrar sesion --------------- */
  const btnCerrarSesion = document.querySelector('#closeApp');
  btnCerrarSesion.addEventListener('click', function () {

    Swal.fire({
      title: '¿Desea cerrar sesión?',
      text: 'Cerraremos su sesión en este navegador.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: '¡Sí, por favor!'
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire(
          'Hasta luego..',
          'Esperamos que haya disfrutado de nuestra app.',
          'success'
        )
        //limpiamos el localstorage y redireccioamos a login
        localStorage.clear();
        location.replace('/login.html');
      } else{
        Swal.fire(
          'Ok..',
          'Gracias por quedarte con nosotros...',
          'success'
        )
      }
    })

  })


  const urlTareas = 'https://ctd-todo-api.herokuapp.com/v1/tasks'
  const usuario = JSON.parse(localStorage.user);
  const token = usuario.jwt;


  consultarTareas()


  /* -------------------- escuchar el boton de crear tarea -------------------- */
  const formCrearTarea = document.querySelector('.nueva-tarea');
  const nuevaTarea = document.querySelector('#nuevaTarea');

  /* -------------------------------------------------------------------------- */
  /*                          agregar nueva tarea: POST                         */
  /* -------------------------------------------------------------------------- */

  formCrearTarea.addEventListener('submit', function (event) {
    event.preventDefault();
    console.log("crear terea");
    console.log(nuevaTarea.value);

    const payload = {
      description: nuevaTarea.value.trim()
    };
    const settings = {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      }
    }
    console.log("Creando un tarea en la base de datos");
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tarea => {

        console.log(tarea);

        Swal.fire({
          position: 'top-end',
          icon: 'success',
          title: 'Tarea creada con éxito.',
          showConfirmButton: false,
          timer: 1500
        })

        consultarTareas()
      })
      .catch(error => console.log(error));


    //limpiamos el form
    formCrearTarea.reset();
  })


  /* -------------------------------------------------------------------------- */
  /*                   consultando las tareas del usuario: GET                  */
  /* -------------------------------------------------------------------------- */

  function consultarTareas() {
    const settings = {
      method: 'GET',
      headers: {
        authorization: token
      }
    };
    console.log("Consultando mis tareas");
    fetch(urlTareas, settings)
      .then(response => response.json())
      .then(tareas => {
        console.log(tareas)
        //falso esqueleto que simula lo que va a ocupar el contenido
        const skeleton = document.querySelector('#skeleton');
        //lo borramos antes de cargar el contenido
        if (skeleton) {
          skeleton.remove();
        }

        renderizarTareas(tareas);
      })
      .catch(error => console.log(error));
  }

  /* -------------------------------------------------------------------------- */
  /*                        renderizar tareas en el HTML                        */
  /* -------------------------------------------------------------------------- */

  function renderizarTareas(listado) {

    const tareasPendientes = document.querySelector('.tareas-pendientes');
    tareasPendientes.innerHTML = "";
    const tareasTerminadas = document.querySelector('.tareas-terminadas');
    tareasTerminadas.innerHTML = "";

    listado.forEach(tarea => {
      if (tarea.completed === false) {
        //lo mandamos al listado de tareas incompletas
        tareasPendientes.innerHTML += `
        <li data-aos="fade-down" class="tarea">
          <div id="${tarea.id}" class="not-done"></div>
          <div class="descripcion">
            <p class="nombre">${tarea.description}</p>
            <p class="timestamp"><i class="far fa-calendar-alt"></i> Creada: ${dayjs(tarea.createdAt).format('DD/MM/YYYY HH:mm')} hs</p>
          </div>
        </li>
        `
      } else if (tarea.completed) {
        //lo mandamos al listado de tareas terminadas
        tareasTerminadas.innerHTML += `
        <li data-aos="flip-up" class="tarea">
          <div class="done"></div>
          <div class="descripcion">
            <div class="eliminar"><i id="${tarea.id}" class="far fa-trash-alt"></i></div>
            <p class="nombre">${tarea.description}</p>
            <p class="timestamp"><i class="far fa-calendar-alt"></i> Creada: ${dayjs(tarea.createdAt).format('DD/MM/YYYY HH:mm')} hs</p>
          </div>
        </li>
        `
      }
    })

    //agregamos a los botones de cambiar de estado la escucha del click
    const botonesCambiarEstado = document.querySelectorAll('.tareas-pendientes .not-done');

    //por cada boton le agregamos el listener
    botonesCambiarEstado.forEach(boton => {
      boton.addEventListener('click', function (event) {
        console.log(event.target.id);
        //disparamos el cambio de estado
        cambiarEstadoTerminado(event.target.id)
      });
    });

    const botonesEliminar = document.querySelectorAll('.eliminar');

    //agregamos a cada boton de eliminar su funcionalidad
    botonesEliminar.forEach(boton => {
      boton.addEventListener('click', function (event) {
        console.log(event.target.id);
        //disparar el eliminado de la tarea
        eliminarTarea(event.target.id);

      });
    });

  }

  /* -------------------------------------------------------------------------- */
  /*                             cambiar estado PUT                             */
  /* -------------------------------------------------------------------------- */
  function cambiarEstadoTerminado(id) {
    //constituimos el endpoint necesario
    const urlCompleted = `${urlTareas}/${id}`

    const payload = {
      completed: true
    };

    const settings = {
      method: 'PUT',
      body: JSON.stringify(payload),
      headers: {
        'Content-Type': 'application/json',
        authorization: token
      }
    }

    console.log("Cambiando el estado de una tarea");
    fetch(urlCompleted, settings)
      .then(response => response.json())
      .then(tarea => {
        console.log(tarea)
        //llama a la lista de tareas actualizadas y dentro al renderizado
        consultarTareas();
      })
      .catch(error => console.log(error));

  }


  /* -------------------------------------------------------------------------- */
  /*                       eliminar tarea realizada DELETE                      */
  /* -------------------------------------------------------------------------- */
  function eliminarTarea(id) {
    //constituimos el endpoint necesario
    const urlEliminar = `${urlTareas}/${id}`

    const settings = {
      method: 'DELETE',
      headers: {
        authorization: token
      }
    }
    //validamos que llegue el id
    if (id) {
      console.log("Eliminando una tarea");
      fetch(urlEliminar, settings)
        .then(response => response.json())
        .then(respuesta => {
          console.log("Mensaje servidor: " + respuesta)
          //llama a la lista de tareas actualizadas y dentro al renderizado
          consultarTareas();
        })
        .catch(error => console.log(error));
    }
  }


});