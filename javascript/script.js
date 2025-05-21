
// Attendre que le DOM soit chargé
document.addEventListener('DOMContentLoaded', function() {
    // Mise à jour de l'année dans le footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Gestion du menu mobile
    setupMobileMenu();
    
    // Gestion du panier
    setupCart();
    
    // Gestion des formulaires
    setupForms();
    
    // Animation d'apparition des éléments
    animateElements();
    
    // Configuration de la recherche
    setupSearch();
    
    // Configuration du filtrage par catégorie
    setupCategoryFiltering();
});

/**
 * Configuration du menu mobile
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            // Toggle classe pour afficher/masquer le menu
            mainNav.classList.toggle('show');
            
            // Changer l'icône du bouton
            const icon = menuToggle.querySelector('i');
            if (icon.classList.contains('fa-bars')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }
}

/**
 * Gestion du panier d'achat
 */
function setupCart() {
    // Initialiser le panier depuis le localStorage ou créer un nouveau panier vide
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    updateCartCount();
    
    // Ajouter des écouteurs d'événements pour les boutons "Ajouter au panier"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Récupérer les informations du livre
            const bookCard = this.closest('.book-card');
            const bookTitle = bookCard.querySelector('h3').textContent;
            const bookAuthor = bookCard.querySelector('.book-author').textContent;
            const bookPrice = bookCard.querySelector('.book-price').textContent.replace(' DA', '');
            const bookImg = bookCard.querySelector('img').getAttribute('src');
            
            // Vérifier si le livre est déjà dans le panier
            const existingItemIndex = cart.findIndex(item => item.title === bookTitle);
            
            if (existingItemIndex > -1) {
                // Si le livre est déjà dans le panier, augmenter la quantité
                cart[existingItemIndex].quantity += 1;
            } else {
                // Sinon, ajouter un nouvel élément au panier
                cart.push({
                    id: Date.now(), // Identifiant unique
                    title: bookTitle,
                    author: bookAuthor,
                    price: parseInt(bookPrice),
                    image: bookImg,
                    quantity: 1
                });
            }
            
            // Sauvegarder le panier dans le localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Mettre à jour l'affichage du nombre d'articles
            updateCartCount();
            
            // Afficher une notification
            showNotification(`${bookTitle} a été ajouté à votre panier.`);
        });
    });
    
    // Afficher le contenu du panier si nous sommes sur la page panier.html
    if (window.location.href.includes('panier.html')) {
        displayCartItems();
    }
}

/**
 * Afficher les éléments du panier sur la page panier.html
 */
