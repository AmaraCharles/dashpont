// ==================== USER DATA MANAGEMENT ====================

// Initialize user data structure
function initUserData() {
  const existingUser = localStorage.getItem('userData');
  if (!existingUser) {
    const defaultUser = {
      firstName: 'New',
      lastName: 'Port',
      copytrading: '0',
      trader: '',
      condition: ' ',
      kyc: 'unverified',
      email: 'falsepegasus@gmail.com',
      referralCode: 'Eee03F',
      referredUsers: [],
      planHistory: [],
      referredBy: null,
      plan: [],
      country: 'Andorra',
      amountDeposited: 'You are not eligible to view livestream of ongoing trade. Kindly contact your trader or support.',
      profit: 0,
      balance: 0,
      referalBonus: '0',
      transactions: [],
      accounts: {
        eth: { address: '' },
        ltc: { address: '' },
        btc: { address: '' },
        usdt: { address: '' }
      },
      withdrawals: [],
      verified: false,
      isDisabled: false,
      dateJoined: new Date().toISOString(),
      rewards: [
        { id: 'welcome', title: 'Welcome Bonus', description: 'Sign up and verify your account', amount: 25.00, claimed: false },
        { id: 'first-deposit', title: 'First Deposit', description: 'Make your first deposit of $100+', amount: 50.00, claimed: false },
        { id: 'first-trade', title: 'First Trade', description: 'Execute your first trade', amount: 10.00, claimed: false },
        { id: 'weekly-trader', title: 'Weekly Trader', description: 'Complete 10 trades this week', amount: 100.00, claimed: false },
        { id: 'copy-trading', title: 'Copy Trading Master', description: 'Follow 3 master traders', amount: 75.00, claimed: false }
      ],
      copyTradingActive: [],
      activeInvestments: []
    };
    localStorage.setItem('userData', JSON.stringify(defaultUser));
    return defaultUser;
  }
  return JSON.parse(existingUser);
}

// Investment Plans Definition
function getInvestmentPlans() {
  const plans = localStorage.getItem('investmentPlans');
  if (!plans) {
    const defaultPlans = [
      {
        id: 'bronze',
        name: 'Bronze Plan',
        minInvestment: 100,
        maxInvestment: 999,
        dailyProfitRate: 0.02, // 2% daily
        duration: 90, // days
        description: 'Perfect for beginners looking to start their investment journey',
        color: 'hsl(30, 60%, 50%)'
      },
      {
        id: 'silver',
        name: 'Silver Plan',
        minInvestment: 1000,
        maxInvestment: 4999,
        dailyProfitRate: 0.035, // 3.5% daily
        duration: 90,
        description: 'Balanced plan for steady growth and reliable returns',
        color: 'hsl(0, 0%, 70%)'
      },
      {
        id: 'gold',
        name: 'Gold Plan',
        minInvestment: 5000,
        maxInvestment: 9999,
        dailyProfitRate: 0.05, // 5% daily
        duration: 90,
        description: 'Premium plan with high returns for serious investors',
        color: 'hsl(45, 100%, 50%)'
      },
      {
        id: 'platinum',
        name: 'Platinum Plan',
        minInvestment: 10000,
        maxInvestment: 999999,
        dailyProfitRate: 0.075, // 7.5% daily
        duration: 90,
        description: 'Elite plan for maximum profit and exclusive benefits',
        color: 'hsl(195, 70%, 60%)'
      }
    ];
    localStorage.setItem('investmentPlans', JSON.stringify(defaultPlans));
    return defaultPlans;
  }
  return JSON.parse(plans);
}

// Update investment plans
function updateInvestmentPlans(plans) {
  localStorage.setItem('investmentPlans', JSON.stringify(plans));
  apiLog('INVESTMENT_PLANS_UPDATED', { count: plans.length });
}

// Get user data
function getUserData() {
  return JSON.parse(localStorage.getItem('userData') || '{}');
}

// Update user data
function updateUserData(updates) {
  const user = getUserData();
  const updatedUser = { ...user, ...updates };
  localStorage.setItem('userData', JSON.stringify(updatedUser));
  return updatedUser;
}

// API logging function
function apiLog(action, data) {
  const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
  logs.push({
    timestamp: new Date().toISOString(),
    action,
    data
  });
  localStorage.setItem('apiLogs', JSON.stringify(logs));
  console.log('API Call:', action, data);
}

// Add transaction
function addTransaction(transaction) {
  const user = getUserData();
  const newTransaction = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    ...transaction
  };
  user.transactions.push(newTransaction);
  updateUserData(user);
  apiLog('TRANSACTION_ADDED', newTransaction);
  return newTransaction;
}

// Add withdrawal
function addWithdrawal(withdrawal) {
  const user = getUserData();
  const newWithdrawal = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    status: 'pending',
    ...withdrawal
  };
  user.withdrawals.push(newWithdrawal);
  updateUserData(user);
  apiLog('WITHDRAWAL_ADDED', newWithdrawal);
  return newWithdrawal;
}

// Claim reward
function claimReward(rewardId) {
  const user = getUserData();
  const reward = user.rewards.find(r => r.id === rewardId);
  if (reward && !reward.claimed) {
    reward.claimed = true;
    user.balance += reward.amount;
    user.referalBonus = (parseFloat(user.referalBonus) + reward.amount).toString();
    updateUserData(user);
    apiLog('REWARD_CLAIMED', { rewardId, amount: reward.amount });
    return true;
  }
  return false;
}

// Add referral
function addReferral(referredEmail) {
  const user = getUserData();
  const newReferral = {
    email: referredEmail,
    dateJoined: new Date().toISOString(),
    status: 'pending',
    earned: 0
  };
  user.referredUsers.push(newReferral);
  updateUserData(user);
  apiLog('REFERRAL_ADDED', newReferral);
  return newReferral;
}

// ==================== INVESTMENT MANAGEMENT ====================

// Purchase investment plan
function purchaseInvestmentPlan(planId, amount) {
  const user = getUserData();
  const plans = getInvestmentPlans();
  const plan = plans.find(p => p.id === planId);
  
  if (!plan) return { success: false, error: 'Plan not found' };
  if (amount < plan.minInvestment) return { success: false, error: `Minimum investment is $${plan.minInvestment}` };
  if (amount > plan.maxInvestment) return { success: false, error: `Maximum investment is $${plan.maxInvestment}` };
  if (user.balance < amount) return { success: false, error: 'Insufficient balance' };
  
  const investment = {
    id: Date.now().toString(),
    planId: plan.id,
    planName: plan.name,
    amount: amount,
    dailyProfitRate: plan.dailyProfitRate,
    duration: plan.duration,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString(),
    daysElapsed: 0,
    totalProfit: 0,
    status: 'active',
    lastProfitUpdate: new Date().toISOString()
  };
  
  user.balance -= amount;
  user.activeInvestments.push(investment);
  updateUserData(user);
  apiLog('INVESTMENT_PURCHASED', investment);
  
  return { success: true, investment };
}

