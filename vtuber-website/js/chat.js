// ================================================
// VTuber Studio - Chat System
// ================================================

'use strict';

let chatMessages = [];
let currentUser = null;
let isConnected = false;
let bannedUsers = [];
let mutedUsers = [];

// Initialize Chat
document.addEventListener('DOMContentLoaded', () => {
    initChat();
});

function initChat() {
    loadChatHistory();
    loadBannedUsers();
    setupChatForm();
    setupChatControls();
    renderMessages();
    
    // Auto-scroll to bottom
    scrollToBottom();
    
    // Set interval to update timestamps
    setInterval(updateTimestamps, 60000); // Every minute
}

// ================================================
// Load Data
// ================================================

function loadChatHistory() {
    chatMessages = DB.getChatMessages() || [];
}

function loadBannedUsers() {
    bannedUsers = DB.getBannedUsers() || [];
}

// ================================================
// Chat Form
// ================================================

function setupChatForm() {
    const form = document.getElementById('chat-form');
    const input = document.getElementById('chat-input');
    
    if (!form || !input) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        sendMessage();
    });
    
    // Character counter
    input.addEventListener('input', () => {
        const counter = document.getElementById('char-counter');
        if (counter) {
            counter.textContent = `${input.value.length}/200`;
        }
    });
    
    // Emoji picker
    document.getElementById('emoji-btn')?.addEventListener('click', toggleEmojiPicker);
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    if (message.length > 200) {
        VTuberApp.showToast('Message too long (max 200 characters)', 'warning');
        return;
    }
    
    // Get or create user
    if (!currentUser) {
        const username = prompt('Enter your username:');
        if (!username) return;
        
        if (bannedUsers.includes(username)) {
            VTuberApp.showToast('You are banned from chat', 'error');
            return;
        }
        
        currentUser = {
            id: generateId(),
            username: Security.sanitizeInput(username),
            color: generateUserColor()
        };
    }
    
    // Create message object
    const chatMessage = {
        id: generateId(),
        userId: currentUser.id,
        username: currentUser.username,
        message: Security.sanitizeInput(message),
        timestamp: Date.now(),
        color: currentUser.color
    };
    
    // Save message
    DB.addChatMessage(chatMessage);
    chatMessages.push(chatMessage);
    
    // Render new message
    renderMessage(chatMessage);
    
    // Clear input
    input.value = '';
    document.getElementById('char-counter').textContent = '0/200';
    
    // Scroll to bottom
    scrollToBottom();
}

// ================================================
// Render Messages
// ================================================

function renderMessages() {
    const container = document.getElementById('chat-messages');
    
    if (!container) return;
    
    if (chatMessages.length === 0) {
        container.innerHTML = '<div class="chat-empty">No messages yet. Start the conversation!</div>';
        return;
    }
    
    container.innerHTML = chatMessages.map(msg => createMessageHTML(msg)).join('');
}

function renderMessage(message) {
    const container = document.getElementById('chat-messages');
    
    if (!container) return;
    
    // Remove empty state
    const empty = container.querySelector('.chat-empty');
    if (empty) {
        empty.remove();
    }
    
    // Add new message
    const messageEl = document.createElement('div');
    messageEl.innerHTML = createMessageHTML(message);
    container.appendChild(messageEl.firstElementChild);
    
    // Animate in
    messageEl.firstElementChild.classList.add('animate-fade-in-up');
}

