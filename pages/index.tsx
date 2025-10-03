import React, { useState, useEffect } from 'react';
import { Row, Col, Input, Pagination, Select, Space, Button, Spin } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { GetStaticProps, NextPage } from 'next';
import { useRouter } from 'next/router';
import TenantCard from '@/components/TenantCard';
import { getTenantStats, UserStats } from '@/lib/adminApi';
import { useAuth } from '@/contexts/AuthContext';

const { Option } = Select;

interface AdminDashboardProps {
  tenants: UserStats[];
}

const AdminDashboard: NextPage<AdminDashboardProps> = ({ tenants }) => {
  const router = useRouter();
  const { isAuthenticated, loading, signOut, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedTier, setSelectedTier] = useState('All');

  useEffect(() => {
    // Redirect to auth page if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/auth/page');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  // Don't render dashboard if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const searchFilteredTenants = tenants.filter(tenant =>
    tenant.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tierFilteredTenants = selectedTier === 'All'
    ? searchFilteredTenants
    : searchFilteredTenants.filter(tenant => tenant.tier_name === selectedTier);

  // Calculate the tenants to display on the current page
  const paginatedTenants = tierFilteredTenants.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setCurrentPage(1); // Reset to the first page when page size changes
  };

  const handleTierChange = (value: string) => {
    setSelectedTier(value);
    setCurrentPage(1); // Reset to the first page when tier changes
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
        <Space>
          <span>Welcome, {user?.username || 'Admin'}</span>
          <Button 
            type="primary" 
            danger 
            icon={<LogoutOutlined />}
            onClick={signOut}
          >
            Logout
          </Button>
        </Space>
      </div>
        
        <Space style={{ marginBottom: 24 }} wrap>
          <Input.Search
            placeholder="Search by name or email"
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: 300 }}
          />
          <Select value={selectedTier} onChange={handleTierChange} style={{ width: 150 }}>
            <Option value="All">All Tiers</Option>
            <Option value="Free Trial">Free Trial</Option>
            <Option value="Basic">Basic</Option>
            <Option value="Professional">Professional</Option>
            <Option value="Enterprise">Enterprise</Option>
          </Select>
        </Space>

      <Row gutter={[16, 16]}>
        {paginatedTenants.map(tenant => (
          <Col key={tenant.user_id} xs={24} sm={12} lg={8}>
            <TenantCard user={tenant} onUpdate={() => router.replace(router.asPath)} />
          </Col>
        ))}
      </Row>

      <Row justify="center" style={{ marginTop: 24 }}>
        <Space>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={tierFilteredTenants.length}
            onChange={setCurrentPage}
            showSizeChanger={false}
          />
          <Select value={pageSize} onChange={handlePageSizeChange}>
            <Option value={5}>5 / page</Option>
            <Option value={10}>10 / page</Option>
          </Select>
        </Space>
      </Row>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const tenants = await getTenantStats();
  return {
    props: {
      tenants,
    },
    revalidate: 60, // Re-generate the page every 60 seconds
  };
};

export default AdminDashboard;
