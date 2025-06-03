import PropTypes from 'prop-types';
import { useState } from 'react';
import './KPIStyles.css';

const KPICard = ({ title, value, icon, color, change, changeType, description, compact }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Choose arrow icon based on change direction
  const renderChangeIcon = () => {
    if (!change) return null;
    
    return changeType === 'increase' ? (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    ) : (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
      </svg>
    );
  };
  
  // Format change with + or - sign
  const formatChange = () => {
    if (!change) return '';
    
    const prefix = changeType === 'increase' ? '+' : '-';
    return `${prefix}${change}%`;
  };
  
  // Determine change text color
  const getChangeColor = () => {
    if (!change) return '';
    
    // For overdue maintenance, a decrease is actually good (green)
    if (title === 'Overdue Maintenance') {
      return changeType === 'decrease' ? 'text-green-500' : 'text-red-500';
    }
    
    // For other metrics, an increase is typically good
    return changeType === 'increase' ? 'text-green-500' : 'text-red-500';
  };
  
  return (
    <div 
      className={`kpi-card kpi-${color} ${compact ? 'kpi-compact' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="kpi-card-content">
        <div className="kpi-icon-container">
          <div className={`kpi-icon kpi-icon-${color}`}>
            {icon}
          </div>
        </div>
        <div className="kpi-details">
          <div className="kpi-title">{title}</div>
          <div className="kpi-value-container">
            <div className="kpi-value">{formatNumber(value)}</div>
            {change && (
              <div className={`kpi-change ${getChangeColor()}`}>
                {renderChangeIcon()}
                <span>{formatChange()}</span>
              </div>
            )}
          </div>
          {description && !compact && <div className="kpi-description">{description}</div>}
        </div>
      </div>
      <div className={`kpi-card-overlay kpi-${color}-overlay ${isHovered ? 'active' : ''}`}></div>
    </div>
  );
};

KPICard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  icon: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['blue', 'red', 'amber', 'green']).isRequired,
  change: PropTypes.number,
  changeType: PropTypes.oneOf(['increase', 'decrease']),
  description: PropTypes.string,
  compact: PropTypes.bool
};

KPICard.defaultProps = {
  compact: false
};

export default KPICard; 