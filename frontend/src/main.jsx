import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import DashboardLayout from "./layouts/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import AssessmentsPage from "./pages/AssessmentsPage";
import ProjectAssessmentsPage from "./pages/ProjectAssessmentsPage";

const router = createBrowserRouter([
  {
    element: <DashboardLayout />,
    children: [
      { path: "/", element: <DashboardHome /> },
      { path: "/assessments", element: <AssessmentsPage /> }, // keep demo page
      { path: "/projects/:projectId/assessments", element: <ProjectAssessmentsPage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);