// Referral System Implementation
class ReferralSystem {
    constructor() {
        this.init();
        this.checkReferralCode();
        this.updateUI();
    }

    init() {
        // Generate unique user ID if not exists
        if (!localStorage.getItem('userId')) {
            localStorage.setItem('userId', this.generateUniqueId());
        }

        // Initialize credits if not exists
        if (!localStorage.getItem('credits')) {
            localStorage.setItem('credits', '0');
        }

        // Initialize referral stats
        if (!localStorage.getItem('referralStats')) {
            localStorage.setItem('referralStats', JSON.stringify({
                totalReferrals: 0,
                earnedCredits: 0
            }));
        }

        this.bindEvents();
    }

    generateUniqueId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateReferralCode() {
        const userId = localStorage.getItem('userId');
        return btoa(userId).replace(/[^a-zA-Z0-9]/g, '').substr(0, 8).toUpperCase();
    }

    getReferralLink() {
        const referralCode = this.generateReferralCode();
        const baseUrl = window.location.origin + window.location.pathname;
        return `${baseUrl}?ref=${referralCode}`;
    }

    checkReferralCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const referralCode = urlParams.get('ref');
        
        if (referralCode && !localStorage.getItem('hasUsedReferral')) {
            this.processReferral(referralCode);
        }
    }

    processReferral(referralCode) {
        // Mark that user has used a referral
        localStorage.setItem('hasUsedReferral', 'true');
        
        // Add 5 credits to new user
        const currentCredits = parseInt(localStorage.getItem('credits') || '0');
        localStorage.setItem('credits', (currentCredits + 5).toString());
        
        // Store referral info for the referrer
        const referralData = {
            code: referralCode,
            timestamp: Date.now(),
            credited: false
        };
        
        // In a real app, you'd send this to your backend
        // For demo purposes, we'll simulate crediting the referrer
        this.creditReferrer(referralCode);
        
        // Show welcome message
        this.showWelcomeMessage();
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    creditReferrer(referralCode) {
        // In a real application, this would be handled by your backend
        // For demo purposes, we'll simulate it locally
        const referrers = JSON.parse(localStorage.getItem('referrers') || '{}');
        
        if (!referrers[referralCode]) {
            referrers[referralCode] = {
                referrals: 0,
                credits: 0
            };
        }
        
        referrers[referralCode].referrals += 1;
        referrers[referralCode].credits += 10;
        
        localStorage.setItem('referrers', JSON.stringify(referrers));
        
        // If this is the current user's referral code, update their stats
        const currentUserCode = this.generateReferralCode();
        if (referralCode === currentUserCode) {
            const currentCredits = parseInt(localStorage.getItem('credits') || '0');
            localStorage.setItem('credits', (currentCredits + 10).toString());
            
            const stats = JSON.parse(localStorage.getItem('referralStats'));
            stats.totalReferrals += 1;
            stats.earnedCredits += 10;
            localStorage.setItem('referralStats', JSON.stringify(stats));
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcomeMessage');
        welcomeMessage.style.display = 'flex';
    }

    bindEvents() {
        // Referral button click
        document.getElementById('referralBtn').addEventListener('click', () => {
            this.showReferralPanel();
        });

        // Close panel
        document.getElementById('closePanel').addEventListener('click', () => {
            this.hideReferralPanel();
        });

        // Close welcome message
        document.getElementById('closeWelcome').addEventListener('click', () => {
            document.getElementById('welcomeMessage').style.display = 'none';
        });

        // Copy referral link
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyReferralLink();
        });

        // Share buttons
        document.querySelectorAll('.share-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareOnPlatform(platform);
            });
        });

        // Close panel when clicking overlay
        document.getElementById('referralOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.hideReferralPanel();
            }
        });
    }

    showReferralPanel() {
        const overlay = document.getElementById('referralOverlay');
        const referralLink = document.getElementById('referralLink');
        
        referralLink.value = this.getReferralLink();
        overlay.classList.add('active');
        
        // Update stats
        this.updateReferralStats();
    }

    hideReferralPanel() {
        document.getElementById('referralOverlay').classList.remove('active');
    }

    copyReferralLink() {
        const referralLink = document.getElementById('referralLink');
        referralLink.select();
        referralLink.setSelectionRange(0, 99999);
        
        navigator.clipboard.writeText(referralLink.value).then(() => {
            const copyBtn = document.getElementById('copyBtn');
            const originalHTML = copyBtn.innerHTML;
            
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalHTML;
                copyBtn.style.background = '';
            }, 2000);
        });
    }

    shareOnPlatform(platform) {
        const referralLink = this.getReferralLink();
        const message = "Join me on NeoBuilder and get 5 free credits! 🎉";
        
        let shareUrl = '';
        
        switch (platform) {
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralLink)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
                break;
            case 'email':
                shareUrl = `mailto:?subject=${encodeURIComponent('Join NeoBuilder!')}&body=${encodeURIComponent(message + '\n\n' + referralLink)}`;
                break;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
        }
    }

    updateUI() {
        // Update credits display
        const credits = localStorage.getItem('credits') || '0';
        document.getElementById('creditsCount').textContent = credits;
    }

    updateReferralStats() {
        const stats = JSON.parse(localStorage.getItem('referralStats'));
        document.getElementById('totalReferrals').textContent = stats.totalReferrals;
        document.getElementById('earnedCredits').textContent = stats.earnedCredits;
    }
}

