import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "./store";
import { Provider } from "react-redux";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen.jsx";
import RegisterScreen from "./screens/RegisterScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import InventoryScreen from "./screens/InventoryScreen.jsx";
import RequestedProductsPage from "./screens/RequestedProductPage.jsx";
import ManagementPage from "./screens/ManagmentPage.jsx";
import AddProductPage from "./screens/AddProductPage.jsx";
import EmployeesPage from "./screens/EmployeesPage.jsx";
import SalesPage from "./screens/SalesPage.jsx";
import SummaryPage from "./screens/SummaryPage.jsx";
import ReportPage from "./screens/ReportPage.jsx";
import ShopPage from "./screens/ShopPage.jsx";
import AnalysisPage from "./screens/AnalysisPage.jsx";
import TransferPage from "./screens/TransferPage.jsx";
import StockCard from "./screens/StockCard.jsx";
import ShopCardPage from "./screens/ShopCard.jsx";
import DailySalesPage from "./screens/DailySalesPage.jsx";
import AdjustmentsPage from "./screens/AdjustmentPage.jsx";
import PurchaseAdjustmentPage from "./screens/PurchaseAdjustmentPage.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <HomeScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <ProfileScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/requested"
        element={
          <PrivateRoute>
            <RequestedProductsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <PrivateRoute>
            <SalesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/add-products"
        element={
          <PrivateRoute>
            <AddProductPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/shop"
        element={
          <PrivateRoute>
            <ShopPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <PrivateRoute>
            <EmployeesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/store"
        element={
          <PrivateRoute>
            <InventoryScreen />
          </PrivateRoute>
        }
      />
      <Route
        path="/summary"
        element={
          <PrivateRoute>
            <SummaryPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/report"
        element={
          <PrivateRoute>
            <ReportPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/analysis"
        element={
          <PrivateRoute>
            <AnalysisPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/management"
        element={
          <PrivateRoute>
            <ManagementPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/transfer"
        element={
          <PrivateRoute>
            <TransferPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/stockcard"
        element={
          <PrivateRoute>
            <StockCard />
          </PrivateRoute>
        }
      />
      <Route
        path="/shopcard"
        element={
          <PrivateRoute>
            <ShopCardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/dailysales"
        element={
          <PrivateRoute>
            <DailySalesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/adjustments"
        element={
          <PrivateRoute>
            <AdjustmentsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/purchase-adjustments"
        element={
          <PrivateRoute>
            <PurchaseAdjustmentPage />
          </PrivateRoute>
        }
      />
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </Provider>
);
