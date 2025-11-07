// ================================================
// VTuber Studio - Analytics System
// ================================================

'use strict';

const Analytics = {
    sessionId: null,
    startTime: null,
    pageViews: [],
    events: [],
    
    // Initialize
    init() {
        this.sessionId = this.generateSessionId();
        this.startTime = Date.now();
        this.loadData();
        this.trackPageView();
        this.setupEventListeners();
        
        console.log('📊 Analytics initialized');
    },
    
    // Generate Session ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },
    
    // Load saved data
    loadData() {
        this.pageViews = DB.get('analytics_pageviews') || [];
        this.events = DB.get('analytics_events') || [];
    },
    
    // Save data
    saveData() {
        DB.set('analytics_pageviews', this.pageViews);
        DB.set('analytics_events', this.events);
    },
    
    // Track Page View
    trackPageView(pageName = null) {
        const page = pageName || this.getCurrentPage();
        
        const pageView = {
            id: this.generateId(),
            sessionId: this.sessionId,
            page: page,
            url: window.location.href,
            referrer: document.referrer,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            viewportSize: `${window.innerWidth}x${window.innerHeight}`
        };
        
        this.pageViews.push(pageView);
        this.saveData();
        
        console.log('📄 Page view tracked:', page);
    },
    
    // Track Event
    trackEvent(category, action, label = null, value = null) {
        const event = {
            id: this.generateId(),
            sessionId: this.sessionId,
            category: category,
            action: action,
            label: label,
            value: value,
            page: this.getCurrentPage(),
            timestamp: Date.now()
        };
        
        this.events.push(event);
        this.saveData();
        
        console.log('📊 Event tracked:', category, action);
    },
    
    // Setup automatic event tracking
    setupEventListeners() {
        // Track clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (target) {
                const text = target.textContent.trim().substring(0, 50);
                this.trackEvent('Click', target.tagName, text);
            }
        });
        
        // Track form submissions
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const formId = form.id || 'unknown-form';
            this.trackEvent('Form', 'Submit', formId);
        });
        
        // Track scroll depth
        let maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            if (scrollPercent > maxScroll) {
                maxScroll = Math.floor(scrollPercent / 25) * 25; // Track in 25% increments
                if (maxScroll > 0) {
                    this.trackEvent('Scroll', 'Depth', `${maxScroll}%`);
                }
            }
        });
        
        // Track time on page
        window.addEventListener('beforeunload', () => {
            const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
            this.trackEvent('Engagement', 'TimeOnPage', this.getCurrentPage(), timeSpent);
        });
    },
    
    // Get current page name
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    },
    
    // Get Analytics Report
    getReport() {
        return {
            totalPageViews: this.pageViews.length,
            totalEvents: this.events.length,
            uniquePages: [...new Set(this.pageViews.map(pv => pv.page))],
            topPages: this.getTopPages(),
            topEvents: this.getTopEvents(),
            averageTimeOnSite: this.getAverageTimeOnSite(),
            deviceTypes: this.getDeviceTypes(),
            browserInfo: this.getBrowserInfo()
        };
    },
    
    // Get top pages
    getTopPages() {
        const pageCounts = {};
        this.pageViews.forEach(pv => {
            pageCounts[pv.page] = (pageCounts[pv.page] || 0) + 1;
        });
        
        return Object.entries(pageCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([page, count]) => ({ page, views: count }));
    },
    
    // Get top events
    getTopEvents() {
        const eventCounts = {};
        this.events.forEach(event => {
            const key = `${event.category}:${event.action}`;
            eventCounts[key] = (eventCounts[key] || 0) + 1;
        });
        
        return Object.entries(eventCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([event, count]) => ({ event, count }));
    },
    
    // Get average time on site
    getAverageTimeOnSite() {
        const timeEvents = this.events.filter(e => e.category === 'Engagement' && e.action === 'TimeOnPage');
        if (timeEvents.length === 0) return 0;
        
        const totalTime = timeEvents.reduce((sum, e) => sum + (e.value || 0), 0);
        return Math.floor(totalTime / timeEvents.length);
    },
    
    // Get device types
    getDeviceTypes() {
        const devices = {
            mobile: 0,
            tablet: 0,
            desktop: 0
        };
        
        this.pageViews.forEach(pv => {
            const ua = pv.userAgent.toLowerCase();
            if (/mobile|android|iphone/.test(ua)) {
                devices.mobile++;
            } else if (/tablet|ipad/.test(ua)) {
                devices.tablet++;
            } else {
                devices.desktop++;
            }
        });
        
        return devices;
    },
    
    // Get browser info
    getBrowserInfo() {
        const browsers = {};
        
        this.pageViews.forEach(pv => {
            const ua = pv.userAgent;
            let browser = 'Other';
            
            if (ua.includes('Chrome')) browser = 'Chrome';
            else if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Safari')) browser = 'Safari';
            else if (ua.includes('Edge')) browser = 'Edge';
            
            browsers[browser] = (browsers[browser] || 0) + 1;
        });
        
        return browsers;
    },
    
    // Export data
    exportData() {
        const data = {
            pageViews: this.pageViews,
            events: this.events,
            report: this.getReport()
        };
        
        return JSON.stringify(data, null, 2);
    },
    
    // Clear data
    clearData() {
        this.pageViews = [];
        this.events = [];
        this.saveData();
        console.log('📊 Analytics data cleared');
    },
    
    // Generate ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
};

// Auto-initialize
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Analytics.init();
    });
}

window.Analytics = Analytics;

console.log('✅ Analytics module loaded');
