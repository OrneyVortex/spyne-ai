// Import dependencies
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// Use dynamic import to avoid SSR issues
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function DocsPage() {
  return (
    <SwaggerUI url="/api/docs/swagger.json" />
  );
}
