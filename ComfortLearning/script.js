const cart = document.querySelector("nav .cart");
const cartSideBar = document.querySelector(".cart-sidebar");
const closeCart = document.querySelector(".close-cart");
const burger = document.querySelector(".burger");

const menuSidebar = document.querySelector(".menu-sidebar");
const closeMenu = document.querySelector(".close-menu");

const cartItemsTotal = document.querySelector(".noi");
const cartPriceTotal = document.querySelector(".total-amount");
const clearBtn = document.querySelector(".clear-cart-btn");
const proceedBtn=document.querySelector(".proceed-btn")
const cartContent = document.querySelector(".cart-content");

let Cart = [];
let buttonsDOM = [];

// CART OPEN
cart.addEventListener("click", () => {
    cartSideBar.style.transform = "translateX(0%)";
});

// CART CLOSE
closeCart.addEventListener("click", () => {
    cartSideBar.style.transform = "translateX(100%)";
});

// MENU OPEN
burger.addEventListener("click", () => {
    menuSidebar.style.transform = "translateX(0%)";
});

// MENU CLOSE
closeMenu.addEventListener("click", () => {
    menuSidebar.style.transform = "translateX(-100%)";
});

class Product {
    async getProduct() {
        const response = await fetch("products.json");
        const data = await response.json();

        let products = data.items;

        products = products.map(item => {
            const { title, price } = item.fields;
            const id = item.sys.id;
            const image = item.fields.image.fields.file.url;

            return {
                id,
                title,
                price,
                image
            };
        });

        return products;
    }
}

class UI {

    displayProducts(products) {

        products.forEach(product => {

            const productDiv = document.createElement("div");

            productDiv.innerHTML = `
            <div class="product-card">

                <img src="${product.image}" alt="${product.title}">

                <span class="add-to-cart" data-id="${product.id}">
                    <i class="fa fa-cart-plus fa-1x"></i>
                </span>

                <div class="product-name">${product.title}</div>

                <div class="product-pricing">
                    ₹${product.price}
                </div>

            </div>
            `;

            document.querySelector(".product").appendChild(productDiv);
        });
    }

    getButtons() {

        const buttons = [...document.querySelectorAll(".add-to-cart")];

        buttonsDOM = buttons;

        buttons.forEach(button => {

            let id = button.dataset.id;

            let inCart = Cart.find(item => item.id === id);

            if (inCart) {
                button.innerHTML = "In Cart";
                button.style.pointerEvents = "none";
            }

            button.addEventListener("click", e => {

                e.currentTarget.innerHTML = "In Cart";
                e.currentTarget.style.pointerEvents = "none";

                let cartItem = {
                    ...Storage.getStorageProducts(id),
                    amount: 1
                };

                Cart.push(cartItem);

                Storage.saveCart(Cart);

                this.setCartValues(Cart);

                this.addCartItem(cartItem);
            });
        });
    }

    setCartValues(cart) {

        let tempTotal = 0;
        let itemsTotal = 0;

        cart.forEach(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });

        cartItemsTotal.textContent = itemsTotal;
        cartPriceTotal.textContent = tempTotal.toFixed(2);
    }

    addCartItem(cartItem) {

        const div = document.createElement("div");

        div.innerHTML = `
        <div class="cart-product">

            <div class="product-image">
                <img src="${cartItem.image}" alt="${cartItem.title}">
            </div>

            <div class="cart-product-content">

                <div class="cart-product-name">
                    <h3>${cartItem.title}</h3>
                </div>

                <div class="cart-product-price">
                    ₹${cartItem.price}
                </div>

                <a href="#"
                   class="cart-product-remove"
                   data-id="${cartItem.id}"
                   style="color:red;">
                   Remove
                </a>

            </div>

            <div class="plus-minus">

                <i class="fa fa-angle-left add-amount"
                   data-id="${cartItem.id}">
                </i>

                <span class="no-of-items">
                    ${cartItem.amount}
                </span>

                <i class="fa fa-angle-right reduce-amount"
                   data-id="${cartItem.id}">
                </i>

            </div>

        </div>
        `;

        cartContent.appendChild(div);
    }

    setupApp() {

        Cart = Storage.getCart();

        this.setCartValues(Cart);

        Cart.forEach(item => {
            this.addCartItem(item);
        });
    }

    cartLogic() {

        if (clearBtn) {
            clearBtn.addEventListener("click", () => {
                this.clearCart();
            });
        }

        cartContent.addEventListener("click", event => {

            // REMOVE ITEM
            if (event.target.classList.contains("cart-product-remove")) {

                event.preventDefault();

                let id = event.target.dataset.id;

                this.removeItem(id);

                event.target.closest(".cart-product").remove();
            }

            // INCREASE
            if (event.target.classList.contains("add-amount")) {

                let id = event.target.dataset.id;

                let item = Cart.find(item => item.id === id);

                item.amount++;

                Storage.saveCart(Cart);

                this.setCartValues(Cart);

                event.target.nextElementSibling.textContent = item.amount;
            }

            // DECREASE
            if (event.target.classList.contains("reduce-amount")) {

                let id = event.target.dataset.id;

                let item = Cart.find(item => item.id === id);

                item.amount--;

                if (item.amount > 0) {

                    Storage.saveCart(Cart);

                    this.setCartValues(Cart);

                    event.target.previousElementSibling.textContent = item.amount;

                } else {

                    this.removeItem(id);

                    event.target.closest(".cart-product").remove();
                }
            }
        });
    }

    clearCart() {

        let cartItems = Cart.map(item => item.id);

        cartItems.forEach(id => this.removeItem(id));

        cartContent.innerHTML = "";

        Cart = [];

        this.setCartValues(Cart);

        Storage.saveCart(Cart);
    }

    removeItem(id) {

        Cart = Cart.filter(item => item.id !== id);

        this.setCartValues(Cart);

        Storage.saveCart(Cart);

        const button = this.getSingleButton(id);

        if (button) {
            button.innerHTML = `<i class="fa fa-cart-plus"></i>`;
            button.style.pointerEvents = "auto";
        }
    }

    getSingleButton(id) {

        let button = null;

        buttonsDOM.forEach(btn => {
            if (btn.dataset.id === id) {
                button = btn;
            }
        });

        return button;
    }
}

class Storage {

    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    }

    static getStorageProducts(id) {

        let products =
            JSON.parse(localStorage.getItem("products"));

        return products.find(item => item.id === id);
    }

    static saveCart(cart) {
        localStorage.setItem("Cart", JSON.stringify(cart));
    }

    static getCart() {
        return localStorage.getItem("Cart")
            ? JSON.parse(localStorage.getItem("Cart"))
            : [];
    }
}

document.addEventListener("DOMContentLoaded", () => {

    const products = new Product();
    const ui = new UI();

    ui.setupApp();

    products.getProduct()
        .then(products => {

            ui.displayProducts(products);

            Storage.saveProducts(products);
        })
        .then(() => {

            ui.getButtons();

            ui.cartLogic();

            
        });
});