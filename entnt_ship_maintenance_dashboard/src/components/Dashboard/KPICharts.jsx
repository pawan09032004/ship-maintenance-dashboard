import PropTypes from 'prop-types';
import { useState } from 'react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  LineChart, Line, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from 'recharts';
import { FiInfo } from 'react-icons/fi';
import './KPIStyles.css';

// Custom tooltip component for bar chart
const CustomBarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '1px solid #f3f4f6', 
        borderRadius: '4px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <p className="label" style={{ margin: 0, fontWeight: 600 }}>{`${payload[0].payload.category}`}</p>
        <p className="value" style={{ margin: '5px 0 0', fontSize: '14px' }}>{`Overdue Components: ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip component for pie chart
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '1px solid #f3f4f6', 
        borderRadius: '4px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <p className="label" style={{ margin: 0, fontWeight: 600 }}>{`${payload[0].name}`}</p>
        <p className="value" style={{ margin: '5px 0 0', fontSize: '14px' }}>{`${payload[0].value}% of total jobs`}</p>
      </div>
    );
  }
  return null;
};

// Custom tooltip for line chart
const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ 
        backgroundColor: 'white', 
        padding: '10px', 
        border: '1px solid #f3f4f6', 
        borderRadius: '4px', 
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      }}>
        <p className="label" style={{ margin: 0, fontWeight: 600 }}>{label}</p>
        <p className="value" style={{ margin: '5px 0 0', fontSize: '14px' }}>
          {`${payload[0].value} jobs completed`}
        </p>
      </div>
    );
  }
  return null;
};

// Donut chart for job status
const JobStatusChart = ({ data, compact }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Format label with percentage
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    // If compact mode, don't show labels inside the pie chart
    if (compact) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Handle mouse enter/leave for active sector
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(null);
  };

  return (
    <div className="kpi-chart-card">
      <div className="kpi-chart-header">
        <h3 className="kpi-chart-title">Job Status Distribution</h3>
        <button className="chart-info-button" aria-label="More information">
          <FiInfo size={16} />
        </button>
      </div>
      <div className="kpi-chart-body" style={{ height: compact ? '180px' : '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={compact ? 40 : 60}
              outerRadius={compact ? 60 : 90}
              paddingAngle={3}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              label={renderCustomizedLabel}
              animationDuration={1000}
              animationBegin={200}
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  stroke={activeIndex === index ? '#fff' : 'none'}
                  strokeWidth={activeIndex === index ? 2 : 0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="kpi-chart-legend">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="kpi-legend-item">
            <div className="kpi-legend-dot" style={{ backgroundColor: entry.color }}></div>
            <span>{entry.name} ({entry.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Bar chart for maintenance
const MaintenanceChart = ({ data, compact }) => {
  return (
    <div className="kpi-chart-card">
      <div className="kpi-chart-header">
        <h3 className="kpi-chart-title">Overdue Maintenance by Category</h3>
        <button className="chart-info-button" aria-label="More information">
          <FiInfo size={16} />
        </button>
      </div>
      <div className="kpi-chart-body" style={{ height: compact ? '180px' : '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ 
              top: 20, 
              right: compact ? 10 : 30, 
              left: compact ? 10 : 20, 
              bottom: 5 
            }}
            barSize={compact ? 20 : 40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: compact ? 10 : 12 }}
            />
            <YAxis 
              allowDecimals={false} 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: compact ? 10 : 12 }}
            />
            <Tooltip content={<CustomBarTooltip />} />
            <Bar 
              dataKey="overdue" 
              fill="#EF4444" 
              radius={[4, 4, 0, 0]} 
              animationDuration={1000}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Line chart for jobs completed over time
const JobsCompletedChart = ({ data, compact }) => {
  return (
    <div className="kpi-chart-card">
      <div className="kpi-chart-header">
        <h3 className="kpi-chart-title">Jobs Completed Over Time</h3>
        <button className="chart-info-button" aria-label="More information">
          <FiInfo size={16} />
        </button>
      </div>
      <div className="kpi-chart-body" style={{ height: compact ? '180px' : '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: compact ? 10 : 30,
              left: compact ? 10 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#6B7280', fontSize: compact ? 10 : 12 }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6B7280', fontSize: compact ? 10 : 12 }}
            />
            <Tooltip content={<CustomLineTooltip />} />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: compact ? 3 : 5, fill: '#3B82F6' }}
              activeDot={{ r: compact ? 5 : 8 }}
              animationDuration={1000}
              animationBegin={200}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Main KPI Charts component
const KPICharts = ({ jobStatusData, maintenanceData, jobsCompletedData, compact }) => {
  return (
    <>
      <JobStatusChart data={jobStatusData} compact={compact} />
      <MaintenanceChart data={maintenanceData} compact={compact} />
      <JobsCompletedChart data={jobsCompletedData} compact={compact} />
    </>
  );
};

// PropTypes validation
JobStatusChart.propTypes = {
  data: PropTypes.array.isRequired,
  compact: PropTypes.bool
};

MaintenanceChart.propTypes = {
  data: PropTypes.array.isRequired,
  compact: PropTypes.bool
};

JobsCompletedChart.propTypes = {
  data: PropTypes.array.isRequired,
  compact: PropTypes.bool
};

KPICharts.propTypes = {
  jobStatusData: PropTypes.array.isRequired,
  maintenanceData: PropTypes.array.isRequired,
  jobsCompletedData: PropTypes.array.isRequired,
  compact: PropTypes.bool
};

KPICharts.defaultProps = {
  compact: false
};

export default KPICharts; 