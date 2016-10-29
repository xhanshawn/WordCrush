
$.fn.wordcrush = function(options = {}) {
	const word_10000_url = "https://cdn.rawgit.com/xhanshawn/WordCrush/master/data/word_10000.js";
	$.getScript(word_10000_url, function(data, textStatus, jqxhr) {
		wordPanel.init(size).update();
	});

	const size = 4;
	const template = `
		<div class="container size-4 bg-pink" id="word-crush">
			<div class="row" id="info-panel">
				<div class="col-xs-8 board-iv">
					<div class="bg-pink" id="alert-board">
						<span class="" id="">Word Crush!</span>
					</div>
					<div class="bg-pink" id="word-board">
						<span class="" id="selected-word"> </span>
					</div>
				</div>
				<div class="col-xs-4 board bg-pink pull-right" id="score-board">
					SCORE:<br>
					<span class="" id="score">0</span>
				</div>
			</div>
			
			<div class="row">
				<div class="col-xs-12" id="play-panel"></div>
			</div>
		</div>
	`;
	$(this).append(template);
}

const wordMatrix = {
	// default Matrix SIZE
	SIZE: 4,
	// clear the matrix and visited
	clear: function(){
		// Initialize matrix and visited if null
		if(!this.M || !this.visited) {
			this.M = new Array(this.SIZE);
			for (let i = 0; i < this.SIZE; i++) {
			  this.M[i] = new Array(this.SIZE);
			}
			this.visited = new Array(this.SIZE * this.SIZE);
		}

		// Clear matrix and visited
		for(let i = 0; i < this.visited.length; i ++) this.visited[i] = false;
		for(let i = 0; i < this.SIZE; i++){
			for(let j = 0; j < this.SIZE; j++){
				this.M[i][j] = '';
			}
		}
	},
	// Draw a randome key from collection with options
	// options - options which will apply for draw:
	//	   filter - only draw key from collection with f
	drawFrom(collection, options){
		if(!collection.length) throw 'EmptyCollection';
		if(options && options.debug_mode) debugger
		let filtered_collection = [];
		let select = () => true;

		// collection should be object or array
		if(typeof collection === 'object'){
			const filter = options ? options.filter : null;

			// differ null from false!!!
			if(filter != null) {
				if(typeof filter === 'object'){
					// filter is a set of elements
					if(Array.isArray(filter)) select = (v) => filter.includes(v);
					else throw 'InvalidFilter';
				} else {
					// filter is a single value
					select = (v) => v == filter;
				}
			}

			// get filtered keys from collection
			if(Array.isArray(collection)) {
				collection.forEach(function(v, i){
					if(select(v)) filtered_collection.push(i);
			  });
			} else {
				for(let k in collection){
					if(select(collection[k])) filtered_collection.push(k);
				}
			}

			const rani = Math.floor((Math.random() * filtered_collection.length));
			return filtered_collection[rani];
		}
	},
	// Generate a random postion near the input postion.
	randPositionNear(p) {
		// first postion, draw from a random place not visited.
		if(!p) return this.drawFrom(this.visited, { filter: false });
		
		// 1-D to 2-D coordinates
		const x = Math.floor(p / this.SIZE);
		const y = p - x * this.SIZE;

		// 8 directions
		let directions = [(x - 1) * this.SIZE + y,  // up
						  (x + 1) * this.SIZE + y]; // down

		if(y > 0) $.merge(directions, [(x - 1) * this.SIZE + y - 1,        // upleft
									   (x + 1) * this.SIZE + y - 1,        // downleft
										x * this.SIZE + y - 1]);           // left
		if(y < this.SIZE - 1) $.merge(directions, [(x - 1) * this.SIZE + y + 1, // upright
												   (x + 1) * this.SIZE + y + 1, // downright
												    x * this.SIZE + y + 1]);    // right

		// filter illegal and visited coordinate
		let possible_pos = [];

		directions.forEach((val, i) => {
			if(val >= 0 && val < this.SIZE * this.SIZE && !this.visited[val]) possible_pos.push(val);
		});
		if(possible_pos.length) return possible_pos[this.drawFrom(possible_pos)];
		throw 'DeadEnd';
	},
	// insert the word within input attempt times.
	insertWord(word, attempts) {
		// No enough cubes for word
		if(this.visited.reduce((total, e) => total + (e ? 1 : 0), word.length) > this.SIZE * this.SIZE) throw 'InsertionFailed';

		let t = this.visited.slice(0); // copy of current visited
		let positions = []; // cache the generated random position
		let last_p = null;

		for(let i = 0; i < word.length; i ++){
			try{
				last_p = this.randPositionNear(last_p);
				this.visited[last_p] = true;
				positions.push(last_p);
			} catch(err){
				console.log("Error while inserting word:", err);
				this.visited = t.slice(0); // restore visited if failed.
				if(attempts) return this.insertWord(word, attempts - 1);
				else throw 'InsertionFailed';
			}
		}

		positions.forEach((p, i) => {
			const x = Math.floor(p / this.SIZE), 
					  y =  p - x * this.SIZE;
			this.M[x][y] = word.charAt(i);
		});
	},
	randomChar() { 
		return String.fromCharCode(Math.floor((Math.random() * 26)) + 'A'.charCodeAt(0)); 
 	},
 	generate(size) {
 		if(size) this.SIZE = size;
 		this.clear();
		// based on the matrix dimension, set the limits of words.
		if(this.SIZE < 3)      this.filter_words(3);
		else if(this.SIZE < 6) this.filter_words(5);
		else if(this.SIZE < 9) this.filter_words(6);

		let len = 0;
		while(len <  this.SIZE * this.SIZE / 2){
			const word = words[this.drawFrom(words)];
			console.log(word); // in case of generated words, I don't know.
			this.insertWord(word.toUpperCase(), 3);
			len += word.length;
		}
		this.print_visited();
		this.visited.forEach((generated, p) => {
			if(!generated) {
				const x = Math.floor(p / this.SIZE), 
					    y =  p - x * this.SIZE;
				this.M[x][y] = this.randomChar();
			}
		});
	},
	update(){
		this.visited.forEach(function(generated, p){
			if(!generated) {
				const x = Math.floor(p / this.SIZE), 
					    y =  p - x * this.SIZE;
				this.M[x][y] = this.randomChar();
				this.visited[p] = true;
			}
		});
	},
	// filter words in the data 
	filter_words(max_len, log_to_str){
		words = [];
		words_10000.forEach(function(word){
			if(word.length > 2 && word.length <= max_len) words.push(word);
		});
		var str = "\'" + words.join("\',\n\'") + "\'";
		if(log_to_str) console.log(str);
	},
	// print current visited
	print_visited(){
		var str = "";
		for(var i = 0; i < this.SIZE; i ++){
			for(var j = 0; j < this.SIZE; j ++){
				if(this.visited[i * this.SIZE + j]) str += "1 ";
				else str += "0 ";
			}
			str += "\n";
		}
		console.log(str);
	},
	// print current Matrix
	print_matrix(){
		var str = "";
		for(var i = 0; i < this.SIZE; i ++){
			for(var j = 0; j < this.SIZE; j ++){
				str += this.M[i][j] + " " 
			}
			str += "\n";
		}
		console.log(str);
	}
};


