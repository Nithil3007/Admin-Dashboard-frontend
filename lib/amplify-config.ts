import { Amplify, ResourcesConfig } from 'aws-amplify';

const amplifyConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
      userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
    },
  },
};

export const configureAmplify = () => {
  Amplify.configure(amplifyConfig, { ssr: true });
};

export default amplifyConfig;
