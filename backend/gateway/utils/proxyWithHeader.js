import proxy from "express-http-proxy";

export const proxyWithHeader = (serviceURL, options = {}) => {
  return proxy(serviceURL, {
    timeout: 120000,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user) {
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;
      }
      return proxyReqOpts;
    },
    ...options,
  });
};