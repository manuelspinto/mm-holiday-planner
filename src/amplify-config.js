import { Amplify } from 'aws-amplify';
import awsExports from './aws-exports';

let configured = false;
export function configureAmplify() {
  if (configured) return;
  Amplify.configure(awsExports);
  configured = true;
}
