import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/dashboard" element={<HomeScreen />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/register" element={<RegisterScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/requested" element={<RequestedProductsPage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/add-products" element={<AddProductPage />} />
      <Route path="/shop" element={<ShopPage />} />
      <Route path="/employees" element={<EmployeesPage />} />
      <Route path="/store" element={<InventoryScreen />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/report" element={<ReportPage />} />
      <Route path="/analysis" element={<AnalysisPage />} />
      <Route path="/management" element={<ManagementPage />} />
      <Route path="/transfer" element={<TransferPage />} />
      <Route path="/stockcard" element={<StockCard />} />
      <Route path="/shopcard" element={<ShopCardPage />} />
      <Route path="/dailysales" element={<DailySalesPage />} />
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
