const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Crane Services API",
      version: "1.0.0",
      description: "Backend API docs for admin, customer, owner, and driver services."
    },
    servers: [
      {
        url: "/",
        description: "Same origin"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" }
          }
        }
      }
    },
    paths: {
      "/api/health": {
        get: {
          tags: ["System"],
          summary: "Health check",
          responses: { 200: { description: "OK" } }
        }
      },
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "role"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    phone: { type: "string" },
                    password: { type: "string" },
                    role: { type: "string", enum: ["admin", "customer", "owner", "driver"] }
                  }
                }
              }
            }
          },
          responses: { 201: { description: "Created" }, 409: { description: "Email exists" } }
        }
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Logged in" }, 401: { description: "Invalid credentials" } }
        }
      },
      "/api/auth/refresh": {
        post: {
          tags: ["Auth"],
          summary: "Refresh access token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: { refreshToken: { type: "string" } }
                }
              }
            }
          },
          responses: { 200: { description: "Token rotated" }, 401: { description: "Invalid refresh token" } }
        }
      },
      "/api/auth/logout": {
        post: {
          tags: ["Auth"],
          summary: "Revoke refresh token",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["refreshToken"],
                  properties: { refreshToken: { type: "string" } }
                }
              }
            }
          },
          responses: { 200: { description: "Logged out" } }
        }
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Profile" }, 401: { description: "Unauthorized" } }
        }
      },
      "/api/auth/email/request-otp": {
        post: {
          tags: ["Auth"],
          summary: "Request email verification OTP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string", format: "email" } }
                }
              }
            }
          },
          responses: { 200: { description: "OTP requested" } }
        }
      },
      "/api/auth/email/verify-otp": {
        post: {
          tags: ["Auth"],
          summary: "Verify email OTP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "otp"],
                  properties: {
                    email: { type: "string", format: "email" },
                    otp: { type: "string", example: "123456" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Email verified" } }
        }
      },
      "/api/auth/password/request-reset": {
        post: {
          tags: ["Auth"],
          summary: "Request password reset OTP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email"],
                  properties: { email: { type: "string", format: "email" } }
                }
              }
            }
          },
          responses: { 200: { description: "OTP requested" } }
        }
      },
      "/api/auth/password/reset": {
        post: {
          tags: ["Auth"],
          summary: "Reset password with OTP",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "otp", "newPassword"],
                  properties: {
                    email: { type: "string", format: "email" },
                    otp: { type: "string", example: "123456" },
                    newPassword: { type: "string", example: "secret123" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Password reset" } }
        }
      },
      "/api/customer/dashboard": {
        get: {
          tags: ["Customer"],
          security: [{ bearerAuth: [] }],
          summary: "Customer dashboard",
          responses: { 200: { description: "Dashboard data" } }
        }
      },
      "/api/customer/requests": {
        get: {
          tags: ["Customer"],
          security: [{ bearerAuth: [] }],
          summary: "List customer requests",
          responses: { 200: { description: "Request list" } }
        },
        post: {
          tags: ["Customer"],
          security: [{ bearerAuth: [] }],
          summary: "Create request",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["pickupAddress"],
                  properties: {
                    pickupAddress: { type: "string" },
                    dropAddress: { type: "string" },
                    requiredCapacityTons: { type: "number" },
                    scheduledAt: { type: "string", format: "date-time" },
                    notes: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { 201: { description: "Created" } }
        }
      },
      "/api/owner/incoming-requests": {
        get: {
          tags: ["Owner"],
          security: [{ bearerAuth: [] }],
          summary: "Pending incoming requests",
          responses: { 200: { description: "Incoming requests" } }
        }
      },
      "/api/owner/accept-request": {
        post: {
          tags: ["Owner"],
          security: [{ bearerAuth: [] }],
          summary: "Accept request",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["requestId", "priceQuote"],
                  properties: {
                    requestId: { type: "string", format: "uuid" },
                    priceQuote: { type: "number" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Accepted" } }
        }
      },
      "/api/owner/assign-driver": {
        post: {
          tags: ["Owner"],
          security: [{ bearerAuth: [] }],
          summary: "Assign driver",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["requestId", "driverId", "craneRegistration"],
                  properties: {
                    requestId: { type: "string", format: "uuid" },
                    driverId: { type: "string", format: "uuid" },
                    craneRegistration: { type: "string" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Assigned" } }
        }
      },
      "/api/owner/jobs": {
        get: {
          tags: ["Owner"],
          security: [{ bearerAuth: [] }],
          summary: "Owner jobs",
          responses: { 200: { description: "Job list" } }
        }
      },
      "/api/driver/jobs": {
        get: {
          tags: ["Driver"],
          security: [{ bearerAuth: [] }],
          summary: "Driver jobs",
          responses: { 200: { description: "Job list" } }
        }
      },
      "/api/driver/tracking": {
        post: {
          tags: ["Driver"],
          security: [{ bearerAuth: [] }],
          summary: "Write tracking event",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["jobId", "latitude", "longitude"],
                  properties: {
                    jobId: { type: "string", format: "uuid" },
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                    speedKmph: { type: "number" },
                    heading: { type: "number" }
                  }
                }
              }
            }
          },
          responses: { 201: { description: "Tracking saved" } }
        }
      },
      "/api/driver/jobs/{jobId}/status": {
        patch: {
          tags: ["Driver"],
          security: [{ bearerAuth: [] }],
          summary: "Update job status",
          parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["assigned", "en_route", "working", "completed", "cancelled"] }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Status updated" } }
        }
      },
      "/api/admin/overview": {
        get: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "Admin overview",
          responses: { 200: { description: "Overview data" } }
        }
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "List users",
          responses: { 200: { description: "Users" } }
        }
      },
      "/api/admin/users/{userId}/status": {
        patch: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "Enable/disable user",
          parameters: [{ in: "path", name: "userId", required: true, schema: { type: "string", format: "uuid" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["isActive"],
                  properties: { isActive: { type: "boolean" } }
                }
              }
            }
          },
          responses: { 200: { description: "User updated" } }
        }
      },
      "/api/admin/requests": {
        get: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "List requests",
          responses: { 200: { description: "Requests" } }
        }
      },
      "/api/admin/payments": {
        get: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "List payments",
          responses: { 200: { description: "Payments" } }
        }
      },
      "/api/admin/tracking/{jobId}": {
        get: {
          tags: ["Admin"],
          security: [{ bearerAuth: [] }],
          summary: "Tracking history for a job",
          parameters: [{ in: "path", name: "jobId", required: true, schema: { type: "string", format: "uuid" } }],
          responses: { 200: { description: "Tracking events" } }
        }
      },
      "/api/payments/intent": {
        post: {
          tags: ["Payments"],
          security: [{ bearerAuth: [] }],
          summary: "Create Stripe payment intent with idempotency",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["requestId", "amount"],
                  properties: {
                    requestId: { type: "string", format: "uuid" },
                    amount: { type: "number" },
                    currency: { type: "string", example: "inr" }
                  }
                }
              }
            }
          },
          responses: { 200: { description: "Intent created" } }
        }
      },
      "/webhooks/stripe": {
        post: {
          tags: ["Webhooks"],
          summary: "Stripe webhook endpoint",
          responses: { 200: { description: "Webhook processed" } }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
