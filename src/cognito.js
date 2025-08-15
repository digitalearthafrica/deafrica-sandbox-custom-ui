import { CognitoUserPool } from "amazon-cognito-identity-js";

export function getUserPool(cfg) {
  // cfg = { region, userPoolId, clientId }
  return new CognitoUserPool({
    UserPoolId: cfg.userPoolId,
    ClientId: cfg.clientId
  });
}
