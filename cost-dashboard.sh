#!/bin/bash

# Zenny Cost Dashboard
# Displays real-time resource usage and cost estimates

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Cost limits
DAILY_LIMIT=0.20
MONTHLY_LIMIT=6.00
WARNING_THRESHOLD=0.90
SHUTDOWN_THRESHOLD=0.95

# Function to print colored output
print_header() {
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                    ZENNY COST DASHBOARD                      ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo
}

print_section() {
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_cost() {
    echo -e "${PURPLE}[COST]${NC} $1"
}

# Get system memory usage
get_memory_usage() {
    local total_mem=$(free -m | grep '^Mem:' | awk '{print $2}')
    local used_mem=$(free -m | grep '^Mem:' | awk '{print $3}')
    local free_mem=$(free -m | grep '^Mem:' | awk '{print $4}')
    local memory_percent=$(echo "scale=1; $used_mem * 100 / $total_mem" | bc -l)
    
    echo "Total: ${total_mem}MB | Used: ${used_mem}MB | Free: ${free_mem}MB | Usage: ${memory_percent}%"
}

# Get CPU usage
get_cpu_usage() {
    local cpu_percent=$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1)
    echo "${cpu_percent}%"
}

# Get disk usage
get_disk_usage() {
    local disk_percent=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)
    local disk_used=$(df -h / | tail -1 | awk '{print $3}')
    local disk_total=$(df -h / | tail -1 | awk '{print $2}')
    echo "${disk_percent}% (${disk_used}/${disk_total})"
}

# Get bandwidth usage
get_bandwidth_usage() {
    local bytes=$(cat /proc/net/dev | grep eth0 | awk '{print $2 + $10}')
    local gb=$(echo "scale=2; $bytes / (1024*1024*1024)" | bc -l)
    echo "${gb}GB"
}

# Estimate current cost
estimate_cost() {
    local memory_mb=$(free -m | grep '^Mem:' | awk '{print $3}')
    local memory_gb=$(echo "scale=3; $memory_mb / 1024" | bc -l)
    
    # DigitalOcean $6/month plan breakdown (fixed calculation)
    # Base cost includes 1GB RAM, 1 vCPU, 25GB SSD
    local base_hourly_cost=$(echo "0.0089" | bc -l)  # $6/month = $0.0089/hour
    local daily_cost=$(echo "$base_hourly_cost * 24" | bc -l)
    local monthly_cost=$(echo "$daily_cost * 30" | bc -l)
    
    echo "$daily_cost $monthly_cost"
}

# Check PM2 status
get_pm2_status() {
    pm2 status --no-daemon | grep -E "(zenny|online|stopped|error)" || echo "No PM2 processes found"
}

# Check if cost limit exceeded
check_cost_limit() {
    if [ -f "/var/www/zenny/COST_LIMIT_EXCEEDED" ]; then
        local content=$(cat /var/www/zenny/COST_LIMIT_EXCEEDED)
        print_error "COST LIMIT EXCEEDED: $content"
        return 1
    else
        print_status "No cost limit exceeded"
        return 0
    fi
}

# Check monitoring logs
check_monitoring_logs() {
    local log_dir="/var/log/zenny"
    
    if [ -d "$log_dir" ]; then
        echo "Recent monitoring activity:"
        if [ -f "$log_dir/resource-monitor.log" ]; then
            echo -e "${YELLOW}Resource Monitor:${NC}"
            tail -3 "$log_dir/resource-monitor.log" 2>/dev/null || echo "No recent logs"
        fi
        
        if [ -f "$log_dir/cost-monitor.log" ]; then
            echo -e "${YELLOW}Cost Monitor:${NC}"
            tail -3 "$log_dir/cost-monitor.log" 2>/dev/null || echo "No recent logs"
        fi
        
        if [ -f "$log_dir/resource-alerts.log" ]; then
            echo -e "${YELLOW}Recent Alerts:${NC}"
            tail -3 "$log_dir/resource-alerts.log" 2>/dev/null || echo "No recent alerts"
        fi
    else
        print_warning "Log directory not found: $log_dir"
    fi
}

# Main dashboard function
show_dashboard() {
    clear
    print_header
    
    # System Resources
    print_section "SYSTEM RESOURCES"
    echo -e "${GREEN}Memory Usage:${NC} $(get_memory_usage)"
    echo -e "${GREEN}CPU Usage:${NC} $(get_cpu_usage)"
    echo -e "${GREEN}Disk Usage:${NC} $(get_disk_usage)"
    echo -e "${GREEN}Bandwidth Used:${NC} $(get_bandwidth_usage)"
    echo
    
    # Cost Estimation
    print_section "COST ESTIMATION"
    local cost_data=$(estimate_cost)
    local daily_cost=$(echo $cost_data | awk '{print $1}')
    local monthly_cost=$(echo $cost_data | awk '{print $2}')
    
    print_cost "Daily Cost: \$${daily_cost} (Limit: \$${DAILY_LIMIT})"
    print_cost "Monthly Cost: \$${monthly_cost} (Limit: \$${MONTHLY_LIMIT})"
    print_status "Note: Cost is based on DigitalOcean $6/month plan (1GB RAM, 1 vCPU, 25GB SSD)"
    
    # Check thresholds
    local daily_warning=$(echo "$DAILY_LIMIT * $WARNING_THRESHOLD" | bc -l)
    local daily_shutdown=$(echo "$DAILY_LIMIT * $SHUTDOWN_THRESHOLD" | bc -l)
    local monthly_warning=$(echo "$MONTHLY_LIMIT * $WARNING_THRESHOLD" | bc -l)
    local monthly_shutdown=$(echo "$MONTHLY_LIMIT * $SHUTDOWN_THRESHOLD" | bc -l)
    
    if (( $(echo "$daily_cost > $daily_warning" | bc -l) )); then
        print_warning "Daily cost approaching warning threshold (\$${daily_warning})"
    fi
    
    if (( $(echo "$monthly_cost > $monthly_warning" | bc -l) )); then
        print_warning "Monthly cost approaching warning threshold (\$${monthly_warning})"
    fi
    echo
    
    # PM2 Status
    print_section "PM2 PROCESS STATUS"
    get_pm2_status
    echo
    
    # Cost Limit Check
    print_section "COST LIMIT STATUS"
    check_cost_limit
    echo
    
    # Monitoring Status
    print_section "MONITORING STATUS"
    check_monitoring_logs
    echo
    
    # Resource Limits Summary
    print_section "RESOURCE LIMITS SUMMARY"
    echo -e "${GREEN}Memory Alert:${NC} 90% (900MB) | ${GREEN}Shutdown:${NC} 95% (950MB)"
    echo -e "${GREEN}CPU Alert:${NC} 90% | ${GREEN}Shutdown:${NC} 95%"
    echo -e "${GREEN}Disk Alert:${NC} 90% (22.5GB) | ${GREEN}Shutdown:${NC} 95% (23.75GB)"
    echo -e "${GREEN}Bandwidth Alert:${NC} 900GB | ${GREEN}Shutdown:${NC} 950GB"
    echo -e "${GREEN}Cost Alert:${NC} \$${monthly_warning} | ${GREEN}Shutdown:${NC} \$${monthly_shutdown}"
    echo
    
    # Footer
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║  Last Updated: $(date '+%Y-%m-%d %H:%M:%S')                    ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
}

# Check if bc is installed
if ! command -v bc &> /dev/null; then
    print_error "bc command not found. Installing..."
    apt update && apt install -y bc
fi

# Show dashboard
show_dashboard
