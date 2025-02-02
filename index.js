var mapaMinas = [];             // Contiene el mapa de las minas existentes
var cantidadMinas = 8;
var cantidadBanderas;
var casillasFaltantes;
var tamTablero = 8;
var reloj;
var tiempo = 0;
var primerClick;
const myModal = new bootstrap.Modal("#myModal");

$(".result").hide();
$(".nivelPer").hide();
myModal.show();

{//audios
    var music = new Audio("./sounds/music.mp3");
    music.volume = 0.5;
    music.loop = true;

    var explotion = new Audio("./sounds/explotion.mp3");
    explotion.volume = 0.7;

    var ponerBandera = new Audio("./sounds/ponerBandera.mp3");
    var quitarBandera = new Audio("./sounds/quitarBandera.mp3");

    var click = new Audio("./sounds/click.mp3");
}


$(".nivel").on("change", function () {//Cambia los parámetros para el tablero
    let nivel = Number($(this).val());

    switch (nivel) {
        case 1:
            $(".nivelPer").hide();
            $(".botonJugar").removeAttr("disabled");
            tamTablero = 8;
            cantidadMinas = 8;
            break;
        case 2:
            $(".nivelPer").hide();
            $(".botonJugar").removeAttr("disabled");
            tamTablero = 12;
            cantidadMinas = 21;
            break;
        case 3:
            $(".nivelPer").hide();
            $(".botonJugar").removeAttr("disabled");
            tamTablero = 16;
            cantidadMinas = 40
            break;
        default:
            $(".nivelPer").show();
            tamTablero = 0;
            cantidadMinas = 0;
            $(".botonJugar").attr("disabled", "true");
            break;
    }

    $(".mostrarCasillas").text(tamTablero ** 2 - cantidadMinas);
    $(".mostrarMinas").text(cantidadMinas);
});


$(".nivelPer").on("change", function () {//Cambia los parámetros para el tablero
    let nivel = Number($(this).val());

    if (nivel < 3 || nivel > 20) {

        tamTablero = 0;
        cantidadMinas = 0;
        $(".botonJugar").attr("disabled", "true");

    } else {

        tamTablero = nivel;
        cantidadMinas = Math.floor(nivel ** 2 / 6)

        $(".mostrarCasillas").text(tamTablero ** 2 - cantidadMinas);
        $(".mostrarMinas").text(cantidadMinas);

        $(".botonJugar").removeAttr("disabled");

    }
});


function mandarAGenerar() {//Manda a generar el tablero
    generarTablero(tamTablero, cantidadMinas);
    cantidadBanderas = cantidadMinas;
    $(".cantidadBanderas").text(cantidadBanderas);
    casillasFaltantes = (tamTablero ** 2 - cantidadMinas);
    $(".casillasFaltantes").text(casillasFaltantes);

    {//tiempo
        $(".tiempo").text("0");
        tiempo = 0;
        reloj = setInterval(function () {
            tiempo++;
            $(".tiempo").text(tiempo);
        }, 1000)
    }

    music.play()

    primerClick = true;
}


$(".botonJugar").on("click", function () {
    cancelAnimationFrame(animacionID);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    $("canvas").css("z-index", "-1");
    mandarAGenerar();
});


function generarMinas(cantidadDeMinas) {
    for (let i = 0; i < cantidadDeMinas; i++) { // Genera las minas en el mapa

        let x = Math.floor(Math.random() * tamTablero);
        let y = Math.floor(Math.random() * tamTablero);

        if (mapaMinas[x][y] == 0) {
            mapaMinas[x][y] = 1;
        } else {
            i--;
        }
    }
}

function generarTablero(tamTablero, cantidadMinas) {    // Genera el tablero

    mapaMinas = []; //resetea el mapa de minas a vacío antes de regenerarlo

    for (let i = 0; i < tamTablero; i++) { // Genera mapa de minas vacío
        let filaTemporal = []
        for (let j = 0; j < tamTablero; j++) {
            filaTemporal[j] = 0;
        }
        mapaMinas.push(filaTemporal)
    }

    generarMinas(cantidadMinas);


    $(".tablero").html("");
    $(".tablero").css("grid-template", `repeat(${tamTablero}, 1fr) / repeat(${tamTablero}, 1fr)`);  //cambia tamaño del tablero, template del grid

    let esPar = true;

    for (let i = 0; i < tamTablero; i++) { // Genera cada casilla del tablero.
        for (let j = 0; j < tamTablero; j++) {

            let parOImpar;
            if (esPar) {
                parOImpar = " par ";
                esPar = !esPar;
            } else {
                parOImpar = " impar ";
                esPar = !esPar;
            }


            $(".tablero").append(`<div id="c-${i}-${j}" data-row="${i}" data-column="${j}" class="casilla oculta${parOImpar}"></div>`);    //Agrega cada casilla al tablero
        }

        if (tamTablero % 2 == 0) {
            esPar = !esPar;
        }
    }


}


