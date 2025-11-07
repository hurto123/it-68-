// ================================================
// VTuber Studio - Reviews & Rating System
// ================================================

'use strict';

let reviews = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    setupReviewForm();
    renderReviews();
});

// ================================================
// Load & Save
// ================================================

function loadReviews() {
    reviews = DB.get('reviews') || [];
}

function saveReviews() {
    DB.set('reviews', reviews);
}

// ================================================
// Review Form
// ================================================

function setupReviewForm() {
    const form = document.getElementById('review-form');
    
    if (!form) return;
    
    form.addEventListener('submit', handleReviewSubmit);
    
    // Star rating
    setupStarRating();
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star-rating .star');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            setRating(index + 1);
        });
        
        star.addEventListener('mouseenter', () => {
            highlightStars(index + 1);
        });
    });
    
    document.querySelector('.star-rating')?.addEventListener('mouseleave', () => {
        const currentRating = parseInt(document.getElementById('rating-value')?.value || 0);
        highlightStars(currentRating);
    });
}

function setRating(rating) {
    document.getElementById('rating-value').value = rating;
    highlightStars(rating);
}

function highlightStars(count) {
    const stars = document.querySelectorAll('.star-rating .star');
    
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

function handleReviewSubmit(e) {
    e.preventDefault();
    
    const rating = parseInt(document.getElementById('rating-value').value);
    const title = document.getElementById('review-title').value.trim();
    const comment = document.getElementById('review-comment').value.trim();
    const name = document.getElementById('reviewer-name').value.trim();
    
    if (rating === 0) {
        VTuberApp.showToast('Please select a rating', 'warning');
        return;
    }
    
    if (!comment) {
        VTuberApp.showToast('Please write a review', 'warning');
        return;
    }
    
    const review = {
        id: generateId(),
        productId: document.getElementById('product-id')?.value,
        characterId: document.getElementById('character-id')?.value,
        rating: rating,
        title: Security.sanitizeInput(title),
        comment: Security.sanitizeInput(comment),
        reviewerName: Security.sanitizeInput(name) || 'Anonymous',
        timestamp: Date.now(),
        helpful: 0,
        verified: false
    };
    
    reviews.push(review);
    saveReviews();
    
    // Render new review
    renderReview(review, true);
    
    // Reset form
    e.target.reset();
    setRating(0);
    
    VTuberApp.showToast('Review submitted successfully!', 'success');
}

// ================================================
// Render Reviews
// ================================================

function renderReviews() {
    const container = document.getElementById('reviews-container');
    
    if (!container) return;
    
    if (reviews.length === 0) {
        container.innerHTML = '<p class="empty-message">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    // Sort by most recent
    const sortedReviews = [...reviews].sort((a, b) => b.timestamp - a.timestamp);
    
    container.innerHTML = sortedReviews.map(review => createReviewHTML(review)).join('');
    
    // Update stats
    updateReviewStats();
}

function renderReview(review, prepend = false) {
    const container = document.getElementById('reviews-container');
    
    if (!container) return;
    
    // Remove empty state
    const empty = container.querySelector('.empty-message');
    if (empty) {
        empty.remove();
    }
    
    const reviewEl = document.createElement('div');
    reviewEl.innerHTML = createReviewHTML(review);
    
    if (prepend) {
        container.prepend(reviewEl.firstElementChild);
    } else {
        container.appendChild(reviewEl.firstElementChild);
    }
    
    // Animate in
    reviewEl.firstElementChild.classList.add('animate-fade-in-up');
    
    updateReviewStats();
}

function createReviewHTML(review) {
    const date = new Date(review.timestamp).toLocaleDateString('th-TH');
    
    return `
        <div class="review-card" data-review-id="${review.id}">
            <div class="review-header">
                <div class="review-author">
                    <div class="author-avatar">
                        ${review.reviewerName.charAt(0).toUpperCase()}
                    </div>
                    <div class="author-info">
                        <div class="author-name">
                            ${review.reviewerName}
                            ${review.verified ? '<span class="verified-badge" title="Verified Purchase">✓</span>' : ''}
                        </div>
                        <div class="review-date">${date}</div>
                    </div>
                </div>
                <div class="review-rating">
                    ${renderStars(review.rating)}
                </div>
            </div>
            
            ${review.title ? `<h4 class="review-title">${review.title}</h4>` : ''}
            
            <p class="review-comment">${review.comment}</p>
            
            <div class="review-footer">
                <button class="review-helpful-btn" onclick="markHelpful('${review.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>
                    </svg>
                    <span>Helpful (${review.helpful})</span>
                </button>
                
                <button class="review-report-btn" onclick="reportReview('${review.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" y1="9" x2="12" y2="13"/>
                        <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                    <span>Report</span>
                </button>
            </div>
        </div>
    `;
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<span class="star filled">★</span>';
        } else {
            stars += '<span class="star">☆</span>';
        }
    }
    return stars;
}

