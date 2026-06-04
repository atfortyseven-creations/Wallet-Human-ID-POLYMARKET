document.addEventListener('DOMContentLoaded', () => {
    // Artificial delay for telemetry decryption effect
    setTimeout(() => {
        fetchData();
    }, 1200);
});

async function fetchData() {
    try {
        const response = await fetch('https://yields.llama.fi/pools');
        if (!response.ok) throw new Error('Telemetry endpoint unresponsive.');
        const data = await response.json();
        
        // Filter for Morpho Blue on Base
        const pools = data.data.filter(pool => pool.project === 'morpho-blue' && pool.chain === 'Base');
        
        if (pools.length === 0) {
            throw new Error('Zero active liquidity pools identified.');
        }

        // Sort by TVL descending
        pools.sort((a, b) => b.tvlUsd - a.tvlUsd);

        document.getElementById('loading').style.display = 'none';
        
        const statsGrid = document.getElementById('statsGrid');
        const chartContainer = document.getElementById('chartContainer');
        const appFooter = document.getElementById('appFooter');
        
        statsGrid.style.display = 'grid';
        chartContainer.style.display = 'flex';
        appFooter.style.display = 'flex';

        renderStats(pools);
        renderChart(pools);
        
        // Refresh icons
        lucide.createIcons();
    } catch (error) {
        console.error('[Telemetry Error]', error);
        document.getElementById('loading').style.display = 'none';
        const errorEl = document.getElementById('error');
        errorEl.style.display = 'flex';
        errorEl.querySelector('p').textContent = error.message || 'Telemetry Interrupted. Unable to establish connection.';
    }
}

function renderChart(pools) {
    const canvas = document.getElementById('yieldChart');
    const ctx = canvas.getContext('2d');
    
    Chart.defaults.color = '#888888';
    Chart.defaults.font.family = "'Outfit', sans-serif";
    Chart.defaults.borderColor = 'rgba(255,255,255,0.03)';

    // Top 15 pools for institutional visualization
    const displayPools = pools.slice(0, 15);
    const labels = displayPools.map(p => p.symbol.length > 18 ? p.symbol.substring(0,18)+'...' : p.symbol);
    const tvlData = displayPools.map(p => p.tvlUsd);
    const apyData = displayPools.map(p => p.apy);

    // Create High-End Gradients
    const barGradient = ctx.createLinearGradient(0, 0, 0, 450);
    barGradient.addColorStop(0, 'rgba(0, 192, 118, 0.8)');   // System Emerald
    barGradient.addColorStop(1, 'rgba(0, 192, 118, 0.05)');

    const lineGradient = ctx.createLinearGradient(0, 0, 0, 450);
    lineGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');  // Accent Blue
    lineGradient.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Liquidity Grid (TVL)',
                    data: tvlData,
                    backgroundColor: barGradient,
                    borderColor: '#00C076',
                    borderWidth: 1,
                    yAxisID: 'y-tvl',
                    borderRadius: 4,
                    barPercentage: 0.5,
                    hoverBackgroundColor: '#00C076'
                },
                {
                    label: 'Yield Generation (APY)',
                    data: apyData,
                    type: 'line',
                    backgroundColor: lineGradient,
                    borderColor: '#3b82f6',
                    borderWidth: 2,
                    fill: true,
                    pointBackgroundColor: '#030303',
                    pointBorderColor: '#3b82f6',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointHoverBackgroundColor: '#3b82f6',
                    pointHoverBorderColor: '#fff',
                    yAxisID: 'y-apy',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: { size: 12, weight: 600, family: "'Outfit', sans-serif" },
                        color: '#fcfcfc',
                        boxWidth: 8
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(10, 10, 10, 0.95)',
                    titleColor: '#fff',
                    titleFont: { size: 13, weight: 'bold', family: "'JetBrains Mono', monospace" },
                    bodyColor: '#888888',
                    bodyFont: { size: 12, family: "'JetBrains Mono', monospace" },
                    borderColor: 'rgba(0, 192, 118, 0.3)',
                    borderWidth: 1,
                    padding: 16,
                    cornerRadius: 8,
                    displayColors: true,
                    boxPadding: 6,
                    callbacks: {
                        title: function(context) {
                            return 'POOL: ' + context[0].label;
                        },
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label = label.split(' ')[0] + ': '; // Shorten label in tooltip
                            }
                            if (context.datasetIndex === 0) {
                                label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(context.raw);
                            } else {
                                label += context.raw.toFixed(2) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45,
                        font: { size: 10, family: "'JetBrains Mono', monospace" },
                        color: '#555555'
                    }
                },
                'y-tvl': {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'TOTAL VALUE LOCKED (USD)',
                        color: '#00C076',
                        font: { size: 10, weight: 800, letterSpacing: 2, family: "'JetBrains Mono', monospace" }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.02)',
                        drawBorder: false
                    },
                    ticks: {
                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                        color: '#888888',
                        callback: function(value) {
                            if (value >= 1e9) return '$' + (value / 1e9).toFixed(1) + 'B';
                            if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M';
                            if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'K';
                            return '$' + value;
                        }
                    }
                },
                'y-apy': {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'ANNUAL YIELD (APY)',
                        color: '#3b82f6',
                        font: { size: 10, weight: 800, letterSpacing: 2, family: "'JetBrains Mono', monospace" }
                    },
                    grid: {
                        drawOnChartArea: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: { family: "'JetBrains Mono', monospace", size: 10 },
                        color: '#888888',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function renderStats(pools) {
    const statsGrid = document.getElementById('statsGrid');
    
    const totalTvl = pools.reduce((sum, p) => sum + p.tvlUsd, 0);
    const avgApy = pools.reduce((sum, p) => sum + p.apy, 0) / pools.length;
    const highestApyPool = pools.reduce((prev, current) => (prev.apy > current.apy) ? prev : current);
    
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    const formatPercent = (val) => val.toFixed(2) + '%';

    const statsHTML = `
        <div class="stat-card" style="animation-delay: 0.1s">
            <h3>Aggregate Liquidity</h3>
            <div class="value">${formatCurrency(totalTvl)}</div>
        </div>
        <div class="stat-card highlight" style="animation-delay: 0.2s">
            <h3>Apex Yield Signature</h3>
            <div class="value">${formatPercent(highestApyPool.apy)}</div>
            <div class="pool-symbol mt-1"><i data-lucide="target" style="width:12px; height:12px; display:inline-block; margin-right:4px;"></i>${highestApyPool.symbol}</div>
        </div>
        <div class="stat-card" style="animation-delay: 0.3s">
            <h3>Mean Base APY</h3>
            <div class="value">${formatPercent(avgApy)}</div>
        </div>
        <div class="stat-card" style="animation-delay: 0.4s">
            <h3>Active Clusters</h3>
            <div class="value">${pools.length}</div>
        </div>
    `;
    
    statsGrid.innerHTML = statsHTML;
}