$(document).on("click", ".oculta", function () {        // Evento de clic izquierdo, para descubrir casilla


    let x = Number($(this).attr("data-row"));
    let y = Number($(this).attr("data-column"));

    if (!$(this).hasClass("marcada")) {

        if (primerClick) {
            while (mapaMinas[x][y] == 1) {
                mapaMinas[x][y] = 0;
                generarMinas(1)
            };
            primerClick = false;
        }


        $(this).removeClass("oculta");

        if (mapaMinas[x][y] == 1) {
            perder();
        } else {

            click.play()//Reproduce sonido de descubrir mina

            let minasAlRededor = revisarMinas(tamTablero, x, y);

            if (minasAlRededor == 0) {

                setTimeout(() => {
                    clikcAlRededor(this)
                }, 160);

            } else {
                $(this).css("background-image", `url("./images/i${minasAlRededor}.png")`);
            }

            casillasFaltantes--;
            $(".casillasFaltantes").text(casillasFaltantes);
            if (casillasFaltantes == 0) {
                ganar();
            }

        }

    }

});




$(document).on("contextmenu", ".casilla", function (event) {
    event.preventDefault();// Evitar que se muestre el menú contextual por defecto
});


$(document).on("contextmenu", ".oculta", function (event) {//Evento de clic derecho, para marcar con banderita
    if ($(this).hasClass("marcada")) {
        quitarBandera.play()
        $(this).removeClass("marcada");
        cantidadBanderas++;
    } else {
        if (cantidadBanderas > 0) {
            ponerBandera.play()
            $(this).addClass("marcada");
            cantidadBanderas--;
        }
    }

    $(".cantidadBanderas").text(cantidadBanderas);
});









function revisarMinas(tamTablero, x, y) {                 // Devuelve el número de minas que hay al rededor, para colocar en el div

    let minas = 0;


    let repeticionesX = 3, repeticionesY = 3;

    if (x == 0 || x == tamTablero - 1) {
        repeticionesX = 2;
    }

    if (y == 0 || y == tamTablero - 1) {
        repeticionesY = 2;
    }


    let modificadorX = -1, modificadorY = -1;

    if (x == 0) {
        modificadorX = 0;
    }

    if (y == 0) {
        modificadorY = 0;
    }


    for (let i = 0; i < repeticionesX; i++) {

        let modificadorYTemporal = modificadorY;

        for (let j = 0; j < repeticionesY; j++) {

            if (mapaMinas[x + modificadorX][y + modificadorYTemporal] == 1) {
                minas++;
            }
            modificadorYTemporal++;
        }

        modificadorX++;
    }


    return minas;
}



function clikcAlRededor(esto) { //Clickea todas las casillas al rededor, en caso de ser 0 la que clickeo el usuario.

    let x = Number($(esto).attr("data-row"));
    let y = Number($(esto).attr("data-column"));

    let repeticionesX = 3, repeticionesY = 3;

    if (x == 0 || x == tamTablero - 1) {
        repeticionesX = 2;
    }

    if (y == 0 || y == tamTablero - 1) {
        repeticionesY = 2;
    }


    let modificadorX = -1, modificadorY = -1;

    if (x == 0) {
        modificadorX = 0;
    }

    if (y == 0) {
        modificadorY = 0;
    }


    for (let i = 0; i < repeticionesX; i++) {

        let modificadorYTemporal = modificadorY;

        for (let j = 0; j < repeticionesY; j++) {

            let newX = x + modificadorX;
            let newY = y + modificadorYTemporal;



            if (!$(`#c-${newX}-${newY}`).hasClass("mina")) {
                $(`#c-${newX}-${newY}`).click();
            }

            modificadorYTemporal++;
        }

        modificadorX++;
    }
}