// ================================================
// Review Actions
// ================================================

function markHelpful(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    
    if (!review) return;
    
    // Check if already marked
    const marked = DB.get('reviews_marked_helpful') || [];
    if (marked.includes(reviewId)) {
        VTuberApp.showToast('You already marked this as helpful', 'info');
        return;
    }
    
    review.helpful++;
    marked.push(reviewId);
    
    saveReviews();
    DB.set('reviews_marked_helpful', marked);
    
    // Update UI
    const btn = document.querySelector(`[data-review-id="${reviewId}"] .review-helpful-btn span`);
    if (btn) {
        btn.textContent = `Helpful (${review.helpful})`;
    }
}

function reportReview(reviewId) {
    if (!confirm('Report this review as inappropriate?')) return;
    
    const reported = DB.get('reviews_reported') || [];
    if (!reported.includes(reviewId)) {
        reported.push(reviewId);
        DB.set('reviews_reported', reported);
    }
    
    VTuberApp.showToast('Review reported', 'info');
}

// ================================================
// Review Stats
// ================================================

function updateReviewStats() {
    if (reviews.length === 0) return;
    
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = (totalRating / totalReviews).toFixed(1);
    
    // Update average rating
    const avgEl = document.getElementById('average-rating');
    if (avgEl) {
        avgEl.textContent = averageRating;
    }
    
    // Update total count
    const countEl = document.getElementById('review-count');
    if (countEl) {
        countEl.textContent = `${totalReviews} ${totalReviews === 1 ? 'review' : 'reviews'}`;
    }
    
    // Update star distribution
    updateStarDistribution();
}

function updateStarDistribution() {
    const distribution = [0, 0, 0, 0, 0];
    
    reviews.forEach(review => {
        distribution[review.rating - 1]++;
    });
    
    distribution.forEach((count, index) => {
        const rating = index + 1;
        const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
        
        const barEl = document.querySelector(`[data-star="${rating}"] .distribution-bar`);
        if (barEl) {
            barEl.style.width = `${percent}%`;
        }
        
        const countEl = document.querySelector(`[data-star="${rating}"] .distribution-count`);
        if (countEl) {
            countEl.textContent = count;
        }
    });
}

// ================================================
// Utilities
// ================================================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Filter reviews
function filterReviews(rating) {
    const filteredReviews = rating === 'all' 
        ? reviews 
        : reviews.filter(r => r.rating === parseInt(rating));
    
    const container = document.getElementById('reviews-container');
    
    if (filteredReviews.length === 0) {
        container.innerHTML = '<p class="empty-message">No reviews with this rating</p>';
        return;
    }
    
    container.innerHTML = filteredReviews.map(review => createReviewHTML(review)).join('');
}

// Sort reviews
function sortReviews(sortBy) {
    let sortedReviews;
    
    switch(sortBy) {
        case 'recent':
            sortedReviews = [...reviews].sort((a, b) => b.timestamp - a.timestamp);
            break;
        case 'helpful':
            sortedReviews = [...reviews].sort((a, b) => b.helpful - a.helpful);
            break;
        case 'rating-high':
            sortedReviews = [...reviews].sort((a, b) => b.rating - a.rating);
            break;
        case 'rating-low':
            sortedReviews = [...reviews].sort((a, b) => a.rating - b.rating);
            break;
        default:
            sortedReviews = reviews;
    }
    
    const container = document.getElementById('reviews-container');
    container.innerHTML = sortedReviews.map(review => createReviewHTML(review)).join('');
}

// ================================================
// Export
// ================================================

window.Reviews = {
    load: loadReviews,
    render: renderReviews,
    filter: filterReviews,
    sort: sortReviews
};

console.log('⭐ Reviews system loaded');
