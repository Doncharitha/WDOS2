let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const currentPage = window.location.pathname.split('/').pop();
    let jsonFile = '';

    switch (currentPage) {
        case 'fruits.html':
            jsonFile = 'fruits.json';
            break;
        case 'veg.html':
            jsonFile = 'veg.json';
            break;
        case 'MeatnSeafood.html':
            jsonFile = 'meat.json';
            break;
        case 'Baking&cooking.html':
            jsonFile = 'ingredients.json';
            break;
        case 'dairy.html':
            jsonFile = 'dairy.json';
            break;
        case 'orderpage.html':
            updateOrderTable();
            break;
        default:
            console.error('Unknown page');
            return;
    }

    if (jsonFile) {
        fetch(jsonFile)
            .then(response => response.json())
            .then(products => {
                displayProducts(products);
                initializeCartButtons();
            })
            .catch(error => console.error('Error fetching products:', error));
    }

    updateCartIcon();

    const buyNowBtn = document.getElementById("buyNowBtn");
    if (buyNowBtn) {
        buyNowBtn.addEventListener("click", () => {
            window.location.href = "checkout.html";
        });
    }

    const addToFavouritesBtn = document.getElementById("addToFavouritesBtn");
    if (addToFavouritesBtn) {
        addToFavouritesBtn.addEventListener("click", () => {
            localStorage.setItem("favouriteOrder", JSON.stringify({ items: cart }));
            alert("Order saved to favourites!");
        });
    }

    const applyFavouritesBtn = document.getElementById("applyFavouritesBtn");
    if (applyFavouritesBtn) {
        applyFavouritesBtn.addEventListener("click", () => {
            const favouriteOrder = JSON.parse(localStorage.getItem("favouriteOrder"));
            if (favouriteOrder) {
                cart = favouriteOrder.items;
                localStorage.setItem('cart', JSON.stringify(cart));
                updateOrderTable();
                updateCartIcon();
            } else {
                alert("No favourite order found!");
            }
        });
    }
});

function displayProducts(products) {
    const productContainer = document.getElementById('product-container');
    products.forEach(product => {
        const productBox = document.createElement('div');
        productBox.classList.add('product-box');
        productBox.setAttribute('data-product-id', product.id);

        let productHTML = `
            <img alt="${product.name}" src="${product.image}">
            <strong>${product.name}</strong>
        `;

        // Check if the product has quantity options (e.g., for meat, vegetables)
        if (product.options) {
            const quantityOptions = product.options.map(option => 
                `<option value="${option.multiplier}">${option.label}</option>`).join('');

            productHTML += `
                <select class="quantity-select">
                    ${quantityOptions}
                </select>
                <h4>Rs.${product.pricePerKg.toFixed(2)} per Kg</h4>
            `;
        } else {
            // For products with fixed quantity (e.g., ingredients)
            productHTML += `
                <h4>Rs.${product.price.toFixed(2)} per ${product.unit}</h4>
                <input type="hidden" class="quantity-select" value="1"> <!-- Default multiplier for unit-based products -->
            `;
        }

        productHTML += `<a href="#" class="cart-btn"><i class="fas fa-shopping-bag"></i> Add to Cart</a>`;
        
        productBox.innerHTML = productHTML;
        productContainer.appendChild(productBox);
    });

    initializeCartButtons();
}

function initializeCartButtons() {
    const addToCartButtons = document.querySelectorAll('.cart-btn');
    addToCartButtons.forEach(button => {
        button.removeEventListener('click', addToCartHandler);
        button.addEventListener('click', addToCartHandler);
    });
}

function addToCartHandler(event) {
    event.preventDefault();
    const productBox = event.target.closest('.product-box');
    const productId = productBox.getAttribute('data-product-id');
    addToCart(productId, event.target);
}

function addToCart(productId, button) {
    const productBox = document.querySelector(`.product-box[data-product-id="${productId}"]`);
    const productName = productBox.querySelector('strong').innerText;
    const quantitySelect = productBox.querySelector('.quantity-select');
    const quantityMultiplier = parseFloat(quantitySelect.value);

    // Determine if it's a per Kg item or unit-based item
    const priceElement = productBox.querySelector('h4').innerText;
    let pricePerUnit = parseFloat(priceElement.replace(/Rs.| per Kg| per .+/g, '').trim());
    let unit = 'Kg';

    if (!productBox.querySelector('select')) {
        // Unit-based item (e.g., ingredients)
        pricePerUnit = parseFloat(productBox.querySelector('h4').innerText.replace(/Rs.| per .+/g, '').trim());
        unit = productBox.querySelector('h4').innerText.split(' ')[2];
    }

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantityMultiplier;
        existingItem.price += pricePerUnit * quantityMultiplier;
    } else {
        cart.push({ id: productId, name: productName, price: pricePerUnit * quantityMultiplier, quantity: quantityMultiplier, unit: unit });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();

    button.classList.add('clicked');
    button.textContent = 'Added to Cart';
}