// Calculate and add daily profits
function processDailyProfits() {
  const user = getUserData();
  let totalProfitAdded = 0;
  const now = new Date();
  
  user.activeInvestments.forEach(investment => {
    if (investment.status !== 'active') return;
    
    const lastUpdate = new Date(investment.lastProfitUpdate);
    const daysSinceLastUpdate = Math.floor((now - lastUpdate) / (24 * 60 * 60 * 1000));
    
    if (daysSinceLastUpdate > 0) {
      const dailyProfit = investment.amount * investment.dailyProfitRate;
      const profitToAdd = dailyProfit * daysSinceLastUpdate;
      
      investment.daysElapsed += daysSinceLastUpdate;
      investment.totalProfit += profitToAdd;
      investment.lastProfitUpdate = now.toISOString();
      
      user.balance += profitToAdd;
      user.profit += profitToAdd;
      totalProfitAdded += profitToAdd;
      
      // Check if investment has completed
      if (investment.daysElapsed >= investment.duration) {
        investment.status = 'completed';
        // Return principal at the end
        user.balance += investment.amount;
      }
    }
  });
  
  if (totalProfitAdded > 0) {
    updateUserData(user);
    apiLog('DAILY_PROFITS_PROCESSED', { totalProfit: totalProfitAdded });
  }
  
  return totalProfitAdded;
}

// Get active investments
function getActiveInvestments() {
  const user = getUserData();
  return user.activeInvestments || [];
}

// ==================== THEME & UI ====================

const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'dark';
  html.classList.toggle('dark', savedTheme === 'dark');
}

themeToggle.addEventListener('click', () => {
  const isDark = html.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  apiLog('THEME_CHANGED', { theme: isDark ? 'dark' : 'light' });
});

// Sidebar Toggle
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');

sidebarToggle.addEventListener('click', () => {
  sidebar.classList.toggle('collapsed');
});

const sidebarClose = document.getElementById('sidebarClose');
sidebarClose.addEventListener('click', () => {
  sidebar.classList.add('collapsed');
});

// ==================== NAVIGATION ====================

const navLinks = document.querySelectorAll('.nav-link');
const content = document.getElementById('content');

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    
    const page = link.dataset.page;
    loadPage(page);
    apiLog('PAGE_NAVIGATION', { page });
  });
});

function loadPage(page) {
  switch(page) {
    case 'market':
      renderMarketPage();
      break;
    case 'social-trading':
      renderSocialTradingPage();
      break;
    case 'live-stream':
      renderLiveStreamPage();
      break;
    case 'fund-account':
      renderFundAccountPage();
      break;
    case 'profile':
      renderProfilePage();
      break;
    case 'investment':
      renderInvestmentPage();
      break;
    case 'withdrawal':
      renderWithdrawalPage();
      break;
    case 'referrals':
      renderReferralsPage();
      break;
    case 'rewards':
      renderRewardsPage();
      break;
    case 'dashboard':
      renderDashboardPage();
      break;
    case 'investment-plans':
      renderInvestmentPlansPage();
      break;
    case 'admin':
      renderAdminPage();
      break;
    default:
      renderMarketPage();
  }
}

// ==================== STATIC DATA (Only for Master Traders) ====================

const masterTraders = [
  {
    name: 'Ali G',
    level: 'Guru',
    rating: 4,
    trades: 51,
    commission: 30,
    pnl: '+$89000.00',
    profileId: '79697172',
    accountLevel: 5,
    followers: 89,
    watchers: 231,
    profitableTrade: 70
  },
  {
    name: 'Sarah Chen',
    level: 'Expert',
    rating: 5,
    trades: 128,
    commission: 25,
    pnl: '+$142500.00',
    profileId: '84521963',
    accountLevel: 7,
    followers: 234,
    watchers: 512,
    profitableTrade: 85
  },
  {
    name: 'Marcus Rivera',
    level: 'Master',
    rating: 4,
    trades: 89,
    commission: 28,
    pnl: '+$98750.00',
    profileId: '73296847',
    accountLevel: 6,
    followers: 156,
    watchers: 387,
    profitableTrade: 78
  }
];

// ==================== PAGE RENDERERS ====================

