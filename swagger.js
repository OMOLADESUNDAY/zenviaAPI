// swagger.js
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Zenvia API Documentation",
      version: "1.0.0",
      description: "API documentation for the Zenvia ecommerce backend",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  },
  apis: ["./Routes/*.js"], // <-- Swagger will scan all your route files
};

const swaggerSpec = swaggerJsDoc(options);

export { swaggerUi, swaggerSpec };
