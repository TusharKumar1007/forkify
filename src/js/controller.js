import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { MODAL_CLOSE_SEC } from '../../../final/src/js/config.js';
import * as model from './model.js';
import recipeView from './views/recipeview.js';
import SearchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import PaginationView from './views/paginationView.js';
import { updateServings } from './model.js';

// if (module.hot) {
//   module.hot.accept();
// }

const constrolRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) return;
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultPage());
    bookmarksView.update(model.state.bookmarks);

    //loading recipe
    await model.loadRecipe(id);

    //rendring recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    // console.log(err);

    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    
    const query = SearchView.getQuery();
    if (!query) return;
    resultsView.renderSpinner();
    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultPage());

    PaginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
  resultsView.render(model.getSearchResultPage(gotoPage));

  PaginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  console.log(model.state.recipe);
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};
const controlAddRecipe = async function (newRecipe) {
  try {
    // addRecipeView.renderSpinner();
    await model.uploadRecipe(newRecipe);
    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();
    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null,'',`#${model.state.recipe.id}`)

    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(constrolRecipes);
  recipeView.addHandlerUpadateServings(controlServings);
  recipeView.addhandlerAddBookmark(controlAddBookmark);
  SearchView.addHandlerSearch(controlSearchResults);
  PaginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
