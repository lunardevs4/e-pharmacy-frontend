import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import PublicRoute from './PublicRoute'
import SidebarLayout from '@/layouts/SidebarLayout'

// Public Pages
import LandingPage from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import PatientRegister from '@/pages/public/PatientRegister'
import PharmacyRegister from '@/pages/public/PharmacyRegister'
import ForgotPassword from '@/pages/public/ForgotPassword'
import ChangePassword from '@/pages/public/ChangePassword'

// Patient Pages
import PatientDashboard from '@/pages/patient/Dashboard'
import MedicineSearch from '@/pages/patient/MedicineSearch'
import MedicineDetails from '@/pages/patient/MedicineDetails'
import Reservations from '@/pages/patient/Reservations'
import PatientHistory from '@/pages/patient/History'
import PatientNotifications from '@/pages/patient/Notifications'
import PatientProfile from '@/pages/patient/Profile'

// Pharmacy Pages
import PharmacyDashboard from '@/pages/pharmacy/Dashboard'
import PharmacyInventory from '@/pages/pharmacy/Inventory'
import PharmacyReservations from '@/pages/pharmacy/Reservations'
import PharmacyInsuranceClaims from '@/pages/pharmacy/InsuranceClaims'
import PharmacyPatients from '@/pages/pharmacy/Patients'
import PharmacyStaff from '@/pages/pharmacy/StaffManagement'
import PharmacyAudit from '@/pages/pharmacy/AuditTrail'
import PharmacyReports from '@/pages/pharmacy/Reports'
import PharmacySettings from '@/pages/pharmacy/Settings'
import PharmacyNotifications from '@/pages/pharmacy/Notifications'
import PharmacyProfile from '@/pages/pharmacy/Profile'



// Government Pages
import GovernmentDashboard from '@/pages/government/Dashboard'
import PharmacyRegistry from '@/pages/government/PharmacyRegistry'
import MedicineRegistry from '@/pages/government/MedicineRegistry'
import NationalAnalytics from '@/pages/government/NationalAnalytics'
import DistrictAnalytics from '@/pages/government/DistrictAnalytics'
import MedicineAnalytics from '@/pages/government/MedicineAnalytics'
import ProvinceAnalytics from '@/pages/government/ProvinceAnalytics'
import GovernmentCompliance from '@/pages/government/Compliance'
import GovernmentReports from '@/pages/government/Reports'

// Admin Pages
import AdminDashboard from '@/pages/admin/Dashboard'
import AdminUsers from '@/pages/admin/Users'
import AdminMedicines from '@/pages/admin/Medicines'
import AdminRoles from '@/pages/admin/Roles'
import AdminSettings from '@/pages/admin/Settings'
import AdminAuditLogs from '@/pages/admin/AuditLogs'

export default function AppRoutes() {
  return (
    <Routes>
      {/* Unrestricted Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* Public Routes (Guests only, redirects if authenticated) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register/patient" element={<PatientRegister />} />
        <Route path="/register/pharmacy" element={<PharmacyRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ForgotPassword />} />
        <Route path="/success" element={<ForgotPassword />} />
      </Route>

      {/* Auth State Pending Password Enforce Route */}
      <Route path="/change-password" element={<ChangePassword />} />

      {/* Patient Portal */}
      <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
        <Route path="/patient" element={<SidebarLayout />}>
          <Route index element={<PatientDashboard />} />
          <Route path="search" element={<MedicineSearch />} />
          <Route path="details" element={<MedicineDetails />} />
          <Route path="reservations" element={<Reservations />} />
          <Route path="history" element={<PatientHistory />} />
          <Route path="notifications" element={<PatientNotifications />} />
          <Route path="profile" element={<PatientProfile />} />
        </Route>
      </Route>

      {/* Pharmacy Portal */}
      <Route element={<ProtectedRoute allowedRoles={['PHARMACY']} />}>
        <Route path="/pharmacy" element={<SidebarLayout />}>
          <Route index element={<PharmacyDashboard />} />
          <Route path="inventory" element={<PharmacyInventory />} />
          <Route path="reservations" element={<PharmacyReservations />} />
          <Route path="patients" element={<PharmacyPatients />} />
          <Route path="claims" element={<PharmacyInsuranceClaims />} />
          <Route path="staff" element={<PharmacyStaff />} />
          <Route path="audit" element={<PharmacyAudit />} />
          <Route path="reports" element={<PharmacyReports />} />
          <Route path="settings" element={<PharmacySettings />} />
          <Route path="notifications" element={<PharmacyNotifications />} />
          <Route path="profile" element={<PharmacyProfile />} />
        </Route>
      </Route>



      {/* Government Portal */}
      <Route element={<ProtectedRoute allowedRoles={['GOVERNMENT']} />}>
        <Route path="/government" element={<SidebarLayout />}>
          <Route index element={<GovernmentDashboard />} />
          <Route path="pharmacies" element={<PharmacyRegistry />} />
          <Route path="medicines" element={<MedicineRegistry />} />
          <Route path="analytics" element={<NationalAnalytics />} />
          <Route path="districts" element={<DistrictAnalytics />} />
          <Route path="medicine-analytics" element={<MedicineAnalytics />} />
          <Route path="province-analytics" element={<ProvinceAnalytics />} />
          <Route path="compliance" element={<GovernmentCompliance />} />
          <Route path="reports" element={<GovernmentReports />} />
        </Route>
      </Route>

      {/* Admin Portal */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<SidebarLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="medicines" element={<AdminMedicines />} />
          <Route path="roles" element={<AdminRoles />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="audit" element={<AdminAuditLogs />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
