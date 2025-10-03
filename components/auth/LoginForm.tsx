import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { signIn } from 'aws-amplify/auth';

const { Title } = Typography;

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToSignup }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    setError(null);

    try {
      await signIn({
        username: values.email,
        password: values.password,
      });
      // Navigation is handled by AuthContext
    } catch (err: any) {
      console.error('Error signing in:', err);
      
      // Handle specific error messages
      if (err.name === 'UserNotFoundException' || err.name === 'NotAuthorizedException') {
        setError('Invalid email or password');
      } else if (err.name === 'UserNotConfirmedException') {
        setError('Please verify your email before signing in');
      } else {
        setError(err.message || 'An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Admin Portal Login
      </Title>

      {error && (
        <Alert
          message={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Please input your password!' }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            block
            style={{ marginBottom: 16 }}
          >
            Sign In
          </Button>
          
          <div style={{ textAlign: 'center' }}>
            Don't have an account?{' '}
            <Button type="link" onClick={onSwitchToSignup} style={{ padding: 0 }}>
              Sign up
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LoginForm;
