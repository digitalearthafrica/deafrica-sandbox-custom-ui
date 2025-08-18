import { CognitoUserPool } from "amazon-cognito-identity-js";

export function cognitoConfig(cfg) {

  return new CognitoUserPool({
    UserPoolId: cfg.userPoolId,
    ClientId: cfg.clientId
  });

}
