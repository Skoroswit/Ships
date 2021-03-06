// MODEL
var model = {
	boardSize: 7,
	numShips: 3,
	shipLength: 3,
	shipsSunk: 0,
	
	ships: [
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] },
		{ locations: [0, 0, 0], hits: ["", "", ""] }
	],

	fire: function(guess) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			var index = ship.locations.indexOf(guess);

			// Sprawdzamy, czy okręt niezostał już trafiony
			if (ship.hits[index] === "hit") {
				view.displayMessage("Powtórka? Już wcześnej trafiłeś w ten cel!");
				return false;
			} else if (index >= 0) {
				ship.hits[index] = "hit";
                var snd = new Audio("../mp3/Shot.mp3");
                    snd.autoplay = true;
				view.displayHit(guess);
				view.displayMessage("TRAFIONY!");

				if (this.isSunk(ship)) {
                    var snd = new Audio("../mp3/TaDa.mp3");
                    snd.autoplay = true;
					view.displayMessage("Zatopiłeś mój okręt!");
					this.shipsSunk++;
				}
				return true;
			}
		}
		view.displayMiss(guess);
		view.displayMessage("Spudłowałeś.");
		return false;
	},

	isSunk: function(ship) {
		for (var i = 0; i < this.shipLength; i++)  {
			if (ship.hits[i] !== "hit") {
				return false;
			}
		}
	    return true;
	},

	generateShipLocations: function() {
		var locations;
		for (var i = 0; i < this.numShips; i++) {
			do {
				locations = this.generateShip();
			} while (this.collision(locations));
			this.ships[i].locations = locations;
		}
		console.log("Tablica okrętów: ");
		console.log(this.ships);
	},

	generateShip: function() {
		var direction = Math.floor(Math.random() * 2);
		var row, col;

		if (direction === 1) { // W poziomie.
			row = Math.floor(Math.random() * this.boardSize);
			col = Math.floor(Math.random() * (this.boardSize - this.shipLength));
		} else { // W pionie.
			row = Math.floor(Math.random() * (this.boardSize - this.shipLength));
			col = Math.floor(Math.random() * this.boardSize);
		}

		var newShipLocations = [];
		for (var i = 0; i < this.shipLength; i++) {
			if (direction === 1) {
				newShipLocations.push(row + "" + (col + i));
			} else {
				newShipLocations.push((row + i) + "" + col);
			}
		}
		return newShipLocations;
	},

	collision: function(locations) {
		for (var i = 0; i < this.numShips; i++) {
			var ship = this.ships[i];
			for (var j = 0; j < locations.length; j++) {
				if (ship.locations.indexOf(locations[j]) >= 0) {
					return true;
				}
			}
		}
		return false;
	}
};

// WIDOK
var view = {
	displayMessage: function(msg) {
		var messageArea = document.getElementById("messageArea");
		messageArea.innerHTML = msg;},

	displayHit: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "hit");},

	displayMiss: function(location) {
		var cell = document.getElementById(location);
		cell.setAttribute("class", "miss");}
};

// KONTROLER
var controller = {
	guesses: 0,

	processGuess: function(guess) {
		var location = parseGuess(guess);
		if (location) {
			this.guesses++;
			var hit = model.fire(location);
			if (hit && model.shipsSunk === model.numShips) {
               view.displayMessage("Zatopiłeś wszystkie okręty, w " +
                        this.guesses + " próbach.");
			}
		}
	}
}

// Funkcja przetwarzająca współrzędne wpisane przez użytkownika.
function parseGuess(guess) {
	var alphabet = ["A", "B", "C", "D", "E", "F", "G"];

	if (guess === null || guess.length !== 2) {
		alert("Proszę wpisać literę i cyfrę.");
	} else {
		var firstChar = guess.charAt(0);
		var row = alphabet.indexOf(firstChar);
		var column = guess.charAt(1);
		
		if (isNaN(row) || isNaN(column)) {
			alert("Ups, to nie są współrzędne!");
		} else if (row < 0 || row >= model.boardSize ||
		           column < 0 || column >= model.boardSize) {
			alert("Pole poza planszą!");
		} else {
			return row + column;
		}
	}
	return null;
}


// Funkcje obsługi zdarzeń.
function handleFireButton() {
	var guessInput = document.getElementById("guessInput");
	var guess = guessInput.value.toUpperCase();

	controller.processGuess(guess);

	guessInput.value = "";
}

function handleKeyPress(e) {
	var fireButton = document.getElementById("fireButton");

	// Kod przeznaczony dla IE9 i starszych 
	e = e || window.event;

	if (e.keyCode === 13) {
		fireButton.click();
		return false;
	}
}


// Funkcja init - wywoływana po zakończeniu wczytywania strony.
window.onload = init;

function init() {
	// Procedura obsługi przycisku Ognia!
	var fireButton = document.getElementById("fireButton");
	fireButton.onclick = handleFireButton;

	// Obsługa naciśnięcia klawisza "Enter".
	var guessInput = document.getElementById("guessInput");
	guessInput.onkeypress = handleKeyPress;

	// Umieszczanie okrętów na planszy.
	model.generateShipLocations();
}
