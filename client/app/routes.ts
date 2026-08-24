import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/upload", "routes/upload.tsx"),
  route("/resumes/:id", "routes/resume.tsx"),
] satisfies RouteConfig;
