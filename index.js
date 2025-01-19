var mapaMinas = [];             // Contiene el mapa de las minas existentes
var cantidadBanderas = 8;
var casillasFaltantes = 56;
var tamTablero;

{//audios
    var music = new Audio("./sounds/music.mp3");
    music.volume=0.5;
    music.loop = true;

    var explotion = new Audio("./sounds/explotion.mp3");
    explotion.volume=0.7;

    var ponerBandera = new Audio("./sounds/ponerBandera.mp3");
    var quitarBandera = new Audio("./sounds/quitarBandera.mp3");

    var click = new Audio("./sounds/click.mp3");
}

{//tiempo
    var tiempo = 0;
    window.setInterval(function () {
        $(".tiempo").text(tiempo);
        tiempo++;
    },1000)
}


$(document).ready(function () {
    generarTablero(8, 8);
});
//Mandan a cargar el tablero
$(".nivel").on("change", function () {
    var nivel = Number($(".nivel").val());
    var cantidadMinas;

    switch (nivel) {
        case 1:
            tamTablero = 8;
            cantidadMinas = 8;
            break;
        case 2:
            tamTablero = 12;
            cantidadMinas = 25;
            break;
        default:
            tamTablero = 16;
            cantidadMinas = 40
            break;
    }

    generarTablero(tamTablero, cantidadMinas);
    cantidadBanderas = cantidadMinas;
    $(".cantidadBanderas").text(cantidadBanderas);
    casillasFaltantes = (tamTablero ** 2 - cantidadMinas);
    $(".casillasFaltantes").text(casillasFaltantes);
});


function generarTablero(tamTablero, cantidadMinas) {    // Genera el tablero

    mapaMinas = []; //resetea el mapa de minas a vacío antes de regenerarlo

    for (let i = 0; i < tamTablero; i++) { // Genera mapa de minas vacío
        let filaTemporal = []
        for (let j = 0; j < tamTablero; j++) {
            filaTemporal[j] = 0;
        }
        mapaMinas.push(filaTemporal)
    }

    for (let i = 0; i < cantidadMinas; i++) { // Genera las minas en el mapa

        let x = Math.floor(Math.random() * tamTablero);
        let y = Math.floor(Math.random() * tamTablero);

        if (mapaMinas[x][y] == 0) {
            mapaMinas[x][y] = 1;
        } else {
            i--;
        }
        ;

    }


    $(".tablero").html("");
    $(".tablero").css("grid-template", `repeat(${tamTablero}, 1fr) / repeat(${tamTablero}, 1fr)`);  //cambia tamaño del tablero, template del grid

    let esPar = true;

    for (let i = 0; i < tamTablero; i++) { // Genera cada casilla del tablero.
        for (let j = 0; j < tamTablero; j++) {

            let minasAlRededor = revisarMinas(tamTablero, i, j);  //Revisar minas al rededor

            let clase = "";
            if (mapaMinas[i][j] == 1) {                         //Revisa si es mina, para agregar dicha clase
                clase = " mina"
            }

            if (minasAlRededor == 0 || clase == " mina") {      //Cambia el número a vacío en las casillas necesarias
                minasAlRededor = ""
            }

            let parOImpar;
            if (esPar) {
                parOImpar = " par ";
                esPar = !esPar;
            } else {
                parOImpar = " impar ";
                esPar = !esPar;
            }


            $(".tablero").append(`<div id="c-${i}-${j}" data-row="${i}" data-column="${j}" class="casilla oculta${clase}${parOImpar}">${minasAlRededor}</div>`);    //Agrega cada casilla al tablero
        }
        esPar = !esPar;
    }


}



//$(".casilla").fitText(0.38);

$(document).on("click", ".oculta", function () {        // Evento de clic izquierdo, para descubrir casilla

    if (!$(this).hasClass("marcada")) {

        $(this).removeClass("oculta");

        if ($(this).hasClass("mina")) {
            perder();
        } else {

            click.play()

            if ($(this).text() == "") {
                clikcAlRededor(this)
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
    event.preventDefault();
});

$(document).on("contextmenu", ".oculta", function (event) {//Evento de clic derecho, para marcar con banderita
    // Evitar que se muestre el menú contextual por defecto
    event.preventDefault();

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

function perder() {

    $(".mina").removeClass("oculta");

    explotion.play();
    music.pause();
    music.currentTime = 0;

    setTimeout(() => {
        alert("Perdiste")
        $(".nivel").change()
        music.play()
    }, 500);
}

function ganar() {
    setTimeout(() => {
        alert("Ganaste!!")
        $(".nivel").change()
    }, 500);

}


function clikcAlRededor(esto) {

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


music.play()