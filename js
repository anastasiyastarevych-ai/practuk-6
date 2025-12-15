const itemsList = document.getElementById("items-list");
const cartBtn = document.getElementById("cart-btn");
const cartViewWrapper = document.getElementById("cart-view-wrapper");
const cartClose = document.getElementById("cart-view-close");
const cartBlur = document.getElementById("cart-blur");
const cartItemsContainer = document.getElementById("cart-items");
const cartCounter = document.getElementById("cart-counter");
const cartTotal = document.getElementById("cart-total");

const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const ratingFilter = document.getElementById("rating-filter");
const priceMin = document.getElementById("price-min");
const priceMax = document.getElementById("price-max");
const extraOptions = document.getElementById("extra-options");
const applyFiltersBtn = document.getElementById("apply-filters");

let cart = JSON.parse(localStorage.getItem("cart")) || {};

function updateCartView() {
    cartItemsContainer.innerHTML = "";
    let total = 0;
    let count = 0;

    Object.values(cart).forEach(item => {
        total += item.price * item.qty;
        count += item.qty;

        const div = document.createElement("div");
        div.className = "cart-item";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.padding = "10px";
        div.style.background = "#fff";
        div.style.borderRadius = "10px";

        div.innerHTML = `
            <div>
                <img 
                src="${item.image}" 
                alt="${item.title}"
                style="
                    width:166px;        
                    height:210px;       
                    object-fit:cover;   
                    border-radius:17px;  
                    margin-top:-95%;
                    margin-left:32%;
                "
                >
                <div><b>${item.title}</b></div>
                <div>Price: ${item.price}$</div>
                <div>Available: ${item.available}</div>
            </div>

            <div style="display:flex;align-items:center;gap:10px">
                <button class="minus" data-id="${item.id}">-</button>
                <span>${item.qty}</span>
                <button class="plus" data-id="${item.id}">+</button>
                <button class="remove" data-id="${item.id}" style="color:red">x</button>
            </div>
        `;

        cartItemsContainer.appendChild(div);
    });

    cartCounter.textContent = count;
    cartTotal.textContent = total.toFixed(2);

    cartCounter.classList.toggle("hide", count === 0);

    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(itemEl) {
    const id = itemEl.dataset.id;
    const price = Number(itemEl.dataset.price);
    const available = Number(itemEl.dataset.available);

    if (!cart[id]) {
        cart[id] = {
            id,
            title: itemEl.querySelector(".item-title").textContent,
            price,
            qty: 1,
            available: available - 1,
            image: itemEl.querySelector(".item-image").src
        };

    } else {
        if (cart[id].available <= 0) return;
        cart[id].qty++;
        cart[id].available--;
    }

    if (cart[id].available <= 0) {
        itemEl.querySelector(".item-add").classList.add("disabled");
    }

    updateCartView();
}

cartItemsContainer.addEventListener("click", e => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("plus")) {
        if (cart[id].available > 0) {
            cart[id].qty++;
            cart[id].available--;
        }
    }
    if (e.target.classList.contains("minus")) {
        cart[id].qty--;
        cart[id].available++;
        if (cart[id].qty === 0) delete cart[id];
    }
    if (e.target.classList.contains("remove")) {
        delete cart[id];
    }

    enableButtonsAccordingToAvailable();
    updateCartView();
});

function enableButtonsAccordingToAvailable() {
    document.querySelectorAll(".item").forEach(item => {
        const id = item.dataset.id;
        const btn = item.querySelector(".item-add");
        if (!cart[id] || cart[id].available > 0) {
            btn.classList.remove("disabled");
        } else {
            btn.classList.add("disabled");
        }
    });
}

enableButtonsAccordingToAvailable();
updateCartView();

function applyFilters() {
    const search = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    const rating = Number(ratingFilter.value);
    const minPrice = Number(priceMin.value) || 0;
    const maxPrice = Number(priceMax.value) || Infinity;

    const extra = [...extraOptions.querySelectorAll("input:checked")]
        .map(ch => ch.value);

    document.querySelectorAll(".item").forEach(item => {
        const title = item.querySelector(".item-title").textContent.toLowerCase();
        const itemCategory = item.dataset.category;
        const itemRating = Number(item.dataset.rating);
        const itemPrice = Number(item.dataset.price);

        let show = true;

        if (!title.includes(search)) show = false;
        if (category !== "all" && itemCategory !== category) show = false;
        if (itemRating < rating) show = false;
        if (itemPrice < minPrice || itemPrice > maxPrice) show = false;

        extra.forEach(option => {
            if (!item.dataset[option]) show = false;
        });

        item.classList.toggle("hide", !show);
    });
}

applyFiltersBtn.addEventListener("click", applyFilters);

cartBtn.onclick = () => {
    cartViewWrapper.classList.remove("hide");
};
cartClose.onclick = () => {
    cartViewWrapper.classList.add("hide");
};
cartBlur.onclick = () => {
    cartViewWrapper.classList.add("hide");
};

document.querySelectorAll(".item-add").forEach(btn => {
    btn.addEventListener("click", e => {
        const item = e.target.closest(".item");
        addToCart(item);
    });
});
