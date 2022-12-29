"use strict";

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartDOM = document.querySelector(".cart");
const addToCartButtons = document.querySelectorAll(".btn");
if (cart.length > 0) {
  cart.forEach((cartItem) => {
    const product = cartItem;
    insertItemToDOM(product);
    countCartTotal();

    addToCartButtons.forEach((button) => {
      const productDOM = button.parentNode;
      if (
        productDOM.querySelector(".product__name").innerText === product.name
      ) {
        handleActionButtons(button, product);
      }
    });
  });
}

for (const button of addToCartButtons) {
  button.addEventListener("click", () => {
    const productDOM = button.parentNode;
    let product = {
      image: productDOM.querySelector(".product__image").getAttribute("src"),
      name: productDOM.querySelector(".product__name").innerText,
      price: productDOM.querySelector(".product__price").innerText,
      quantity: 1,
    };

    const isInCart =
      cart.filter((cartItem) => cartItem.name === product.name).length > 0;
    if (!isInCart) {
      insertItemToDOM(product);

      cart.push(product);
      saveCart();
      handleActionButtons(button, product);
    }
  });
}

function insertItemToDOM(product) {
  cartDOM.insertAdjacentHTML(
    "beforeend",
    `<div class="cart__item">
     <img class="cart__item__image" src="${product.image}" alt="${
      product.name
    }">
     <h3 class="cart__item__name">${product.name}</h3>
     <h3 class="cart__item__price">${product.price}</h3>
     <button class="btn btn--primary btn--small ${
       product.quantity === 1 ? "btn--danger" : ""
     }" data-action="DECREASE_ITEM">&minus;</button>
     <h3 class="cart__item__quantity">${product.quantity}</h3>
     <button class="btn btn--primary btn--small" data-action="INCREASE_ITEM">&plus;</button>
     <button class="btn btn--danger btn--small" data-action="REMOVE_ITEM">&times;</button>
     </div>`
  );

  addCartFooter();
}

function handleActionButtons(button, product) {
  button.innerText = "In Cart";
  button.disabled = true;
  const cartItemsDOM = cartDOM.querySelectorAll(".cart__item");
  cartItemsDOM.forEach((item) => {
    if (item.querySelector(".cart__item__name").innerText === product.name) {
      item
        .querySelector('[data-action="INCREASE_ITEM"]')
        .addEventListener("click", () => {
          increaseItem(product, item);
        });

      item
        .querySelector('[data-action="DECREASE_ITEM"]')
        .addEventListener("click", () => {
          decreaseItem(product, item, button);
        });

      item
        .querySelector('[data-action="REMOVE_ITEM"]')
        .addEventListener("click", () => {
          removeItem(product, item, button);
        });
    }
  });
}

function increaseItem(product, item) {
  cart.forEach((cartItem) => {
    if (cartItem.name === product.name) {
      item.querySelector(".cart__item__quantity").innerText =
        ++cartItem.quantity;
      item
        .querySelector('[data-action="DECREASE_ITEM"]')
        .classList.remove("btn--danger");
      saveCart();
    }
  });
}

function decreaseItem(product, item, button) {
  cart.forEach((cartItem) => {
    if (cartItem.name === product.name) {
      if (cartItem.quantity > 1) {
        item.querySelector(".cart__item__quantity").innerText =
          --cartItem.quantity;
        saveCart();
      } else {
        removeItem(product, item, button);
      }
      if (cartItem.quantity === 1) {
        item
          .querySelector('[data-action="DECREASE_ITEM"]')
          .classList.add("btn--danger");
      }
    }
  });
}

function removeItem(product, item, button) {
  item.classList.add("cart__item--removed");
  setTimeout(() => {
    item.remove();
  }, 300);

  cart = cart.filter((cartItem) => cartItem.name !== product.name);
  saveCart();
  button.innerText = "Add To Cart";
  button.disabled = false;

  if (cart.length < 1) {
    document.querySelector(".cart-footer").remove();
  }
}

function addCartFooter() {
  if (!document.querySelector(".cart-footer")) {
    cartDOM.insertAdjacentHTML(
      "afterend",
      `<div class="cart-footer">
<button class="btn btn--danger" data-action="CLEAR_CART">Clear Cart</button>
<button class="btn btn--primary" data-action="CHEAKOUT">Pay</button>
</div>`
    );

    document
      .querySelector('[data-action="CLEAR_CART"]')
      .addEventListener("click", () => clearCart());
  }
  document
    .querySelector('[data-action="CHEAKOUT"]')
    .addEventListener("click", () => Cheakout());
}

function clearCart() {
  cartDOM.querySelectorAll(".cart__item").forEach((item) => {
    item.classList.add("cart__item--removed");
    setTimeout(() => {
      item.remove();
    }, 300);
  });

  cart = [];
  localStorage.removeItem("cart");
  document.querySelector(".cart-footer").remove();
  addToCartButtons.forEach((button) => {
    button.innerText = "Add To Cart";
    button.disabled = false;
  });
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  countCartTotal();
}

function countCartTotal() {
  let cartTotal = 0;
  cart.forEach((item) => {
    cartTotal += item.quantity * item.price;
  });
  document.querySelector(
    '[data-action="CHEAKOUT"]'
  ).innerText = `Pay $${cartTotal}`;
}

function Cheakout() {
  let paypalForm = `<form id="paypal-form" action="https://www.paypal.com/cgi-bin/webscr" method="post">
  <input type="hidden" name="cmd" value="_cart">
  <input type="hidden" name="upload" value="1">
  <input type="hidden" name="business" value="daudarslan869@gmail.com">`;
  cart.forEach((item, index) => {
    ++index;
    paypalForm += `
    <input type="hidden" name="item_name_${index}" value="${item.name}">
    <input type="hidden" name="amount_${index}"" value="${item.price}">
    <input type="hidden" name="quantity_${index}"" value="${item.quantity}">
  `;
  });

  paypalForm += `<input type="submit" value="PayPal">
  <div class="overlay"></div>
  </form>`;

  document.querySelector("body").insertAdjacentHTML("beforeend", paypalForm);
  document.getElementById("paypal-form").submit();
}
