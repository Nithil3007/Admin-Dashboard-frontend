import React, { useState } from 'react';
import { Form, Input, Button, Alert, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { signUp, confirmSignUp, autoSignIn } from 'aws-amplify/auth';

const { Title } = Typography;

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [email, setEmail] = useState('');
  const [form] = Form.useForm();

  const handleSignup = async (values: { email: string; password: string; confirmPassword: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { isSignUpComplete, userId, nextStep } = await signUp({
        username: values.email,
        password: values.password,
        options: {
          userAttributes: {
            email: values.email,
          },
          autoSignIn: true,
        },
      });

      setEmail(values.email);
      
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        setNeedsConfirmation(true);
        message.success('Verification code sent to your email!');
      } else if (isSignUpComplete) {
        message.success('Account created successfully!');
        onSwitchToLogin();
      }
    } catch (err: any) {
      console.error('Error signing up:', err);
      
      if (err.name === 'UsernameExistsException') {
        setError('An account with this email already exists');
      } else if (err.name === 'InvalidPasswordException') {
        setError('Password does not meet requirements');
      } else {
        setError(err.message || 'An error occurred during sign up');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSignup = async (values: { confirmationCode: string }) => {
    setLoading(true);
    setError(null);

    try {
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: values.confirmationCode,
      });

      if (isSignUpComplete) {
        message.success('Email verified successfully!');
        
        // Try to auto sign in
        try {
          await autoSignIn();
          // Navigation is handled by AuthContext
        } catch (autoSignInError) {
          console.log('Auto sign-in failed, redirecting to login');
          onSwitchToLogin();
        }
      }
    } catch (err: any) {
      console.error('Error confirming sign up:', err);
      
      if (err.name === 'CodeMismatchException') {
        setError('Invalid verification code');
      } else if (err.name === 'ExpiredCodeException') {
        setError('Verification code has expired');
      } else {
        setError(err.message || 'An error occurred during verification');
      }
    } finally {
      setLoading(false);
    }
  };

  if (needsConfirmation) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '40px 20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          Verify Your Email
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

        <Alert
          message="Check your email"
          description={`We sent a verification code to ${email}`}
          type="info"
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          name="confirm"
          onFinish={handleConfirmSignup}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="confirmationCode"
            rules={[{ required: true, message: 'Please input the verification code!' }]}
          >
            <Input
              placeholder="Verification Code"
              maxLength={6}
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
              Verify Email
            </Button>
            
            <div style={{ textAlign: 'center' }}>
              <Button type="link" onClick={onSwitchToLogin} style={{ padding: 0 }}>
                Back to login
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '40px 20px' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
        Create Admin Account
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

      <Alert
        message="Password Requirements"
        description="At least 8 characters with uppercase, lowercase, numbers, and special characters"
        type="info"
        style={{ marginBottom: 24 }}
      />

      <Form
        form={form}
        name="signup"
        onFinish={handleSignup}
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
            prefix={<MailOutlined />}
            placeholder="Email"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Please input your password!' },
            { min: 8, message: 'Password must be at least 8 characters!' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Password"
            autoComplete="new-password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={['password']}
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm Password"
            autoComplete="new-password"
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
            Sign Up
          </Button>
          
          <div style={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Button type="link" onClick={onSwitchToLogin} style={{ padding: 0 }}>
              Sign in
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SignupForm;