function createMessageHTML(message) {
    const time = new Date(message.timestamp);
    const timeStr = time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    
    const isOwnMessage = currentUser && message.userId === currentUser.id;
    const isMuted = mutedUsers.includes(message.username);
    
    return `
        <div class="chat-message ${isOwnMessage ? 'own-message' : ''} ${isMuted ? 'muted' : ''}" data-message-id="${message.id}">
            <div class="message-avatar" style="background: ${message.color}">
                ${message.username.charAt(0).toUpperCase()}
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-username" style="color: ${message.color}">${message.username}</span>
                    <span class="message-time" data-timestamp="${message.timestamp}">${timeStr}</span>
                </div>
                <div class="message-text">${linkifyText(message.message)}</div>
                <div class="message-actions">
                    ${!isOwnMessage ? `
                        <button class="message-action-btn" onclick="replyToMessage('${message.id}')" title="Reply">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="9 14 4 9 9 4"/>
                                <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
                            </svg>
                        </button>
                        <button class="message-action-btn" onclick="muteUser('${message.username}')" title="Mute">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                                <line x1="1" y1="1" x2="23" y2="23"/>
                            </svg>
                        </button>
                    ` : `
                        <button class="message-action-btn" onclick="deleteMessage('${message.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// ================================================
// Chat Actions
// ================================================

function replyToMessage(messageId) {
    const message = chatMessages.find(m => m.id === messageId);
    if (!message) return;
    
    const input = document.getElementById('chat-input');
    input.value = `@${message.username} `;
    input.focus();
}

function muteUser(username) {
    if (!mutedUsers.includes(username)) {
        mutedUsers.push(username);
        
        // Hide messages from muted user
        document.querySelectorAll('.chat-message').forEach(el => {
            const usernameEl = el.querySelector('.message-username');
            if (usernameEl && usernameEl.textContent === username) {
                el.classList.add('muted');
            }
        });
        
        VTuberApp.showToast(`Muted ${username}`, 'info');
    }
}

function deleteMessage(messageId) {
    if (!confirm('Delete this message?')) return;
    
    DB.deleteChatMessage(messageId);
    chatMessages = chatMessages.filter(m => m.id !== messageId);
    
    const messageEl = document.querySelector(`[data-message-id="${messageId}"]`);
    if (messageEl) {
        messageEl.remove();
    }
    
    VTuberApp.showToast('Message deleted', 'info');
}

// ================================================
// Chat Controls
// ================================================

function setupChatControls() {
    // Clear chat
    document.getElementById('clear-chat-btn')?.addEventListener('click', () => {
        if (confirm('Clear all messages?')) {
            chatMessages = [];
            DB.clearChatMessages();
            renderMessages();
        }
    });
    
    // Settings
    document.getElementById('chat-settings-btn')?.addEventListener('click', showChatSettings);
}

function showChatSettings() {
    // Show settings modal
    alert('Chat Settings:\n- Sound notifications\n- Font size\n- Theme');
}

// ================================================
// Emoji Picker
// ================================================

function toggleEmojiPicker() {
    const picker = document.getElementById('emoji-picker');
    
    if (!picker) {
        createEmojiPicker();
    } else {
        picker.classList.toggle('active');
    }
}

function createEmojiPicker() {
    const emojis = ['😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤔', '😅', '😆', '😉', '😋', '😛', '🤗', '🤩', '😭', '❤️', '💕', '💖', '💗', '👍', '👌', '🙌', '👏', '🎉', '🎊', '✨', '⭐', '🌟', '💫'];
    
    const picker = document.createElement('div');
    picker.id = 'emoji-picker';
    picker.className = 'emoji-picker active';
    picker.innerHTML = emojis.map(emoji => `
        <button class="emoji-btn" onclick="insertEmoji('${emoji}')">${emoji}</button>
    `).join('');
    
    document.body.appendChild(picker);
}

function insertEmoji(emoji) {
    const input = document.getElementById('chat-input');
    input.value += emoji;
    input.focus();
    
    toggleEmojiPicker();
}

// ================================================
// Utilities
// ================================================

function scrollToBottom() {
    const container = document.getElementById('chat-messages');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

function updateTimestamps() {
    document.querySelectorAll('.message-time').forEach(el => {
        const timestamp = parseInt(el.dataset.timestamp);
        const time = new Date(timestamp);
        el.textContent = time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    });
}

function linkifyText(text) {
    // Convert URLs to links
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function generateUserColor() {
    const colors = ['#6C63FF', '#FF6B9D', '#FFC947', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA', '#FCBAD3'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

console.log('💬 Chat system initialized');
