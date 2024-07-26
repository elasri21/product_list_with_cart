async function getData() {
    const res = await fetch("./data.json");
    const data = await res.json();
    return data;
  }
  const data = await getData();
  const names = [];
  const categories = [];
  const prices = [];
  const thumbnails = [];
  const desktopImages = [];
  const tabletImages = [];
  const mobileImages = [];
  const cartList = [];
  
  const numItems = document.querySelector(".num-items");
  
  function getAllItems() {
    let items = 0;
    cartList.forEach((item) => (items += item.quantity));
    numItems.textContent = cartList.length > 0 ? items : 0;
  }
  
  data.forEach((element) => {
    names.push(element["name"]);
    categories.push(element["category"]);
    prices.push(element["price"]);
    thumbnails.push(element["image"]["thumbnail"]);
    desktopImages.push(element["image"]["desktop"]);
    tabletImages.push(element["image"]["tablet"]);
    mobileImages.push(element["image"]["mobile"]);
  });
  
  function generateSource(index) {
    if (window.matchMedia("(min-width: 1200px)").matches) {
      return desktopImages[index];
    } else if (
      window.matchMedia("(min-width: 768px)").matches &&
      window.matchMedia("(max-width: 1199px)").matches
    ) {
      return tabletImages[index];
    } else {
      return mobileImages[index];
    }
  }
  
  // add main menu
  const contents = document.querySelector(".contents");
  for (let i = 0; i < categories.length; i++) {
    let content = document.createElement("div");
    content.classList.add("content");
    content.innerHTML = `
          <div class="image">
              <img src="${generateSource(i)}" alt="">
              <button data-thumb="${i}" data-name="${names[i]}">
                <i class="fa-solid fa-cart-plus"></i>
                <span>add to cart</span>
              </button>
          </div>
          <p class="category">${categories[i]}</p>
          <h2 class="name">${names[i]}</h2>
          <p class="price">$<span>${prices[i]}</span></p>
      `;
    contents.appendChild(content);
  }
  
  window.addEventListener("resize", function () {
    const images = document.querySelectorAll(".image img");
    for (let j = 0; j < images.length; j++) {
      images[j].src = generateSource(j);
    }
  });
  
  function updateCartUI() {
    if (cartList.length > 0) {
      cart.textContent = "";
    } else {
      cart.innerHTML = `
              <div class="empty-cart">
            <img class="empty-img" src="./assets/images/illustration-empty-cart.svg" alt="">
            <p>Your added items will appear here</p>
          </div>`;
      if (cartList.length == 0) {
        addBtns.forEach((btn, j) => {
          btn.innerHTML = `
              <i class="fa-solid fa-cart-plus"></i>
              <span>add to cart</span>`;
        });
      }
      return;
    }
    cartList.forEach((it, index) => {
      let item = document.createElement("div");
      item.classList.add("item");
      item.innerHTML = `
            <div class="product-info">
              <h3 class="name">${it.name}</h3>
              <div class="num-items">
                <div class="quantity"><span>${it.quantity}</span>x</div>
                <div class="price-box">
                  <span class="single-item-price">@$<span>${
                    it.price
                  }</span></span>
                  <span class="total-price">$<span>${
                    it.quantity * parseFloat(it.price).toFixed(2)
                  }</span></span>
                </div>
              </div>
            </div>
            <button class="remove-item" data-name="${
              it.name
            }" data-index="${index}">
              <i class="fa-solid fa-times"></i>
            </button>
          </div>
      `;
  
      if (!document.querySelector(".items .total-amount")) {
        let totalContent = document.createElement("div");
        totalContent.classList.add("total-amount");
        totalContent.innerHTML = `
              <div class="total">
                <span>order total</span>
                <span class="bold">$<span class="total-to-pay bold">${updateAllPrice()}</span></span>
              </div>
              <div class="tree">
                <img src="./assets/images/icon-carbon-neutral.svg" alt="">
                <span>this is a <span class="bold">carbon-neutral</span> delivery</span>
              </div>
              <div class="confirm-btn">
                <button>confirm order</button>
              </div>
        `;
        cart.appendChild(item);
        cart.appendChild(totalContent);
      } else {
        cart.insertBefore(item, document.querySelector(".items .total-amount"));
        document.querySelector(".total-to-pay.bold").textContent =
          updateAllPrice();
      }
      let removeBtn = document.querySelectorAll(".remove-item");
      removeBtn.forEach((btn) =>
        btn.addEventListener("click", function () {
          let itemName = this.dataset.name;
          let index;
          for (let item of cartList) {
            if (item.name == itemName) {
              index = cartList.indexOf(item);
              removeFromCart(index);
              return;
            }
          }
        })
      );
    });
  
    const confirmBtn = document.querySelector(".confirm-btn");
    confirmBtn.addEventListener("click", function () {
      confirmOrders();
      document.querySelector(".confirm-window button").addEventListener("click", function () {
        window.location.reload();
      })
    });
  }
  
  function addToCart(category, name, price) {
    const existingItem = cartList.find((item) => item.name == name);
    if (existingItem) {
      // existingItem.quantity++;
      return;
    } else {
      cartList.push({ category, name, price, quantity: 1 });
    }
    getAllItems();
    updateCartUI();
  }
  
  //this does not working well
  function removeFromCart(index) {
    cartList.splice(index, 1);
    document.querySelector(".total-to-pay.bold").textContent = updateAllPrice();
    getAllItems();
    updateCartUI();
  }
  
  function increaseItemQuantity(index) {
    cartList[index].quantity++;
    document.querySelector(".total-to-pay.bold").textContent = updateAllPrice();
    getAllItems();
    updateCartUI();
  }
  
  function decreaseItemQuantity(index) {
    if (cartList[index].quantity > 1) {
      cartList[index].quantity--;
    } else {
      cartList.splice(index, 1);
      return;
    }
    document.querySelector(".total-to-pay.bold").textContent = updateAllPrice();
    getAllItems();
    updateCartUI();
  }
  function updateAllPrice() {
    let allPrice = 0;
    cartList.forEach((item) => {
      allPrice += item.price * item.quantity;
    });
    return allPrice;
  }
  
  let addBtns = document.querySelectorAll(".content .image button");
  const cart = document.querySelector("aside .items");
  addBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      if (document.querySelector(".empty-cart")) {
        document.querySelector(".empty-cart").remove();
      }
      let index = parseInt(this.dataset.thumb);
      addToCart(categories[index], names[index], prices[index]);
      let idx;
      for (let item of cartList) {
        let thumbName = this.dataset.name;
        if (item.name == thumbName) {
          idx = cartList.indexOf(item);
          break;
        }
      }
      this.innerHTML = `
      <button class="increase-item" data-name="${cartList[idx].name}">+</button>
      <span>${cartList[idx].quantity}</span>
      <button class="decrease-item" data-name="${cartList[idx].name}">-</button>
      `;
      if (this.querySelector(".content button button")) {
        this.querySelector(".increase-item").addEventListener(
          "click",
          function () {
            let name = this.dataset.name;
            let idx;
            for (let item of cartList) {
              if (item.name == name) {
                idx = cartList.indexOf(item);
                break;
              }
            }
            increaseItemQuantity(idx);
          }
        );
        this.querySelector(".decrease-item").addEventListener(
          "click",
          function () {
            let name = this.dataset.name;
            let idx;
            for (let item of cartList) {
              if (item.name == name) {
                idx = cartList.indexOf(item);
                break;
              }
            }
            decreaseItemQuantity(idx);
          }
        );
      }
    });
  });
  
  function confirmOrders() {
    let box = document.createElement("div");
    box.classList.add("confirm-window");
    box.innerHTML = `
      <div class="check-icon">
        <i class="fa-solid fa-check"></i>
      </div>
      <h3>order confirmed</h3>
      <p>we hope you enjoy you food</p>
    `;
    const pickedItems = document.createElement("div");
    pickedItems.classList.add("picked-items");
    for (let item of cartList) {
      let pickedItem = document.createElement("div");
      pickedItem.classList.add("picked-item");
      let index = names.indexOf(item.name);
      pickedItem.innerHTML = `        <div class="thumb">
            <img src="${thumbnails[index]}" alt="">
            <div class="food-info">
              <h4 class="name">classic tiramisu</h4>
              <div>
                <span class="red"><span class="number">${
                  item.quantity
                }</span>x</span>
                <span class="single-price">@$<span class="price-num">${
                  item.price
                }</span></span>
              </div>
            </div>
          </div>
          <div class="total-payed-price">$<span>${
            item.quantity * item.price
          }</span></div>`;
      pickedItems.appendChild(pickedItem);
    }
    box.appendChild(pickedItems);
    box.innerHTML += `
      <div class="total">
        <span>order total</span>
        <span class="bold">$<span class="total-to-pay bold">${updateAllPrice()}</span></span>
      </div>
      <button>Start new order</button>`;
    document.querySelector(".container").appendChild(box);
  }
  