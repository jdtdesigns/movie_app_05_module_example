const $addBtn = $('#add-btn');
const $watchListOutput = $('.watch-list');
const $watchedOutput = $('.watched');

function generateRandomNumber() {
  const min = Math.pow(10, 14); // Minimum 15-digit number
  const max = Math.pow(10, 15) - 1; // Maximum 15-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMovieData() {
  const rawMovieData = localStorage.getItem('movies');
  const movies = JSON.parse(rawMovieData) || [];

  return movies;
}

function setupDragging() {
  $('.box').droppable({
    accept: 'article',
    drop: handleMovieDrop
  });

  $('article').draggable({
    opacity: 0.75,
    zIndex: 500,
    helper: function (eventObj) {
      const el = $(eventObj.target);
      let clone;

      if (el.is('article')) {
        clone = el.clone();
      } else {
        clone = el.closest('article').clone();
      }

      clone.css('width', el.outerWidth());

      return clone;
    }
  });
}

function outputMovies() {
  const movies = getMovieData();

  $watchListOutput.empty();
  $watchedOutput.empty();

  movies.forEach(function (movieObj) {
    const $movieEl = $(`
      <article data-id="${movieObj.id}" class="bg-white border border-dark-subtle p-3 my-2">
        <h5>${movieObj.title}</h5>
        <p>Release Date: ${movieObj.releaseDate}</p>
        <p>Watch Deadline: ${movieObj.deadline}</p>
        <button class="btn bg-danger text-light">Delete</button>
      </article>
    `);
    const deadline = dayjs(movieObj.deadline);
    const currentDate = dayjs();

    if (deadline.isSame(currentDate, 'day')) {
      $movieEl.addClass('alert');
    }

    if (movieObj.watched) {
      $watchedOutput.append($movieEl);
      $movieEl.addClass('watched');
    } else {
      $watchListOutput.append($movieEl);
      $movieEl.removeClass('watched');
    }
  })

  setupDragging();
}

function addMovie() {
  // Grab the input elements
  const $titleInput = $('#title-input');
  const $releaseInput = $('#release-date-input');
  const $deadlineInput = $('#deadline-input');

  // Generate a random id for the movie
  const id = generateRandomNumber();

  // Create an object with the input values
  const movie = {
    id: id,
    title: $titleInput.val(),
    releaseDate: $releaseInput.val(),
    deadline: $deadlineInput.val(),
    watched: false
  };

  // Get the old localStorage array of movies or a new array
  const movies = getMovieData();

  // Push the object the array of movies
  movies.push(movie);

  // Save/Replace the old array in localStorage with the newly updated array
  localStorage.setItem('movies', JSON.stringify(movies));

  $titleInput.val('');
  $releaseInput.val('');
  $deadlineInput.val('');

  $('#movieModal').modal('hide');

  outputMovies();
}

function handleMovieDrop(eventObj, ui) {
  const box = $(eventObj.target);
  const article = $(ui.draggable[0]);
  const movieId = article.data('id');

  const movies = getMovieData();

  const movie = movies.find(function (movieObj) {
    if (movieObj.id === movieId) return true;
  });

  if (box.hasClass('watched')) {
    movie.watched = true;
    article.addClass('watched');
  } else {
    movie.watched = false;
    article.removeClass('watched');
  }

  localStorage.setItem('movies', JSON.stringify(movies));

  box.append(article);
}

function deleteMovie(eventObj) {
  const btn = $(eventObj.target);
  const movieId = btn.parent('article').data('id');

  const movies = getMovieData();

  const filtered = movies.filter(function (movieObj) {
    if (movieObj.id !== movieId) return true;
  });

  localStorage.setItem('movies', JSON.stringify(filtered));

  btn.parent('article').remove();
}

function init() {
  $('#deadline-input').datepicker({
    minDate: 0
  });

  outputMovies();

  $('main').on('click', 'button.bg-danger', deleteMovie);

  $addBtn.on('click', addMovie);
}

init();