// Initialize the referral system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ReferralSystem();
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ---------------- Referral System ----------------
class ReferralSystem {
  constructor() {
    this.init();
    this.checkReferralCode();
    this.updateUI();
  }

  init() {
    // Generate unique user ID if not exists
    if (!localStorage.getItem('userId')) {
      localStorage.setItem('userId', this.generateUniqueId());
    }

    // Initialize referral stats
    if (!localStorage.getItem('referralStats')) {
      localStorage.setItem('referralStats', JSON.stringify({
        totalReferrals: 0,
        earnedCredits: 0
      }));
    }

    this.bindEvents();
  }

  generateUniqueId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateReferralCode() {
    const userId = localStorage.getItem('userId');
    return btoa(userId).replace(/[^a-zA-Z0-9]/g, '').substr(0, 8).toUpperCase();
  }

  getReferralLink() {
    const referralCode = this.generateReferralCode();
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?ref=${referralCode}`;
  }

  checkReferralCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && !localStorage.getItem('hasUsedReferral')) {
      this.processReferral(referralCode);
    }
  }

  processReferral(referralCode) {
    // Mark that user has used a referral
    localStorage.setItem('hasUsedReferral', 'true');
    
    // Add 5 credits to new user
    credits += 5;
    localStorage.setItem('aiCredits', credits.toString());
    updateCreditsDisplay();
    
    // Store referral info for the referrer
    const referralData = {
      code: referralCode,
      timestamp: Date.now(),
      credited: false
    };
    
    // In a real app, you'd send this to your backend
    // For demo purposes, we'll simulate crediting the referrer
    this.creditReferrer(referralCode);
    
    // Show welcome message
    this.showWelcomeMessage();
    
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  creditReferrer(referralCode) {
    // In a real application, this would be handled by your backend
    // For demo purposes, we'll simulate it locally
    const referrers = JSON.parse(localStorage.getItem('referrers') || '{}');
    
    if (!referrers[referralCode]) {
      referrers[referralCode] = {
        referrals: 0,
        credits: 0
      };
    }
    
    referrers[referralCode].referrals += 1;
    referrers[referralCode].credits += 10;
    
    localStorage.setItem('referrers', JSON.stringify(referrers));
    
    // If this is the current user's referral code, update their stats
    const currentUserCode = this.generateReferralCode();
    if (referralCode === currentUserCode) {
      credits += 10;
      localStorage.setItem('aiCredits', credits.toString());
      updateCreditsDisplay();
      
      const stats = JSON.parse(localStorage.getItem('referralStats'));
      stats.totalReferrals += 1;
      stats.earnedCredits += 10;
      localStorage.setItem('referralStats', JSON.stringify(stats));
    }
  }

  showWelcomeMessage() {
    welcomeMessage.style.display = 'flex';
  }

  bindEvents() {
    // Referral button click
    referralBtn.addEventListener('click', () => {
      this.showReferralPanel();
    });

    // Mobile referral button click
    mobileReferralBtn.addEventListener('click', () => {
      this.showReferralPanel();
      mobileMenuDropdown.classList.remove('show');
    });

    // Close panel
    closePanel.addEventListener('click', () => {
      this.hideReferralPanel();
    });

    // Close welcome message
    closeWelcome.addEventListener('click', () => {
      welcomeMessage.style.display = 'none';
    });

    // Copy referral link
    copyReferralBtn.addEventListener('click', () => {
      this.copyReferralLink();
    });

    // Share buttons
    document.querySelectorAll('.share-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const platform = e.currentTarget.dataset.platform;
        this.shareOnPlatform(platform);
      });
    });

    // Close panel when clicking overlay
    referralOverlay.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        this.hideReferralPanel();
      }
    });
  }

  showReferralPanel() {
    referralLink.value = this.getReferralLink();
    referralOverlay.classList.add('active');
    
    // Update stats
    this.updateReferralStats();
  }

  hideReferralPanel() {
    referralOverlay.classList.remove('active');
  }

  copyReferralLink() {
    referralLink.select();
    referralLink.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(referralLink.value).then(() => {
      const originalHTML = copyReferralBtn.innerHTML;
      
      copyReferralBtn.innerHTML = '<i class="fa-solid fa-check"></i>';
      copyReferralBtn.style.background = '#10b981';
      
      setTimeout(() => {
        copyReferralBtn.innerHTML = originalHTML;
        copyReferralBtn.style.background = '';
      }, 2000);
      
      showNotification('Referral link copied to clipboard!', 'success');
    });
  }

  shareOnPlatform(platform) {
    const referralLink = this.getReferralLink();
    const message = "Join me on Neo Builder and get 5 free credits! 🎉";
    
    let shareUrl = '';
    
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralLink)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralLink)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent('Join Neo Builder!')}&body=${encodeURIComponent(message + '\n\n' + referralLink)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  }

  updateUI() {
    // Credits are already handled by the existing system
  }

  updateReferralStats() {
    const stats = JSON.parse(localStorage.getItem('referralStats'));
    totalReferrals.textContent = stats.totalReferrals;
    earnedCredits.textContent = stats.earnedCredits;
  }
}

// Initialize the referral system
const referralSystem = new ReferralSystem();

// Add this function to handle file dragging