let isDragging       = false,
	gotWord          = false,
	score            = 0,
	selectedWord     = '',
	selectedPostions = [];


const wordPanel = {
	SIZE: 4,
	init(size) {
		if(size) this.SIZE = size;
		wordMatrix.generate(this.SIZE);
		$("#play-panel").html('');
		for (var i = 0; i < this.SIZE; i++) {
			var row = this.newRow(i);
			for (var j = 0; j < this.SIZE; j++) {
				row.append(this.newCube(i, j));
			}
			$("#play-panel").append(row);
		}

		$(document).on('mouseup', function(e){
			if(gotWord) {
				
				$('.cube.active').fadeOut(300, function() {
					const x = $(this).data('x');
					const y = $(this).data('y');
					$(this).remove();
				});

				$('#play-panel .row').each(function(e){
					setTimeout(() => {
						wordPanel.insertCubes($(this))
					}, 400);
				});

				$('#score').text(()=> score + selectedWord.length * 100);
				console.log(selectedWord);
				gotWord = false;
			} else $('#selected-word').removeClass('alert-success');
		  $('.cube.active').removeClass('active');
			isDragging = false;
			selectedWord = "";
			selectedPostions = [];
		});

		return this;
	},

	update(){
		$('.cube').on('mousedown', function(e){
			isDragging = true;
		}).on('mousemove', function(e){
			if(isDragging) {
				if(!$(this).hasClass('active')) {
					selectedWord += $(this).find('.cube-text').text().toLowerCase();
					$("#selected-word").text(selectedWord);
					if(selectedWord.length > 2 && words_10000.includes(selectedWord)) {
						gotWord = true;
					}
				}
				$(this).addClass('active');
			}
		}).on('mouseout', function(e){
			// newCube = true;
		});

		return this;
	},

	insertCubes(parentElement, options) {
		if(parentElement.hasClass('row')){
			for(let j = parentElement.find('.cube').not('.active').length; j < this.SIZE; j ++){
				parentElement.append(this.newCube(parentElement.data('row'), j, true));
			}
		}
	},

	newCube(i, j, randomChar) {
		const cube = $('<span>', { 'class': 'cube' }).attr('data-x', i)
													 .attr('data-y', j)
											         .append($('<span>', { 'class': 'cube-text' })
													 .text(() => randomChar ? wordMatrix.randomChar() : wordMatrix.M[i][j]));
  
		cube.on('mousedown', function(e){
    		isDragging = true;
		}).on('mousemove', function(e){
		  	if(isDragging) {
			  	if(!$(this).hasClass('active')) {
				  	selectedWord += $(this).find('.cube-text').text().toLowerCase();
				  	$("#selected-word").text(selectedWord);
				  	if(selectedWord.length > 2 && words_10000.includes(selectedWord)) {
					  	gotWord = true;
				  	} else {
				      	gotWord = false;
				  	}
			  	}
			  	$(this).addClass('active');
		  	}
		}).on('mouseout', function(e){
		  	// newCube = true;
		})

  		return cube;
	},
	newRow(i){
		return $('<div>', { "class": "row" }).attr('data-row', i);
	}
}
