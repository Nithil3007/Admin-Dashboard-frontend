import React, { useState } from 'react';
import { Card, Statistic, Row, Col, Button, message, Space } from 'antd';
import { Pie } from '@ant-design/charts';
import { UserStats, upgradeUserTier } from '@/lib/adminApi';

interface TenantCardProps {
  user: UserStats;
  onUpdate: () => void; // Callback to refresh the data
}

const TenantCard: React.FC<TenantCardProps> = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);

  const handleTierChange = async (tierName: string) => {
    setLoading(true);
    try {
      await upgradeUserTier(user.user_id, tierName);
      message.success(`Successfully changed ${user.full_name}'s tier to ${tierName}.`);
      onUpdate(); // Refresh the dashboard data
    } catch (error) {
      console.error('Failed to change tier:', error);
      message.error('Failed to change tier.');
    } finally {
      setLoading(false);
    }
  };

  const totalRecordings = user.successful_recordings + user.failed_recordings;
  const chartData = [
    { type: 'Successful', value: user.successful_recordings },
    { type: 'Failed', value: user.failed_recordings },
  ];

  const chartConfig = {
    data: chartData,
    angleField: 'value',
    colorField: 'type',
    color: ['#52c41a', '#f5222d'], // green for successful, red for failed
    radius: 0.8,
    innerRadius: 0.6,
    legend: false as const,
    label: {
      offset: '-50%',
      content: (data: { type: string; value: number }) => {
        // Only show the label if the value is greater than 0
        return data.value > 0 ? `${data.value}` : '';
      },
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    interactions: [{ type: 'element-active' }],
    statistic: {
      title: false as const,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: `${totalRecordings}\nTotal`,
      },
    },
  };

  return (
    <Card 
      title={user.full_name}
      style={{ height: '100%' }}
      loading={loading}
      extra={<p>{user.tier_name || 'No Tier'}</p>}
    >
      <p>{user.email}</p>
      <Row gutter={16} align="middle">
        <Col span={12}>
          <Statistic title="Patients" value={user.patient_count} />
          <Statistic title="Successful" value={user.successful_recordings} />
          <Statistic title="Failed" value={user.failed_recordings} />
        </Col>
        <Col span={12}>
          {totalRecordings > 0 ? (
            <Pie {...chartConfig} height={150} />
          ) : (
            <div style={{ textAlign: 'center', color: '#888' }}>No recording data</div>
          )}
        </Col>
      </Row>
      <Space style={{ marginTop: 24 }} wrap>
        {['Free Trial', 'Basic', 'Professional', 'Enterprise'].map(tier => (
          <Button 
            key={tier}
            type={user.tier_name === tier ? 'primary' : 'default'}
            onClick={() => handleTierChange(tier)}
            disabled={user.tier_name === tier}
          >
            {tier}
          </Button>
        ))}
      </Space>
    </Card>
  );
};

export default TenantCard;
