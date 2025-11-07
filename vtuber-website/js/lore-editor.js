// ================================================
// VTuber Studio - Lore Editor (Advanced Feature)
// ================================================

'use strict';

const LoreEditor = {
    currentCharacter: null,
    loreData: {},
    
    // Initialize
    init(characterId) {
        this.currentCharacter = characterId;
        this.loadLore();
        this.setupEditor();
        console.log('📝 Lore editor initialized');
    },
    
    // Load lore
    loadLore() {
        this.loreData = DB.get(`lore_${this.currentCharacter}`) || {
            backstory: '',
            personality: '',
            relationships: [],
            timeline: [],
            quotes: [],
            trivia: []
        };
    },
    
    // Save lore
    saveLore() {
        DB.set(`lore_${this.currentCharacter}`, this.loreData);
        console.log('💾 Lore saved');
        
        if (window.VTuberApp) {
            VTuberApp.showToast('Lore saved successfully', 'success');
        }
    },
    
    // Setup editor
    setupEditor() {
        // Backstory
        const backstoryEl = document.getElementById('lore-backstory');
        if (backstoryEl) {
            backstoryEl.value = this.loreData.backstory;
            backstoryEl.addEventListener('input', (e) => {
                this.loreData.backstory = e.target.value;
            });
        }
        
        // Personality
        const personalityEl = document.getElementById('lore-personality');
        if (personalityEl) {
            personalityEl.value = this.loreData.personality;
            personalityEl.addEventListener('input', (e) => {
                this.loreData.personality = e.target.value;
            });
        }
        
        // Render sections
        this.renderRelationships();
        this.renderTimeline();
        this.renderQuotes();
        this.renderTrivia();
        
        // Save button
        document.getElementById('save-lore')?.addEventListener('click', () => {
            this.saveLore();
        });
    },
    
    // Relationships
    addRelationship(characterId, type, description) {
        this.loreData.relationships.push({
            id: this.generateId(),
            characterId,
            type,
            description
        });
        this.renderRelationships();
    },
    
    renderRelationships() {
        const container = document.getElementById('relationships-list');
        if (!container) return;
        
        container.innerHTML = this.loreData.relationships.map(rel => `
            <div class="lore-item">
                <span>${rel.type}: ${rel.description}</span>
                <button onclick="LoreEditor.removeRelationship('${rel.id}')">Remove</button>
            </div>
        `).join('');
    },
    
    removeRelationship(id) {
        this.loreData.relationships = this.loreData.relationships.filter(r => r.id !== id);
        this.renderRelationships();
    },
    
    // Timeline
    addTimelineEvent(date, event) {
        this.loreData.timeline.push({
            id: this.generateId(),
            date,
            event
        });
        this.loreData.timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
        this.renderTimeline();
    },
    
    renderTimeline() {
        const container = document.getElementById('timeline-list');
        if (!container) return;
        
        container.innerHTML = this.loreData.timeline.map(item => `
            <div class="lore-item">
                <strong>${item.date}</strong>: ${item.event}
                <button onclick="LoreEditor.removeTimelineEvent('${item.id}')">Remove</button>
            </div>
        `).join('');
    },
    
    removeTimelineEvent(id) {
        this.loreData.timeline = this.loreData.timeline.filter(t => t.id !== id);
        this.renderTimeline();
    },
    
    // Quotes
    addQuote(quote, context) {
        this.loreData.quotes.push({
            id: this.generateId(),
            quote,
            context
        });
        this.renderQuotes();
    },
    
    renderQuotes() {
        const container = document.getElementById('quotes-list');
        if (!container) return;
        
        container.innerHTML = this.loreData.quotes.map(q => `
            <div class="lore-item">
                <blockquote>"${q.quote}"</blockquote>
                <small>${q.context}</small>
                <button onclick="LoreEditor.removeQuote('${q.id}')">Remove</button>
            </div>
        `).join('');
    },
    
    removeQuote(id) {
        this.loreData.quotes = this.loreData.quotes.filter(q => q.id !== id);
        this.renderQuotes();
    },
    
    // Trivia
    addTrivia(fact) {
        this.loreData.trivia.push({
            id: this.generateId(),
            fact
        });
        this.renderTrivia();
    },
    
    renderTrivia() {
        const container = document.getElementById('trivia-list');
        if (!container) return;
        
        container.innerHTML = this.loreData.trivia.map(t => `
            <div class="lore-item">
                <span>${t.fact}</span>
                <button onclick="LoreEditor.removeTrivia('${t.id}')">Remove</button>
            </div>
        `).join('');
    },
    
    removeTrivia(id) {
        this.loreData.trivia = this.loreData.trivia.filter(t => t.id !== id);
        this.renderTrivia();
    },
    
    // Export lore
    export() {
        const json = JSON.stringify(this.loreData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `lore-${this.currentCharacter}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
    },
    
    // Generate ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

window.LoreEditor = LoreEditor;

console.log('✅ Lore editor module loaded');
