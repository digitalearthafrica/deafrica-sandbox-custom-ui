import { CognitoUserPool } from "amazon-cognito-identity-js";

export function cognitoConfig(cfg) {
  const userPoolId = cfg.userPoolId || cfg.UserPoolId;
  const clientId = cfg.clientId || cfg.ClientId;

  if (!userPoolId || !clientId) {
    throw new Error("Missing Cognito configuration");
  }

  console.log("Using Cognito Config:", { userPoolId, clientId });

  return new CognitoUserPool({
    UserPoolId: userPoolId,
    ClientId: clientId,
  });
}
