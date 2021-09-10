console.log("Estamos en signup");

window.addEventListener('load', function () {
    

    /* ---------------------- obtenemos variables globales ---------------------- */
    const form = document.forms[0];

    const nombre = document.querySelector('#nombre');
    const apellido = document.querySelector('#apellido');
    const email = document.querySelector('#inputEmail');
    const password = document.querySelector('#inputPassword');
    const passwordConfirm = document.querySelector('#passwordConfirm');

    const spinner =  document.querySelector('#loading')
    const url = 'https://ctd-todo-api.herokuapp.com/v1/users';


    /* ------------------- escuchamos el submit del formulario ------------------ */
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        //mostramos el spinner
        spinner.classList.remove('oculto');


        //creamos el cuerpo de la request
        const payload = {
            firstName: nombre.value,
            lastName: apellido.value,
            email: email.value,
            password: password.value
        };
        console.log(payload);
        console.log(passwordConfirm.value);

        //configuramos la request del Fetch
        const settings = {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if(password.value == passwordConfirm.value){
            /* -------------------------------------------------------------------------- */
            /*                        lanzamos la peticion a la API                       */
            /* -------------------------------------------------------------------------- */
            console.log("Utilizamos la API para crear un nuevo usuario");
            fetch(url, settings)
                .then(response => response.json())
                .then(data => {
                    console.log(data);
                    //ocultamos el spinner
                    spinner.classList.add('oculto')
    
                    if (data.jwt) {
                        //armo un objeto literal con cierta info que quiero guardar en LocalStorage
                        const usuario = {
                            jwt: data.jwt,
                            name: email.value.split('@')[0]
                        }
                        //guardo en LocalStorage el objeto con el token y el nombre del usuario
                        localStorage.setItem('user', JSON.stringify(usuario));
    
                        //redireccionamos a la página
                        location.replace('/')
                    }
    
                    //limpio los campos del formulario
                    form.reset();
                })
        }else{
            Swal.fire(
                '¡Cuidado!',
                'Las contraseñas no coinciden.',
                'warning'
              )
             //ocultamos el spinner
             spinner.classList.add('oculto')
        }

    });


});