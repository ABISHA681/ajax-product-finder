
"use strict";

// Project 2a: AJAX Product Finder
// Data source: https://fakestoreapi.com/products
// Native JavaScript only - no external libraries.

// API endpoint
const API_URL = "https://fakestoreapi.com/products";

// Store the products received from the API.
let allProducts = [];

// Select the HTML elements we need.
const productGrid = document.querySelector("#productGrid");
const productCount = document.querySelector("#productCount");
const statusMessage = document.querySelector("#statusMessage");
const searchInput = document.querySelector("#searchInput");
const categorySelect = document.querySelector("#categorySelect");
const sortSelect = document.querySelector("#sortSelect");
const resetButton = document.querySelector("#resetButton");
const productDialog = document.querySelector("#productDialog");
const dialogContent = document.querySelector("#dialogContent");
const closeDialog = document.querySelector("#closeDialog");

// Format prices in US dollars.
function formatPrice(price) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(price);
}

// AJAX request: fetch live product data from the server.
async function fetchProducts() {
  statusMessage.textContent = "Loading products...";
  productCount.textContent = "Loading...";
  productGrid.replaceChildren();

  try {
    const response = await fetch(API_URL);

    // Check whether the HTTP request was successful.
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    // Convert the JSON response into JavaScript data.
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("Unexpected API response.");
    }

    // Save the returned products in our variable.
    allProducts = data;
    statusMessage.textContent = "";

    // Create category options and show products.
    populateCategories();
    applyFilters();

  } catch (error) {
    console.error("Failed to fetch products:", error);
    statusMessage.textContent =
      "Could not load products. Check your connection and try again.";
    productCount.textContent = "0 products";
    showRetryButton();
  }
}

// Create category dropdown options from the API data.
function populateCategories() {
  const categories = [...new Set(
    allProducts.map(product => product.category)
  )].sort();

  // Remove old options except "All Categories".
  categorySelect.replaceChildren(
    new Option("All Categories", "all")
  );

  categories.forEach(category => {
    const option = new Option(category, category);
    categorySelect.appendChild(option);
  });
}

// Search, filter and sort the available products.
function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categorySelect.value;
  const selectedSort = sortSelect.value;

  // Filter by product title and category.
  let filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Sort a new array so original API data stays unchanged.
  filteredProducts = [...filteredProducts];

  if (selectedSort === "low") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (selectedSort === "high") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (selectedSort === "rating") {
    filteredProducts.sort(
      (a, b) => (b.rating?.rate ?? 0) - (a.rating?.rate ?? 0)
    );
  }

  displayProducts(filteredProducts);
}

// Create one HTML product card using DOM methods.
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.image;
  image.alt = product.title;
  image.loading = "lazy";

  const category = document.createElement("span");
  category.className = "category";
  category.textContent = product.category;

  const title = document.createElement("h3");
  title.className = "product-title";
  title.textContent = product.title;

  const rating = document.createElement("p");
  rating.className = "rating";
  rating.textContent =
    `⭐ ${product.rating?.rate ?? "N/A"} / 5`;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(product.price);

  const button = document.createElement("button");
  button.className = "details-button";
  button.type = "button";
  button.textContent = "View Details";

  // Dynamically attach an event handler to this button.
  button.addEventListener("click", () => {
    showProductDetails(product);
  });

  card.append(
    image, category, title, rating, price, button
  );

  return card;
}

// Display the filtered products on the page.
function displayProducts(products) {
  productGrid.replaceChildren();

  productCount.textContent =
    `${products.length} product(s) found`;

  if (products.length === 0) {
    statusMessage.textContent =
      "No matching products. Try another search.";
    return;
  }

  statusMessage.textContent = "";

  // Build product cards using a DocumentFragment.
  const fragment = document.createDocumentFragment();

  products.forEach(product => {
    fragment.appendChild(createProductCard(product));
  });

  productGrid.appendChild(fragment);
}

// Open a dialog with additional product information.
function showProductDetails(product) {
  dialogContent.replaceChildren();

  const image = document.createElement("img");
  image.className = "dialog-image";
  image.src = product.image;
  image.alt = product.title;

  const title = document.createElement("h2");
  title.textContent = product.title;

  const category = document.createElement("p");
  category.textContent = `Category: ${product.category}`;

  const description = document.createElement("p");
  description.textContent = product.description;

  const price = document.createElement("p");
  price.className = "price";
  price.textContent = formatPrice(product.price);

  const rating = document.createElement("p");
  rating.textContent =
    `Rating: ${product.rating?.rate ?? "N/A"} / 5`;

  dialogContent.append(
    image, title, category, description, price, rating
  );

  productDialog.showModal();
}

// Show a retry button if the API request fails.
function showRetryButton() {
  const retryButton = document.createElement("button");
  retryButton.className = "details-button";
  retryButton.textContent = "Try Again";

  retryButton.addEventListener("click", fetchProducts);
  productGrid.appendChild(retryButton);
}

// Register all event handlers dynamically.
searchInput.addEventListener("input", applyFilters);
categorySelect.addEventListener("change", applyFilters);
sortSelect.addEventListener("change", applyFilters);

// Reset search, category and sorting controls.
resetButton.addEventListener("click", () => {
  searchInput.value = "";
  categorySelect.value = "all";
  sortSelect.value = "default";
  applyFilters();
});

// Close the details popup.
closeDialog.addEventListener("click", () => {
  productDialog.close();
});

// Start the AJAX request after the page has loaded.
// The script uses "defer", so HTML elements already exist.
fetchProducts();
