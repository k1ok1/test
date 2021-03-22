const API_URL = '/base.json';

const vue = new Vue({
	el: '#app',

	data: {
		search: '',
		goods: [],
		filteredGoods: [],
		cart: [],
		isCartOpen: false,
		addGoodPrices: [],
		deletedGoodsFromCart: [],
		totalCost: 0,
	},

	methods: {
		searchHandler() {
			if (this.search === '') {
				this.filteredGoods = this.goods;
			}
			const regexp = new RegExp(this.search, 'gi');
			this.filteredGoods = this.goods.filter((good) => regexp.test(good.title));
		},

		addToCart(e) {
			const index = e.target.dataset.index;
			this.cart.push(this.filteredGoods[index]);
			e.target.setAttribute("disabled", "disabled");

			this.addGoodPrices.push(this.filteredGoods[index].price);
			this.totalCost=0;
			this.addGoodPrices.forEach((item) => {
				this.totalCost+=item;
			});
		},

		addItemCart(e) {
			const index = e.target.dataset.index;
			this.cart[index].quantity++;

			this.addGoodPrices.push(this.cart[index].price);
			this.totalCost=0;
			this.addGoodPrices.forEach((item) => {
				this.totalCost+=item;
			});
		},

		deleteFromCart(e) {
			const index = e.target.dataset.index;
			if (this.cart[index].quantity !== 1) {
				this.cart[index].quantity--;
				this.deletedGoodsFromCart.push(this.cart[index]);
			}
			else {
				this.deletedGoodsFromCart.push(this.cart.splice(index, 1)[0]);
			}
			
			this.totalCost -= this.deletedGoodsFromCart[this.deletedGoodsFromCart.length-1].price;
		},

		openCartHandler() {
			this.isCartOpen = !this.isCartOpen;
		},

		fetch(error, success) {
			let xhr;
	
			if (window.XMLHttpRequest) {
				xhr = new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				xhr = new ActiveXObject("Microsoft.XMLHTTP");
			}
	
			xhr.onreadystatechange = function () {
				if (xhr.readyState === 4) {
					if (xhr.status === 200) {
						success(JSON.parse(xhr.responseText));
					} else if (xhr.status > 400) {
						error('Ошибка!');
					}
				}
			}
	
			xhr.open('GET', API_URL, true);
			xhr.send();
		},
	
		fetchPromise() {
			return new Promise((resolve, reject) => {
				this.fetch(reject, resolve);
			});
		}
	},

	mounted() {
		this.fetchPromise() 
			.then(data => {
				this.goods = data;
				this.filteredGoods = data;
			})
			.catch(err => {
				console.log(err);
			});
	}
});

Vue.component('search', {
	template: `<div class="search-block">
	<input type="search" id="search-input" v-model="vue.search">
	<button type="button" class="search" v-on:click="vue.searchHandler">Искать</button>
	</div>`,
	props: [],
});

Vue.component('cart-info', {
	template: `<div class="cart-info">
	<h2 class="cart-title">Корзина товаров</h2>
	<h2 class="total-cost">Общая стоимость: {{ vue.totalCost }}</h2>
	</div>`,
	props: []
});

Vue.component('cart-item', {
	template: `<div class="cart-item" v-for="(good, index) in cart">
	<img v-bind:src="good.src">
	<h3>{{ good.title }}</h3>
	<p class="cart-item-price">{{ good.price }}</p>
	<button type="button" class="add-to-cart" :data-index="index" v-on:click="vue.addItemCart">+</button>
	<span class="cart-quantity">[{{ good.quantity }}]</span>
	<button type="button" class="delete-from-cart" :data-index="index" v-on:click="vue.deleteFromCart">-</button>
	</div>`,
	props: ['cart-goods']
});