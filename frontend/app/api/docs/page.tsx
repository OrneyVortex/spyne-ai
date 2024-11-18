import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function page() {
  return <SwaggerUI url="/api/docs/swagger.json" />;
}