function renderDashboardPage() {
  const user = getUserData();
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Dashboard</h1>
      <p class="text-muted">Welcome back, ${user.firstName} ${user.lastName}!</p>
    </div>
    
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Balance</div>
        <div class="stat-value">$${user.balance.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Profit</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${user.profit.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Trades</div>
        <div class="stat-value">${user.transactions.filter(t => t.status === 'active').length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Referral Bonus</div>
        <div class="stat-value">$${parseFloat(user.referalBonus || 0).toFixed(2)}</div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

function renderInvestmentPlansPage() {
  const user = getUserData();
  const plans = getInvestmentPlans();
  
  // Process daily profits on page load
  processDailyProfits();
  
  const plansHTML = plans.map(plan => {
    const totalReturn = plan.dailyProfitRate * plan.duration * 100;
    return `
      <div class="card" style="padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${plan.color};"></div>
              <h3 style="font-size: 1.25rem; font-weight: 600;">${plan.name}</h3>
            </div>
            <p class="text-muted small">${plan.description}</p>
          </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background-color: hsl(var(--muted)); border-radius: 0.375rem;">
          <div>
            <div class="text-muted small">Min Investment</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">$${plan.minInvestment.toLocaleString()}</div>
          </div>
          <div>
            <div class="text-muted small">Max Investment</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">$${plan.maxInvestment.toLocaleString()}</div>
          </div>
          <div>
            <div class="text-muted small">Daily Profit</div>
            <div style="font-weight: 600; color: hsl(var(--chart-2)); margin-top: 0.25rem;">${(plan.dailyProfitRate * 100).toFixed(2)}%</div>
          </div>
          <div>
            <div class="text-muted small">Total Return</div>
            <div style="font-weight: 600; color: hsl(var(--chart-2)); margin-top: 0.25rem;">${totalReturn.toFixed(0)}%</div>
          </div>
          <div>
            <div class="text-muted small">Duration</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${plan.duration} Days</div>
          </div>
          <div>
            <div class="text-muted small">Your Balance</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">$${user.balance.toFixed(2)}</div>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.75rem;">
          <input type="number" id="amount-${plan.id}" class="input" placeholder="Enter amount" min="${plan.minInvestment}" max="${plan.maxInvestment}" style="flex: 1;">
          <button class="btn btn-primary" onclick="handlePurchasePlan('${plan.id}')" style="white-space: nowrap;">Invest Now</button>
        </div>
      </div>
    `;
  }).join('');
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Investment Plans 📈</h1>
      <p class="text-muted">Choose a plan and start earning daily profits for 90 days</p>
    </div>
    
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="card stat-card">
        <div class="stat-label">Current Balance</div>
        <div class="stat-value">$${user.balance.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Investments</div>
        <div class="stat-value">${user.activeInvestments.filter(inv => inv.status === 'active').length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Invested</div>
        <div class="stat-value">$${user.activeInvestments.filter(inv => inv.status === 'active').reduce((sum, inv) => sum + inv.amount, 0).toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Earnings</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${user.activeInvestments.reduce((sum, inv) => sum + inv.totalProfit, 0).toFixed(2)}</div>
      </div>
    </div>
    
    <div style="display: grid; gap: 1rem;">
      ${plansHTML}
    </div>
  `;
  
  content.innerHTML = html;
}

function handlePurchasePlan(planId) {
  const amountInput = document.getElementById(`amount-${planId}`);
  const amount = parseFloat(amountInput.value);
  
  if (!amount || amount <= 0) {
    Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Please enter a valid investment amount', confirmButtonText: 'OK' });
    return;
  }
  
  const result = purchaseInvestmentPlan(planId, amount);
  
  if (result.success) {
    Swal.fire({ 
      icon: 'success', 
      title: 'Investment Activated!', 
      html: `<strong>${result.investment.planName}</strong><br>Amount: $${amount.toFixed(2)}<br>Daily Profit: ${(result.investment.dailyProfitRate * 100).toFixed(2)}%<br>Duration: ${result.investment.duration} days<br><br>Your investment is now active and earning daily profits!`,
      confirmButtonText: 'OK' 
    }).then(() => {
      renderInvestmentPlansPage();
    });
  } else {
    Swal.fire({ icon: 'error', title: 'Investment Failed', text: result.error, confirmButtonText: 'OK' });
  }
}

function renderAdminPage() {
  const user = getUserData();
  const plans = getInvestmentPlans();
  const activeInvestments = user.activeInvestments || [];
  
  // Calculate statistics
  const totalUsers = 1; // We only have one user in localStorage
  const totalInvested = activeInvestments.filter(inv => inv.status === 'active').reduce((sum, inv) => sum + inv.amount, 0);
  const totalProfitPaid = activeInvestments.reduce((sum, inv) => sum + inv.totalProfit, 0);
  const activeInvestmentCount = activeInvestments.filter(inv => inv.status === 'active').length;
  
  const plansTableHTML = plans.map((plan, index) => `
    <tr>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${index + 1}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${plan.color};"></div>
          <strong>${plan.name}</strong>
        </div>
      </td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">$${plan.minInvestment} - $${plan.maxInvestment.toLocaleString()}</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${(plan.dailyProfitRate * 100).toFixed(2)}%</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${plan.duration} days</td>
      <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
        <button class="btn" style="background-color: hsl(var(--destructive)); color: hsl(var(--destructive-foreground)); padding: 0.25rem 0.75rem; font-size: 0.875rem;" onclick="handleDeletePlan('${plan.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
  
  const investmentsTableHTML = activeInvestments.length > 0 ? activeInvestments.map((inv, index) => {
    const daysRemaining = inv.duration - inv.daysElapsed;
    const progress = (inv.daysElapsed / inv.duration) * 100;
    return `
      <tr>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${index + 1}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${inv.planName}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">$${inv.amount.toFixed(2)}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${new Date(inv.startDate).toLocaleDateString()}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">${inv.daysElapsed} / ${inv.duration}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
          <div style="width: 100%; background-color: hsl(var(--muted)); border-radius: 9999px; height: 6px;">
            <div style="width: ${progress}%; background-color: hsl(var(--chart-2)); height: 100%; border-radius: 9999px;"></div>
          </div>
        </td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border)); color: hsl(var(--chart-2));">$${inv.totalProfit.toFixed(2)}</td>
        <td style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border));">
          <span class="badge" style="background-color: ${inv.status === 'active' ? 'hsl(var(--chart-2))' : 'hsl(var(--muted))'}; color: white; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">${inv.status}</span>
        </td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="8" style="padding: 2rem; text-align: center; color: hsl(var(--muted-foreground));">No active investments</td></tr>';
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Admin Panel 🔒</h1>
      <p class="text-muted">Manage investment plans and monitor platform activity</p>
    </div>
    
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="card stat-card">
        <div class="stat-label">Total Users</div>
        <div class="stat-value">${totalUsers}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Investments</div>
        <div class="stat-value">${activeInvestmentCount}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Invested</div>
        <div class="stat-value">$${totalInvested.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Profit Paid</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${totalProfitPaid.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h2 style="font-size: 1.125rem; font-weight: 600;">Quick Actions</h2>
      </div>
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn btn-primary" onclick="handleProcessProfits()">Process Daily Profits</button>
        <button class="btn" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));" onclick="handleAddPlan()">Add New Plan</button>
        <button class="btn" style="background-color: hsl(var(--accent)); color: hsl(var(--accent-foreground));" onclick="handleViewLogs()">View API Logs</button>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 1.5rem; padding: 1.5rem;">
      <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Investment Plans Management</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid hsl(var(--border));">
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">#</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Plan Name</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Investment Range</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Daily Rate</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Duration</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${plansTableHTML}
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="card" style="padding: 1.5rem;">
      <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">All Active Investments</h2>
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid hsl(var(--border));">
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">#</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Plan</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Amount</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Start Date</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Days</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Progress</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Profit</th>
              <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${investmentsTableHTML}
          </tbody>
        </table>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

// Admin Functions
function handleProcessProfits() {
  const totalProfit = processDailyProfits();
  if (totalProfit > 0) {
    Swal.fire({ 
      icon: 'success', 
      title: 'Profits Processed!', 
      html: `Total profit distributed: $${totalProfit.toFixed(2)}<br>User balances have been updated.`,
      confirmButtonText: 'OK' 
    }).then(() => {
      renderAdminPage();
    });
  } else {
    Swal.fire({ icon: 'info', title: 'No Profits to Process', text: 'All investments are up to date.', confirmButtonText: 'OK' });
  }
}

function handleAddPlan() {
  Swal.fire({
    title: 'Add New Investment Plan',
    html: `
      <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left;">
        <input id="plan-name" class="swal2-input" placeholder="Plan Name" style="margin: 0;">
        <input id="plan-min" type="number" class="swal2-input" placeholder="Minimum Investment" style="margin: 0;">
        <input id="plan-max" type="number" class="swal2-input" placeholder="Maximum Investment" style="margin: 0;">
        <input id="plan-rate" type="number" step="0.001" class="swal2-input" placeholder="Daily Rate (e.g. 0.02 for 2%)" style="margin: 0;">
        <input id="plan-color" class="swal2-input" placeholder="Color (e.g. hsl(30, 60%, 50%))" style="margin: 0;">
        <textarea id="plan-desc" class="swal2-textarea" placeholder="Description" style="margin: 0;"></textarea>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Add Plan',
    preConfirm: () => {
      const name = document.getElementById('plan-name').value;
      const min = parseFloat(document.getElementById('plan-min').value);
      const max = parseFloat(document.getElementById('plan-max').value);
      const rate = parseFloat(document.getElementById('plan-rate').value);
      const color = document.getElementById('plan-color').value;
      const desc = document.getElementById('plan-desc').value;
      
      if (!name || !min || !max || !rate || !color || !desc) {
        Swal.showValidationMessage('Please fill all fields');
        return false;
      }
      
      return { name, min, max, rate, color, desc };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      const plans = getInvestmentPlans();
      const newPlan = {
        id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        name: result.value.name,
        minInvestment: result.value.min,
        maxInvestment: result.value.max,
        dailyProfitRate: result.value.rate,
        duration: 90,
        description: result.value.desc,
        color: result.value.color
      };
      plans.push(newPlan);
      updateInvestmentPlans(plans);
      Swal.fire({ icon: 'success', title: 'Plan Added!', text: 'The new investment plan has been created.', confirmButtonText: 'OK' }).then(() => {
        renderAdminPage();
      });
    }
  });
}

function handleDeletePlan(planId) {
  Swal.fire({
    title: 'Delete Plan?',
    text: 'This will permanently delete the investment plan. Existing investments will not be affected.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, delete it',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      const plans = getInvestmentPlans();
      const updatedPlans = plans.filter(p => p.id !== planId);
      updateInvestmentPlans(updatedPlans);
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'The plan has been deleted.', confirmButtonText: 'OK' }).then(() => {
        renderAdminPage();
      });
    }
  });
}

function handleViewLogs() {
  const logs = JSON.parse(localStorage.getItem('apiLogs') || '[]');
  const recentLogs = logs.slice(-20).reverse();
  
  const logsHTML = recentLogs.map(log => `
    <div style="padding: 0.75rem; border-bottom: 1px solid hsl(var(--border)); font-size: 0.875rem;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
        <strong>${log.action}</strong>
        <span class="text-muted small">${new Date(log.timestamp).toLocaleString()}</span>
      </div>
      <pre style="margin: 0; color: hsl(var(--muted-foreground)); font-size: 0.75rem; white-space: pre-wrap;">${JSON.stringify(log.data, null, 2)}</pre>
    </div>
  `).join('');
  
  Swal.fire({
    title: 'Recent API Logs',
    html: `<div style="max-height: 400px; overflow-y: auto; text-align: left;">${logsHTML}</div>`,
    width: '800px',
    confirmButtonText: 'Close'
  });
}

function renderMarketPage() {
  const html = `
    <div>
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Market</h1>
      <p class="text-muted" style="margin-bottom: 1.5rem;">Trade forex, crypto, stocks, and more with real-time data</p>
    </div>
    
    <div class="card" style="padding: 0; margin-bottom: 1.5rem;">
      <div id="tradingview-widget" style="height: 500px;"></div>
    </div>
    
    <div class="tabs">
      <div class="tabs-list">
        <button class="tab active" data-symbol="FX:EURUSD">EUR/USD</button>
        <button class="tab" data-symbol="FX:GBPUSD">GBP/USD</button>
        <button class="tab" data-symbol="BTCUSD">BTC/USD</button>
        <button class="tab" data-symbol="ETHUSD">ETH/USD</button>
        <button class="tab" data-symbol="NASDAQ:AAPL">AAPL</button>
        <button class="tab" data-symbol="NASDAQ:TSLA">TSLA</button>
      </div>
      <div id="symbolInfo" class="card" style="margin-top: 1rem; padding: 1.5rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <div>
            <h3 id="symbolName" style="font-size: 1.25rem; font-weight: 600;">EUR/USD</h3>
            <p class="text-muted small">Real-time chart data from TradingView</p>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="btn btn-buy" onclick="openQuickTrade('buy')">BUY</button>
          <button class="btn btn-sell" onclick="openQuickTrade('sell')">SELL</button>
        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
  
  // Initialize TradingView Widget with current symbol
  let currentSymbol = 'FX:EURUSD';
  loadTradingViewWidget(currentSymbol);
  
  // Tab switching
  const tabs = content.querySelectorAll('.tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentSymbol = tab.dataset.symbol;
      loadTradingViewWidget(currentSymbol);
      document.getElementById('symbolName').textContent = tab.textContent;
      apiLog('MARKET_SYMBOL_CHANGED', { symbol: currentSymbol });
    });
  });
}

function loadTradingViewWidget(symbol) {
  const container = document.getElementById('tradingview-widget');
  container.innerHTML = '';
  
  new TradingView.widget({
    container_id: 'tradingview-widget',
    autosize: true,
    symbol: symbol,
    interval: '15',
    timezone: 'Etc/UTC',
    theme: html.classList.contains('dark') ? 'dark' : 'light',
    style: '1',
    locale: 'en',
    toolbar_bg: '#f1f3f6',
    enable_publishing: false,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    save_image: false,
    studies: [
      'MASimple@tv-basicstudies'
    ]
  });
}

function openQuickTrade(type) {
  const symbolName = document.getElementById('symbolName').textContent;
  const price = 'Market Price'; // TradingView widget shows real-time price
  openTradeModal(symbolName, type.toUpperCase(), price);
}

function renderSocialTradingPage() {
  const user = getUserData();
  const displayName = `${user.firstName}${user.lastName}`.toLowerCase();
  
  const html = `
    <div class="hero-banner">
      <h1 class="hero-title">Welcome, <span class="text-primary">${displayName}</span>!</h1>
      <p style="font-size: 1.125rem;">Social Trading 🔥</p>
    </div>
    
    ${user.copyTradingActive && user.copyTradingActive.length > 0 ? `
      <div class="card" style="margin-bottom: 1.5rem; background-color: hsl(var(--primary) / 0.1); border-color: hsl(var(--primary));">
        <h3 style="font-weight: 600; margin-bottom: 0.5rem;">Active Copy Trading</h3>
        <p class="text-muted small">You are currently copying ${user.copyTradingActive.length} trader(s)</p>
      </div>
    ` : ''}
    
    <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Master Traders</h2>
    <div class="card-grid">
      ${masterTraders.map(trader => `
        <div class="card trader-card">
          <div class="trader-header">
            <div class="trader-avatar" style="background-color: hsl(var(--primary) / 0.2); display: flex; align-items: center; justify-content: center; font-weight: 600; color: hsl(var(--primary))">
              ${trader.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <div class="trader-info">
              <h3>${trader.name}</h3>
              <span class="badge">${trader.level}</span>
            </div>
          </div>
          <div class="trader-rating">
            ${Array(5).fill(0).map((_, i) => `
              <svg class="star ${i < trader.rating ? '' : 'empty'}" viewBox="0 0 24 24">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            `).join('')}
          </div>
          <div class="trader-stats">
            <div>
              <div class="stat-label">Number of trades</div>
              <div class="stat-value">${trader.trades}</div>
            </div>
            <div>
              <div class="stat-label">Commission</div>
              <div class="stat-value">${trader.commission}%</div>
            </div>
          </div>
          <div class="trader-pnl">
            <span style="font-weight: 600;">P&L</span>
            <span class="pnl-value">${trader.pnl}</span>
          </div>
          <button class="btn btn-primary btn-block" onclick='openCopyTradeModal(${JSON.stringify(trader).replace(/'/g, "&apos;")})'>
            Mirror Trade
          </button>
        </div>
      `).join('')}
    </div>
  `;
  
  content.innerHTML = html;
}

function renderLiveStreamPage() {
  const user = getUserData();
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Live Stream 📊🔥</h1>
      <p class="text-muted">Watch professional traders in action</p>
    </div>
    <div class="live-stream-container">
      <div class="video-background" style="background: linear-gradient(45deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);"></div>
      <div class="stream-overlay">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
        <h2>Premium Content</h2>
        <p>${user.amountDeposited}</p>
        <div style="display: flex; gap: 1rem;">
          <button class="btn btn-primary" onclick="Swal.fire({ icon: 'info', title: 'Upgrade Required', text: 'Please contact support to upgrade your account', confirmButtonText: 'OK' })">Contact Support</button>
          <button class="btn" style="background-color: hsl(var(--secondary)); color: hsl(var(--secondary-foreground));" onclick="loadPage('fund-account')">Fund Account</button>
        </div>
      </div>
    </div>
    <div style="margin-top: 2rem;">
      <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Upcoming Sessions</h3>
      <div class="card-grid">
        <div class="card" style="padding: 1.25rem;">
          <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Forex Day Trading</h4>
          <p class="text-muted small" style="margin-bottom: 0.75rem;">Master: Ali G</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted small">Tomorrow, 9:00 AM</span>
            <span class="badge">Premium</span>
          </div>
        </div>
        <div class="card" style="padding: 1.25rem;">
          <h4 style="font-weight: 600; margin-bottom: 0.5rem;">Crypto Swing Trading</h4>
          <p class="text-muted small" style="margin-bottom: 0.75rem;">Master: Sarah Chen</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span class="text-muted small">Tomorrow, 2:00 PM</span>
            <span class="badge">Premium</span>
          </div>
        </div>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

function renderFundAccountPage() {
  const user = getUserData();
  const html = `
    <div class="hero-banner">
      <h1 class="hero-title">Fund Account 💰</h1>
      <p style="font-size: 1rem; opacity: 0.9;">Current Balance: $${user.balance.toFixed(2)}</p>
    </div>
    <div class="card" style="max-width: 42rem;">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Make Deposit</h2>
      <form id="depositForm">
        <div class="form-group">
          <label for="depositWallet">Deposit Channel</label>
          <select id="depositWallet" class="input" required>
            <option value="">Select a Wallet</option>
            <option value="bitcoin">Bitcoin${user.accounts.btc.address ? ' - ' + user.accounts.btc.address.substring(0, 10) + '...' : ''}</option>
            <option value="ethereum">Ethereum${user.accounts.eth.address ? ' - ' + user.accounts.eth.address.substring(0, 10) + '...' : ''}</option>
            <option value="usdt">USDT (TRC20)${user.accounts.usdt.address ? ' - ' + user.accounts.usdt.address.substring(0, 10) + '...' : ''}</option>
            <option value="litecoin">Litecoin${user.accounts.ltc.address ? ' - ' + user.accounts.ltc.address.substring(0, 10) + '...' : ''}</option>
            <option value="bank">Bank Transfer</option>
            <option value="card">Credit/Debit Card</option>
          </select>
        </div>
        <div class="form-group">
          <label for="depositAmount">Amount ($)</label>
          <input type="number" id="depositAmount" class="input" placeholder="Enter Amount ($)" step="0.01" min="10" required>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Submit Deposit Request</button>
      </form>
    </div>
    <div style="text-align: center; margin-top: 2rem; padding-top: 2rem; border-top: 1px solid hsl(var(--border));">
      <p class="text-muted small">COPYRIGHT ©2025 Dashponts, All rights Reserved</p>
    </div>
  `;
  
  content.innerHTML = html;
  
  document.getElementById('depositForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const wallet = document.getElementById('depositWallet').value;
    const amount = parseFloat(document.getElementById('depositAmount').value);
    
    if (amount < 10) {
      Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum deposit amount is $10', confirmButtonText: 'OK' });
      return;
    }
    
    addTransaction({
      type: 'deposit',
      method: wallet,
      amount: amount,
      status: 'pending'
    });
    
    Swal.fire({ 
      icon: 'success', 
      title: 'Deposit Submitted!', 
      html: `<strong>Method:</strong> ${wallet}<br><strong>Amount:</strong> $${amount.toFixed(2)}<br><br>Your deposit is being processed.`,
      confirmButtonText: 'OK' 
    });
    e.target.reset();
  });
}

function renderProfilePage() {
  const user = getUserData();
  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
  
  const html = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700;">Profile Settings</h1>
      <div class="avatar" style="width: 4rem; height: 4rem; font-size: 1.25rem;">${initials}</div>
    </div>
    <div class="card">
      <p class="text-muted" style="margin-bottom: 1.5rem;">
        We provide innovative strategies and expert insights to secure your future and build a lasting legacy. Your journey to financial greatness begins now!
      </p>
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Personal Data</h2>
      ${user.kyc !== 'verified' ? `
        <div style="padding: 0.75rem; background-color: hsl(var(--destructive) / 0.1); border: 1px solid hsl(var(--destructive) / 0.2); border-radius: 0.5rem; margin-bottom: 1.5rem;">
          <p style="font-size: 0.875rem; color: hsl(var(--destructive)); font-weight: 500;">KYC ${user.kyc === 'unverified' ? 'Required' : user.kyc} - Please update your profile.</p>
        </div>
      ` : ''}
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
        <div>
          <div class="stat-label">Full Name</div>
          <div class="stat-value">${user.firstName} ${user.lastName}</div>
        </div>
        <div>
          <div class="stat-label">Display Name</div>
          <div class="stat-value">${user.firstName}${user.lastName}</div>
        </div>
        <div>
          <div class="stat-label">Email</div>
          <div class="stat-value">${user.email}</div>
        </div>
        <div>
          <div class="stat-label">Country</div>
          <div class="stat-value">${user.country}</div>
        </div>
        <div>
          <div class="stat-label">KYC Status</div>
          <span class="badge" style="background-color: ${user.kyc === 'verified' ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}; color: white;">${user.kyc}</span>
        </div>
        <div>
          <div class="stat-label">Date Joined</div>
          <div class="stat-value">${new Date(user.dateJoined).toLocaleDateString()}</div>
        </div>
        <div>
          <div class="stat-label">Balance</div>
          <div style="font-size: 1.5rem; font-weight: 700;">$${user.balance.toFixed(2)}</div>
        </div>
        <div>
          <div class="stat-label">Total Profit</div>
          <div style="font-size: 1.5rem; font-weight: 700; color: hsl(var(--chart-2));">$${user.profit.toFixed(2)}</div>
        </div>
        <div>
          <div class="stat-label">Verified</div>
          <span class="badge">${user.verified ? 'Yes' : 'No'}</span>
        </div>
      </div>
      <div style="display: flex; gap: 0.75rem; margin-top: 1.5rem;">
        <button class="btn btn-primary" onclick="handleEditProfile()">Edit Profile</button>
        <button class="btn" style="background-color: transparent; border: 1px solid hsl(var(--border)); color: hsl(var(--foreground));" onclick="handleUpdateKYC()">Update KYC</button>
      </div>
    </div>
  `;
  
  content.innerHTML = html;
}

function renderInvestmentPage() {
  const user = getUserData();
  
  // Process daily profits on page load
  processDailyProfits();
  
  const activeTransactions = user.transactions.filter(t => t.status === 'active' || t.type === 'trade');
  const activeInvestments = user.activeInvestments.filter(inv => inv.status === 'active') || [];
  const totalPnL = user.profit;
  
  const investmentsHTML = activeInvestments.length > 0 ? activeInvestments.map(inv => {
    const dailyProfit = inv.amount * inv.dailyProfitRate;
    const progress = (inv.daysElapsed / inv.duration) * 100;
    const daysRemaining = inv.duration - inv.daysElapsed;
    
    return `
      <div class="card" style="padding: 1.5rem; margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <div>
            <h3 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 0.25rem;">${inv.planName}</h3>
            <p class="text-muted small">Started ${new Date(inv.startDate).toLocaleDateString()}</p>
          </div>
          <span class="badge" style="background-color: hsl(var(--chart-2)); color: white; padding: 0.25rem 0.75rem; border-radius: 0.25rem;">Active</span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
          <div>
            <div class="text-muted small">Invested Amount</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">$${inv.amount.toFixed(2)}</div>
          </div>
          <div>
            <div class="text-muted small">Daily Profit</div>
            <div style="font-weight: 600; color: hsl(var(--chart-2)); margin-top: 0.25rem;">$${dailyProfit.toFixed(2)} (${(inv.dailyProfitRate * 100).toFixed(2)}%)</div>
          </div>
          <div>
            <div class="text-muted small">Total Earned</div>
            <div style="font-weight: 600; color: hsl(var(--chart-2)); margin-top: 0.25rem;">$${inv.totalProfit.toFixed(2)}</div>
          </div>
          <div>
            <div class="text-muted small">Days Remaining</div>
            <div style="font-weight: 600; margin-top: 0.25rem;">${daysRemaining} / ${inv.duration}</div>
          </div>
        </div>
        
        <div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="text-muted small">Progress</span>
            <span class="small" style="font-weight: 600;">${progress.toFixed(1)}%</span>
          </div>
          <div style="width: 100%; background-color: hsl(var(--muted)); border-radius: 9999px; height: 8px;">
            <div style="width: ${progress}%; background-color: hsl(var(--chart-2)); height: 100%; border-radius: 9999px; transition: width 0.3s;"></div>
          </div>
        </div>
      </div>
    `;
  }).join('') : '<div class="card"><p class="text-muted" style="text-align: center; padding: 2rem;">No active investment plans. <a href="#investment-plans" style="color: hsl(var(--primary));">Browse available plans</a></p></div>';
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">My Investments</h1>
      <p class="text-muted">Track your active investment plans and trading positions</p>
    </div>
    <div class="stats-grid" style="margin-bottom: 1.5rem;">
      <div class="card stat-card">
        <div class="stat-label">Total Balance</div>
        <div class="stat-value">$${user.balance.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Investments</div>
        <div class="stat-value">${activeInvestments.length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Investment Profit</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${activeInvestments.reduce((sum, inv) => sum + inv.totalProfit, 0).toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total P&L</div>
        <div class="stat-value" style="color: ${totalPnL >= 0 ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'};">${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}</div>
      </div>
    </div>
    
    ${activeInvestments.length > 0 ? `
      <div style="margin-bottom: 1.5rem;">
        <h2 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 1rem;">Active Investment Plans</h2>
        ${investmentsHTML}
      </div>
    ` : investmentsHTML}
    <div class="card">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Transaction History</h2>
      ${user.transactions.length > 0 ? `
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${user.transactions.slice().reverse().map(t => `
                <tr>
                  <td style="font-weight: 600;">${new Date(t.timestamp).toLocaleDateString()}</td>
                  <td><span class="badge">${t.type}</span></td>
                  <td>$${t.amount.toFixed(2)}</td>
                  <td><span class="badge" style="${t.status === 'active' || t.status === 'completed' ? 'background-color: hsl(var(--chart-2)); color: white;' : ''}">${t.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <p class="text-muted" style="text-align: center; padding: 2rem;">No transactions yet. Start trading to see your portfolio!</p>
      `}
    </div>
  `;
  
  content.innerHTML = html;
}

function renderWithdrawalPage() {
  const user = getUserData();
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Withdrawal</h1>
      <p class="text-muted">Request a withdrawal from your account (Available: $${user.balance.toFixed(2)})</p>
    </div>
    <div class="card" style="max-width: 42rem;">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1.5rem;">Make Withdrawal</h2>
      <form id="withdrawalForm">
        <div class="form-group">
          <label for="withdrawalWallet">Withdrawal Method</label>
          <select id="withdrawalWallet" class="input" required>
            <option value="">Select a Method</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="ethereum">Ethereum</option>
            <option value="usdt">USDT (TRC20)</option>
            <option value="litecoin">Litecoin</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>
        <div class="form-group">
          <label for="withdrawalAmount">Amount ($)</label>
          <input type="number" id="withdrawalAmount" class="input" placeholder="Enter Amount ($)" step="0.01" min="10" max="${user.balance}" required>
        </div>
        <div class="form-group">
          <label for="withdrawalAddress">Wallet Address / Bank Account</label>
          <input type="text" id="withdrawalAddress" class="input" placeholder="Enter your wallet address or bank account" required>
        </div>
        <div style="padding: 1rem; background-color: hsl(var(--muted) / 0.5); border-radius: 0.5rem; border: 1px solid hsl(var(--border)); margin-bottom: 1.5rem;">
          <p class="text-muted small">Please note: Withdrawals may take 1-3 business days to process. A processing fee may apply.</p>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Request Withdrawal</button>
      </form>
    </div>
    
    ${user.withdrawals.length > 0 ? `
      <div class="card" style="margin-top: 2rem;">
        <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Withdrawal History</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Method</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${user.withdrawals.slice().reverse().map(w => `
                <tr>
                  <td>${new Date(w.timestamp).toLocaleDateString()}</td>
                  <td>${w.method}</td>
                  <td>$${w.amount.toFixed(2)}</td>
                  <td><span class="badge">${w.status}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : ''}
  `;
  
  content.innerHTML = html;
  
  document.getElementById('withdrawalForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const method = document.getElementById('withdrawalWallet').value;
    const amount = parseFloat(document.getElementById('withdrawalAmount').value);
    const address = document.getElementById('withdrawalAddress').value;
    
    if (amount > user.balance) {
      Swal.fire({ icon: 'error', title: 'Insufficient Balance', text: 'You do not have enough funds for this withdrawal', confirmButtonText: 'OK' });
      return;
    }
    
    if (amount < 10) {
      Swal.fire({ icon: 'warning', title: 'Invalid Amount', text: 'Minimum withdrawal amount is $10', confirmButtonText: 'OK' });
      return;
    }
    
    addWithdrawal({
      method: method,
      amount: amount,
      address: address
    });
    
    Swal.fire({ 
      icon: 'success', 
      title: 'Withdrawal Submitted!', 
      html: `<strong>Method:</strong> ${method}<br><strong>Amount:</strong> $${amount.toFixed(2)}<br><strong>Address:</strong> ${address}<br><br>Your withdrawal is being processed.`,
      confirmButtonText: 'OK' 
    });
    e.target.reset();
    renderWithdrawalPage();
  });
}

function renderReferralsPage() {
  const user = getUserData();
  const activeReferrals = user.referredUsers.filter(r => r.status === 'active');
  const totalEarned = user.referredUsers.reduce((sum, r) => sum + (r.earned || 0), 0);
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Referral Program</h1>
      <p class="text-muted">Earn rewards by inviting friends to Dashpont</p>
    </div>
    
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Referrals</div>
        <div class="stat-value">${user.referredUsers.length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Active Referrals</div>
        <div class="stat-value">${activeReferrals.length}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Earned</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${totalEarned.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="card" style="margin-bottom: 1.5rem;">
      <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Your Referral Code</h2>
      <p class="text-muted" style="margin-bottom: 1rem;">Share this code with your friends. They get a bonus and you earn $50 for each successful referral!</p>
      <div class="referral-code">
        <input type="text" id="referralCodeInput" class="input" value="${user.referralCode}" readonly>
        <button class="copy-btn" onclick="copyReferralCode()">
          <svg style="width: 1rem; height: 1rem; display: inline; vertical-align: middle; margin-right: 0.25rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy
        </button>
      </div>
    </div>
    
    ${user.referredUsers.length > 0 ? `
      <div class="card">
        <h2 style="font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Referral History</h2>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Date Joined</th>
                <th>Status</th>
                <th>Earned</th>
              </tr>
            </thead>
            <tbody>
              ${user.referredUsers.slice().reverse().map(ref => `
                <tr>
                  <td style="font-weight: 600;">${ref.email}</td>
                  <td>${new Date(ref.dateJoined).toLocaleDateString()}</td>
                  <td>
                    <span class="badge" style="${ref.status === 'active' ? 'background-color: hsl(var(--chart-2)); color: white;' : ''}">${ref.status}</span>
                  </td>
                  <td style="font-weight: 600; color: ${ref.earned > 0 ? 'hsl(var(--chart-2))' : 'inherit'};">$${ref.earned.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    ` : `
      <div class="card">
        <p class="text-muted" style="text-align: center; padding: 2rem;">No referrals yet. Share your code and start earning!</p>
      </div>
    `}
  `;
  
  content.innerHTML = html;
}

function renderRewardsPage() {
  const user = getUserData();
  const totalClaimed = user.rewards.filter(r => r.claimed).reduce((sum, r) => sum + r.amount, 0);
  const totalAvailable = user.rewards.filter(r => !r.claimed).reduce((sum, r) => sum + r.amount, 0);
  
  const html = `
    <div style="margin-bottom: 1.5rem;">
      <h1 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Rewards</h1>
      <p class="text-muted">Complete tasks and earn rewards</p>
    </div>
    
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-label">Total Claimed</div>
        <div class="stat-value" style="color: hsl(var(--chart-2));">$${totalClaimed.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Available Rewards</div>
        <div class="stat-value">$${totalAvailable.toFixed(2)}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Total Value</div>
        <div class="stat-value">$${(totalClaimed + totalAvailable).toFixed(2)}</div>
      </div>
    </div>
    
    <div style="display: grid; gap: 1rem;">
      ${user.rewards.map((reward, index) => `
        <div class="reward-card ${reward.claimed ? 'claimed' : ''}">
          <div class="reward-icon">
            ${getRewardIcon(reward.id)}
          </div>
          <div class="reward-info">
            <h3>${reward.title}</h3>
            <p>${reward.description}</p>
          </div>
          <div style="text-align: right;">
            <div class="reward-amount">$${reward.amount.toFixed(2)}</div>
            ${reward.claimed 
              ? '<span class="badge">Claimed</span>' 
              : `<button class="btn btn-primary" style="margin-top: 0.5rem; padding: 0.375rem 0.75rem; font-size: 0.75rem;" onclick="handleClaimReward('${reward.id}', '${reward.title}', ${reward.amount})">Claim</button>`
            }
          </div>
        </div>
      `).join('')}
    </div>
  `;
  
  content.innerHTML = html;
}

function getRewardIcon(type) {
  const icons = {
    'welcome': '<path d="M20 12v10H4V12"></path><path d="M2 7h20v5H2z"></path><line x1="12" y1="22" x2="12" y2="7"></line><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>',
    'first-deposit': '<line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>',
    'first-trade': '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline>',
    'weekly-trader': '<circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>',
    'copy-trading': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[type] || icons['welcome']}</svg>`;
}

// ==================== HELPER FUNCTIONS ====================

function copyReferralCode() {
  const input = document.getElementById('referralCodeInput');
  input.select();
  document.execCommand('copy');
  apiLog('REFERRAL_CODE_COPIED', { code: input.value });
  Swal.fire({ icon: 'success', title: 'Copied!', text: 'Referral code copied to clipboard!', timer: 2000, showConfirmButton: false });
}

function handleClaimReward(rewardId, title, amount) {
  if (claimReward(rewardId)) {
    Swal.fire({ 
      icon: 'success', 
      title: 'Reward Claimed!', 
      html: `<strong>${title}</strong><br>$${amount.toFixed(2)}<br><br>Your new balance has been updated!`,
      confirmButtonText: 'OK' 
    }).then(() => {
      renderRewardsPage();
    });
  } else {
    Swal.fire({ icon: 'error', title: 'Unable to Claim', text: 'This reward may have already been claimed.', confirmButtonText: 'OK' });
  }
}

function handleEditProfile() {
  apiLog('EDIT_PROFILE_CLICKED', {});
  const newFirstName = prompt('Enter your first name:');
  if (newFirstName) {
    updateUserData({ firstName: newFirstName });
    renderProfilePage();
  }
}

function handleUpdateKYC() {
  apiLog('UPDATE_KYC_CLICKED', {});
  Swal.fire({ icon: 'info', title: 'KYC Verification', text: 'Please upload your documents through the secure portal', confirmButtonText: 'OK' });
}

// ==================== MODALS ====================

function openTradeModal(symbol, type, price) {
  const modal = document.getElementById('tradeModal');
  document.getElementById('tradeModalTitle').textContent = `${type} ${symbol}`;
  document.getElementById('tradeModalPrice').textContent = price;
  modal.classList.add('active');
  
  const tradeData = { symbol, type, price };
  document.getElementById('placeTrade').onclick = () => {
    const amount = parseFloat(document.getElementById('tradeAmount').value);
    if (amount) {
      addTransaction({
        type: 'trade',
        symbol: symbol,
        tradeType: type,
        amount: amount,
        price: price,
        status: 'active'
      });
      
      Swal.fire({ 
        icon: 'success', 
        title: 'Order Placed!', 
        html: `<strong>${type} ${symbol}</strong><br>Amount: $${amount.toFixed(2)}<br>Price: ${price}`,
        confirmButtonText: 'OK' 
      });
      modal.classList.remove('active');
      document.getElementById('tradeAmount').value = '';
    }
  };
}

function openCopyTradeModal(trader) {
  const modal = document.getElementById('copyTradeModal');
  const profile = document.getElementById('copyTraderProfile');
  
  profile.innerHTML = `
    <div class="trader-avatar" style="background-color: hsl(var(--primary) / 0.2); display: flex; align-items: center; justify-content: center; font-weight: 600; color: hsl(var(--primary)); border: 2px solid hsl(var(--primary));">
      ${trader.name.split(' ').map(n => n[0]).join('').toUpperCase()}
    </div>
    <div style="flex: 1;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
        <div>
          <h3 style="font-weight: 600; margin-bottom: 0.25rem;">${trader.name}</h3>
          <span class="badge">${trader.level}</span>
        </div>
        <div style="text-align: right;">
          <div class="stat-label">Status</div>
          <div style="display: flex; align-items: center; gap: 0.25rem; font-size: 0.75rem;">
            <div style="width: 0.5rem; height: 0.5rem; border-radius: 50%; background-color: hsl(var(--chart-2));"></div>
            <span>online</span>
          </div>
        </div>
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem; margin-top: 1rem;">
        <div>
          <div class="stat-label">Profile ID</div>
          <div class="stat-value">${trader.profileId}</div>
        </div>
        <div>
          <div class="stat-label">Account Level</div>
          <div class="stat-value">${trader.accountLevel}</div>
        </div>
        <div>
          <div class="stat-label">Followers</div>
          <div class="stat-value">${trader.followers}</div>
        </div>
        <div>
          <div class="stat-label">Watchers</div>
          <div class="stat-value">${trader.watchers}</div>
        </div>
        <div style="grid-column: 1 / -1;">
          <div class="stat-label">Profitable Trade %</div>
          <div class="stat-value">${trader.profitableTrade}%</div>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.add('active');
  
  document.getElementById('startCopyTrade').onclick = () => {
    const amount = parseFloat(document.getElementById('copyAmount').value);
    const duration = parseInt(document.getElementById('copyDuration').value);
    if (amount && duration) {
      const user = getUserData();
      const copyTradeEntry = {
        trader: trader.name,
        amount: amount,
        duration: duration,
        startDate: new Date().toISOString()
      };
      
      if (!user.copyTradingActive) {
        user.copyTradingActive = [];
      }
      user.copyTradingActive.push(copyTradeEntry);
      updateUserData(user);
      
      apiLog('COPY_TRADE_STARTED', copyTradeEntry);
      Swal.fire({ 
        icon: 'success', 
        title: 'Copy Trading Started!', 
        html: `<strong>Trader:</strong> ${trader.name}<br><strong>Amount:</strong> $${amount.toFixed(2)}<br><strong>Duration:</strong> ${duration} days`,
        confirmButtonText: 'OK' 
      });
      modal.classList.remove('active');
      document.getElementById('copyAmount').value = '';
      document.getElementById('copyDuration').value = '';
    }
  };
}

// Close modals
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });
  
  modal.querySelector('.modal-close').addEventListener('click', () => {
    modal.classList.remove('active');
  });
});

// ==================== INITIALIZATION ====================

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initUserData();
  initTheme();
  updateSidebarUserInfo();
  loadPage('market');
});

// Update sidebar with user info
function updateSidebarUserInfo() {
  const user = getUserData();
  const displayName = `${user.firstName}${user.lastName}`;
  const initials = (user.firstName[0] + user.lastName[0]).toUpperCase();
  
  // Update username in sidebar if element exists
  const usernameEl = document.getElementById('sidebarUsername');
  if (usernameEl) usernameEl.textContent = displayName;
  
  // Update avatar if element exists
  const avatarEl = document.getElementById('sidebarAvatar');
  if (avatarEl) avatarEl.textContent = initials;
  
  // Update balance if element exists
  const balanceEl = document.getElementById('sidebarBalance');
  if (balanceEl) balanceEl.textContent = `$${user.balance.toFixed(2)}`;
}