function perder() {

    explotion.play();

    animacion("mina")
    $("canvas").css("z-index", "0");

    for (let i = 0; i < tamTablero; i++) {//Para mostrar todas las minas que hay
        for (let j = 0; j < tamTablero; j++) {

            if (mapaMinas[i][j] == 1) {
                console.log(i, j);
                $(`#c-${i}-${j}`).addClass("mina");
                $(`#c-${i}-${j}`).removeClass("oculta");
            }

        };
    }

    resultModal("HAS PERDIDO :(", "perder")

}



function ganar() {
    animacion("bandera")
    $("canvas").css("z-index", "0");
    resultModal("¡¡HAS GANADO!!", "ganar")
}


function resultModal(texto, sonido) {

    clearInterval(reloj);

    music.pause();
    music.currentTime = 0;

    $(".resultText").text(texto);
    $(".resultTime").text(tiempo);
    $(".resultCasillas").text((tamTablero ** 2 - cantidadMinas - casillasFaltantes) + " / " + (tamTablero ** 2 - cantidadMinas));
    $(".result").show();
    $(".botonJugar").text("Jugar de Nuevo");

    setTimeout(() => {
        myModal.show();

        var audioResultado = new Audio(`./sounds/${sonido}.mp3`);
        audioResultado.play()

    }, 800);
}


$(".botonReiniciar").on("click", function () {
    clearInterval(reloj);
    mandarAGenerar();
});

$(".botonConfig").on("click", function () {
    clearInterval(reloj);

    music.pause();
    music.currentTime = 0;

    $(".result").hide();
    $(".botonJugar").text("Jugar");

    myModal.show();
});

$(".botonVolumen").on("click", function () {

    if ($(this).hasClass("on")) {
        music.volume = 0;
        $(this).attr("src", "./images/volumenOff.png");
        $(this).removeClass("on");

    } else {
        music.volume = 0.5;
        $(this).attr("src", "./images/volumenOn.png");
        $(this).addClass("on");
    }

});














var canvas = document.getElementById("miCanvas");
var ctx = canvas.getContext("2d");

// Ajustar tamaño del canvas al tamaño de la ventana
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Cargar la imagen de la mina
var imagenMina = new Image();
var animacionID;




// Clase Mina para lluvia de minas
class Mina {
    constructor() {
        this.x = Math.random() * canvas.width;  // Posición aleatoria en X
        this.y = Math.random() * -canvas.height;  // Posición aleatoria arriba de la pantalla
        this.velocidad = 2 + Math.random() * 3; // Velocidad de caída (entre 2 y 5)
        this.rotacion = Math.random() * Math.PI * 2; // Rotación inicial aleatoria
        this.velocidadRotacion = (Math.random() - 0.5) * 0.1; // Velocidad de rotación aleatoria
        this.tamano = 30 + Math.random() * 50; // Tamaño aleatorio entre 30 y 80 px
    }

    // Actualizar posición y rotación
    actualizar() {
        this.y += this.velocidad; // Mueve la mina hacia abajo
        this.rotacion += this.velocidadRotacion; // Rota la mina

        // Si la mina sale de la pantalla, la reiniciamos arriba
        if (this.y > canvas.height) {
            this.y = -this.tamano;
            this.x = Math.random() * canvas.width;
            this.velocidad = 2 + Math.random() * 3;
            this.tamano = 30 + Math.random() * 50;
        }
    }

    // Dibujar la mina en el canvas
    dibujar() {
        ctx.save(); // Guardamos el estado del contexto
        ctx.translate(this.x + this.tamano / 2, this.y + this.tamano / 2); // Movemos el origen
        ctx.rotate(this.rotacion); // Aplicamos la rotación
        ctx.drawImage(imagenMina, -this.tamano / 2, -this.tamano / 2, this.tamano, this.tamano); // Dibujamos la imagen
        ctx.restore(); // Restauramos el contexto
    }
}






// Crear un array con 15 minas
var minasLluvia = [];
for (let i = 0; i < 25; i++) {
    minasLluvia.push(new Mina());
}


function animacion(imagenP) {
    imagenMina.src = `./images/${imagenP}.png`;
    animar()
}




// Función de animación
function animar() {

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el canvas

    // Actualizar y dibujar cada mina
    minasLluvia.forEach(mina => {
        mina.actualizar();
        mina.dibujar();
    });

    animacionID = requestAnimationFrame(animar); // Llamar a la siguiente animación
}







// Ajustar tamaño del canvas cuando cambia la ventana
window.addEventListener("resize", function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});