function updateOrderTable() {
    const orderTableBody = document.querySelector('#order-table tbody');
    if (!orderTableBody) return;
    orderTableBody.innerHTML = '';

    cart.forEach((item, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>
                <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${index}, this.value)">
                ${item.unit}
            </td>
            <td>Rs.${(item.price / item.quantity).toFixed(2)} per ${item.unit}</td>
            <td>Rs.${item.price.toFixed(2)}</td>
            <td><button onclick="removeFromCart(${index})">Remove</button></td>
        `;
        orderTableBody.appendChild(row);
    });

    updateTotalPrice();
}

function changeQuantity(index, quantity) {
    const item = cart[index];
    const originalPricePerUnit = item.price / item.quantity;
    cart[index].quantity = parseFloat(quantity);
    cart[index].price = originalPricePerUnit * cart[index].quantity;

    if (cart[index].quantity === 1) {
        cart[index].unit = "Kg";
    } else if (cart[index].quantity === 0.5) {
        cart[index].unit = "500g";
    } else if (cart[index].quantity === 0.25) {
        cart[index].unit = "250g";
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateOrderTable();
}

function updateTotalPrice() {
    const totalPriceElement = document.querySelector('#total-price');
    const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
    if (totalPriceElement) {
        totalPriceElement.innerText = `Total Price: Rs.${totalPrice.toFixed(2)}`;
    }
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateOrderTable();
    updateCartIcon();
}

function updateCartIcon() {
    const cartIcon = document.querySelector('.right-nav .cart .fas.fa-shopping-cart');
    if (cartIcon) {
        const totalItems = cart.length;
        cartIcon.dataset.count = totalItems;

        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            cartCount.innerText = totalItems;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const sections = [
        { id: 'fruits', jsonFile: 'fruits.json' },
        { id: 'vegetables', jsonFile: 'veg.json' },
        { id: 'dairy', jsonFile: 'dairy.json' },
        { id: 'meat', jsonFile: 'meat.json' },
        { id: 'baking', jsonFile: 'ingredients.json' },
    ];

    sections.forEach(section => {
        const dropdown = document.getElementById(`${section.id}-dropdown`);
        if (dropdown) {
            fetch(section.jsonFile)
                .then(response => response.json())
                .then(products => {
                    products.forEach(product => {
                        const option = document.createElement('option');
                        option.value = product.id;
                        option.textContent = product.name;
                        dropdown.appendChild(option);
                    });
                })
                .catch(error => console.error(`Error fetching ${section.id} products:`, error));
        }
    });

    // Adding event listener for Add to Cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            const section = button.getAttribute('data-section');
            const itemDropdown = document.getElementById(`${section}-dropdown`);
            const quantityDropdown = document.getElementById(`${section}-quantity`);

            if (itemDropdown && quantityDropdown) {
                const productId = itemDropdown.value;
                const productName = itemDropdown.options[itemDropdown.selectedIndex].text;
                const quantity = parseFloat(quantityDropdown.value);

                addToCart(productId, productName, quantity, section);
            }
        });
    });

    function addToCart(productId, productName, quantity, section) {
        const pricePerUnit = getPriceForProduct(section, productId);
        const price = pricePerUnit * quantity;

        const unit = (section === 'dairy' || section === 'baking') ? 'pcs' : 'kg';

        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
            existingItem.price += price;
        } else {
            cart.push({ id: productId, name: productName, price, quantity, unit });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartIcon();
        alert(`${productName} added to cart.`);
    }

    function getPriceForProduct(section, productId) {
        let pricePerUnit = 150;
        return pricePerUnit;
    }

    function updateCartIcon() {
        const cartIcon = document.querySelector('.right-nav .cart .fas.fa-shopping-cart');
        if (cartIcon) {
            const totalItems = cart.length;
            cartIcon.dataset.count = totalItems;

            const cartCount = document.querySelector('.cart-count');
            if (cartCount) {
                cartCount.innerText = totalItems;
            }
        }
    }

    function updateOrderTable() {
        const orderTableBody = document.querySelector('#order-table tbody');
        if (!orderTableBody) return;
        orderTableBody.innerHTML = '';

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td scope="row" data-label="Product">${item.name}</td>
                <td data-label="Quantity">
                    <input type="number" value="${item.quantity}" min="1" onchange="changeQuantity(${index}, this.value)">
                    ${item.unit}
                </td>
                <td data-label="Price">Rs.${(item.price / item.quantity).toFixed(2)}</td>
                <td data-label="Total">Rs.${item.price.toFixed(2)}</td>
                <td data-label="Action"><button onclick="removeFromCart(${index})">Remove</button></td>
            `;
            orderTableBody.appendChild(row);
        });

        updateTotalPrice();
    }

    function changeQuantity(index, quantity) {
        const item = cart[index];
        const pricePerUnit = item.price / item.quantity;

        item.quantity = parseFloat(quantity);
        item.price = pricePerUnit * item.quantity;

        item.unit = (item.unit === 'kg') ? 
            (quantity >= 1 ? 'kg' : 'pcs') : 'pcs';

        localStorage.setItem('cart', JSON.stringify(cart));
        updateOrderTable();
    }

    function updateTotalPrice() {
        const totalPriceElement = document.querySelector('#total-price');
        const totalPrice = cart.reduce((sum, item) => sum + item.price, 0);
        if (totalPriceElement) {
            totalPriceElement.innerText = `Total Price: Rs.${totalPrice.toFixed(2)}`;
        }
    }

    function removeFromCart(index) {
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        updateOrderTable();
        updateCartIcon();
    }

    // Initialize cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartIcon();
    updateOrderTable();
});