function displayCartItems() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartSummary = document.getElementById('cart-summary');
    
    if (cart.length === 0) {
        // Panier vide
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartSummary) cartSummary.style.display = 'none';
        if (cartItemsContainer) cartItemsContainer.innerHTML = '';
        return;
    }
    
    // Panier avec des articles
    if (cartEmpty) cartEmpty.style.display = 'none';
    if (cartSummary) cartSummary.style.display = 'block';
    
    if (cartItemsContainer) {
        let cartHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            cartHTML += `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="${item.image}" alt="${item.title}">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.title}</h3>
                        <p class="cart-item-author">${item.author}</p>
                        <p class="cart-item-price">${item.price} DA</p>
                    </div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn decrease">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn increase">+</button>
                    </div>
                    <div class="cart-item-total">
                        <p>${itemTotal} DA</p>
                    </div>
                    <button class="remove-item" aria-label="Supprimer">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = cartHTML;
        
        // Mettre à jour les totaux
        const subtotalElement = document.getElementById('subtotal');
        const totalElement = document.getElementById('total');
        const shippingElement = document.getElementById('shipping');
        
        if (subtotalElement) subtotalElement.textContent = `${subtotal} DA`;
        
        const shipping = subtotal > 0 ? 500 : 0;
        if (shippingElement) shippingElement.textContent = `${shipping} DA`;
        
        if (totalElement) totalElement.textContent = `${subtotal + shipping} DA`;
        
        // Ajouter des écouteurs d'événements pour les boutons de quantité et de suppression
        setupCartItemEvents();
    }
}

/**
 * Ajouter des écouteurs d'événements pour les boutons du panier
 */
function setupCartItemEvents() {
    // Boutons d'augmentation de quantité
    const increaseButtons = document.querySelectorAll('.quantity-btn.increase');
    increaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            updateCartItemQuantity(this.closest('.cart-item'), 1);
        });
    });
    
    // Boutons de diminution de quantité
    const decreaseButtons = document.querySelectorAll('.quantity-btn.decrease');
    decreaseButtons.forEach(button => {
        button.addEventListener('click', function() {
            updateCartItemQuantity(this.closest('.cart-item'), -1);
        });
    });
    
    // Boutons de suppression
    const removeButtons = document.querySelectorAll('.remove-item');
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            removeCartItem(this.closest('.cart-item'));
        });
    });
}

/**
 * Mettre à jour la quantité d'un article du panier
 */
function updateCartItemQuantity(cartItem, change) {
    const itemId = cartItem.dataset.id;
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const itemIndex = cart.findIndex(item => item.id == itemId);
    if (itemIndex === -1) return;
    
    cart[itemIndex].quantity += change;
    
    // Si la quantité devient 0 ou moins, supprimer l'article
    if (cart[itemIndex].quantity <= 0) {
        cart.splice(itemIndex, 1);
    }
    
    // Mettre à jour le localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Rafraîchir l'affichage
    displayCartItems();
    updateCartCount();
}

/**
 * Supprimer un article du panier
 */
function removeCartItem(cartItem) {
    const itemId = cartItem.dataset.id;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cart = cart.filter(item => item.id != itemId);
    
    // Mettre à jour le localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Rafraîchir l'affichage
    displayCartItems();
    updateCartCount();
    
    showNotification('Article supprimé du panier.');
}

/**
 * Mettre à jour le compteur d'articles du panier
 */
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

/**
 * Afficher une notification temporaire
 */
function showNotification(message) {
    // Vérifier si une notification existe déjà
    let notification = document.querySelector('.notification');
    
    // Si pas de notification, en créer une
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Définir le message et afficher la notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Masquer la notification après 3 secondes
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Configuration des formulaires
 */
function setupForms() {
    // Formulaire de newsletter
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (validateEmail(email)) {
                // Simulation d'envoi de formulaire
                showNotification('Merci pour votre inscription à notre newsletter !');
                emailInput.value = '';
            } else {
                showNotification('Veuillez entrer une adresse email valide.');
            }
        });
    }
}

/**
 * Configurer la recherche de livres et d'auteurs
 */
function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-bar input');
    
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function(e) {
            // Si on appuie sur Entrée, lancer la recherche
            if (e.key === 'Enter') {
                performSearch(this.value);
            }
        });
        
        // Bouton de recherche
        const searchButton = input.nextElementSibling;
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                performSearch(input.value);
            });
        }
    });
    
    // Recherche dans la page livres.html
    const filterInput = document.getElementById('search-filter');
    if (filterInput) {
        filterInput.addEventListener('input', function() {
            filterBooks(this.value);
        });
    }
}

/**
 * Effectuer une recherche
 */
function performSearch(query) {
    if (!query.trim()) return;
    
    // Rediriger vers la page des livres avec le paramètre de recherche
    window.location.href = `${getContentPath()}livres.html?search=${encodeURIComponent(query.trim())}`;
}

/**
 * Filtrer les livres sur la page livres.html
 */

    function filterBooksByCategory(category) {
    const books = document.querySelectorAll('.book-card');
    category = category.toLowerCase();
    
    books.forEach(book => {
        const bookCategory = book.dataset.category.toLowerCase();
        
        if (bookCategory === category || category === 'all') {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    });
}

/**

/**
 * Filtrer les livres par catégorie
 */
function filterBooksByCategory(category) {
    const books = document.querySelectorAll('.book-card');
    category = category.toLowerCase();
    
    books.forEach(book => {
        // Vérifier si le livre a l'attribut data-category
        const bookCategory = book.dataset.category ? book.dataset.category.toLowerCase() : '';
        
        if (category === 'all' || bookCategory === category) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    });
    
    // Vérifier s'il y a des résultats après filtrage
    checkForNoResults();
}

/**
 * Filtrer les livres par recherche (titre ou auteur)
 */
function filterBooks(query) {
    const books = document.querySelectorAll('.book-card');
    query = query.toLowerCase().trim();
    
    books.forEach(book => {
        const title = book.querySelector('h3').textContent.toLowerCase();
        const author = book.querySelector('.book-author').textContent.toLowerCase();
        
        if (title.includes(query) || author.includes(query)) {
            book.style.display = '';
        } else {
            book.style.display = 'none';
        }
    });
    
    // Vérifier s'il y a des résultats après filtrage
    checkForNoResults();
}

/**
 * Vérifier s'il n'y a aucun résultat après filtrage
 */
function checkForNoResults() {
    const books = document.querySelectorAll('.book-card');
    let visibleBooks = 0;
    
    books.forEach(book => {
        if (book.style.display !== 'none') {
            visibleBooks++;
        }
    });
    
    // S'il n'y a aucun livre visible, afficher un message
    const booksGrid = document.getElementById('books-grid');
    
    // Supprimer le message précédent s'il existe
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (visibleBooks === 0 && booksGrid) {
        const noResultsMessage = document.createElement('div');
        noResultsMessage.className = 'no-results-message';
        noResultsMessage.innerHTML = `
            <i class="fa fa-search"></i>
            <h3>Aucun livre trouvé</h3>
            <p>Essayez d'autres critères de recherche.</p>
        `;
        
        // Ajouter le message après la grille de livres
        booksGrid.parentNode.insertBefore(noResultsMessage, booksGrid.nextSibling);
    }
}

/**
 * Configuration du filtrage par catégorie
 */
function setupCategoryFiltering() {
    // Vérifier si nous sommes sur la page livres.html
    if (window.location.href.includes('livres.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        
        // Filtrer par catégorie si spécifié dans l'URL
        if (urlParams.has('category')) {
            const category = urlParams.get('category');
            filterBooksByCategory(category);
            
            // Mettre à jour le titre de la page
            updatePageTitle(`Livres - ${getCategoryDisplayName(category)}`);
        }
        
        // Filtrer par recherche si spécifié dans l'URL
        if (urlParams.has('search')) {
            const searchQuery = urlParams.get('search');
            document.getElementById('search-filter').value = searchQuery;
            filterBooks(searchQuery);
            
            // Mettre à jour le titre de la page
            updatePageTitle(`Résultats pour: ${searchQuery}`);
        }
        
        // Filtrer par nouveautés si spécifié dans l'URL
        if (urlParams.has('new') && urlParams.get('new') === 'true') {
            // Logique pour filtrer les nouveautés (à implémenter)
            updatePageTitle('Nouveautés');
        }
        
        // Filtrer par meilleures ventes si spécifié dans l'URL
        if (urlParams.has('bestseller') && urlParams.get('bestseller') === 'true') {
            // Logique pour filtrer les meilleures ventes (à implémenter)
            updatePageTitle('Meilleures ventes');
        }
    }
}

/**
 * Mettre à jour le titre de la page
 */
function updatePageTitle(title) {
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = title;
    }
}

/**
 * Obtenir le nom d'affichage d'une catégorie
 */
function getCategoryDisplayName(category) {
    const categories = {
        'fiction': 'Romans',
        'science-fiction': 'Science-Fiction',
        'biographies': 'Biographies',
        'jeunesse': 'Jeunesse',
        // Ajouter d'autres catégories au besoin
    };
    
    return categories[category] || category;
}

/**
 * Obtenir le chemin vers le répertoire content
 */
function getContentPath() {
    // Si nous sommes sur la page d'accueil, le chemin est content/
    // Sinon, nous sommes déjà dans content, donc le chemin est vide
    return window.location.pathname.includes('index.html') ? 'content/' : '';
}

/**
 * Obtenir le nom d'affichage d'une catégorie
 */
function getCategoryDisplayName(category) {
    const categories = {
        'fiction': 'fiction',
        'science-fiction': 'Science-Fiction',
        'biographies': 'Biographies',
        'jeunesse': 'Jeunesse',
        'thriller':'Thriller',
        'essai':'Essai',
         'romance':'Romance',
        // Ajouter d'autres catégories au besoin
    };
    
    return categories[category] || category;
}

/**
 * Mettre à jour le titre de la page
 */
function updatePageTitle(title) {
    const pageTitleElement = document.getElementById('page-title');
    if (pageTitleElement) {
        pageTitleElement.textContent = title;
    }
}

/**
 * Obtenir le chemin vers le répertoire content
 */
function getContentPath() {
    // Si nous sommes sur la page d'accueil, le chemin est content/
    // Sinon, nous sommes déjà dans content, donc le chemin est vide
    return window.location.pathname.includes('index.html') ? 'content/' : '';
}

/**
 * Valider un email avec une expression régulière
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Animer l'apparition des éléments lors du défilement
 */
function animateElements() {
    // Sélectionner tous les éléments à animer
    const elements = document.querySelectorAll('.book-card, .category-card, .testimonial-card, .section-title');
    
    // Créer un observateur d'intersection
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    // Observer chaque élément
    elements.forEach(element => {
        observer.observe(element);
    });
}

// Ajouter des styles pour la notification
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--primary);
            color: white;
            padding: 12px 20px;
            border-radius: var(--radius);
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
        }
        
        .notification.show {
            transform: translateY(0);
            opacity: 1;
        }
        
        .main-nav.show {
            display: block;
        }
        
        .fade-in {
            animation: fadeIn 0.5s ease forwards;
        }
        
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
});